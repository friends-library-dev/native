/* eslint-disable react-hooks/exhaustive-deps */
import React, { PureComponent, useEffect, useState } from 'react';
import { View, StatusBar, GestureResponderEvent, Platform } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import Popover, { PopoverMode } from 'react-native-popover-view';
import { AnyAction } from 'redux';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as T from '../types';
import FullscreenLoading from '../components/FullscreenLoading';
import EbookError from '../components/EbookError';
import tw from '../lib/tailwind';
import Editions from '../lib/Editions';
import { useSelector, PropSelector, useDispatch, Dispatch } from '../state';
import { readScreenProps } from './read-helpers';
import { wrapHtml, Message } from '../lib/ebook-code';
import * as gesture from '../lib/gesture';
import { setEbookPosition } from '../state/ebook/position';
import EbookSettings from '../components/EbookSettings';
import { toggleShowingEbookHeader, toggleShowingEbookSettings } from '../state/ephemeral';
import { setLastEbookEditionId } from '../state/resume';
import ReadFooter from '../components/ReadFooter';

// @ts-ignore
import PrefersHomeIndicatorAutoHidden from 'react-native-home-indicator';

export type Props =
  | {
      state: `loading`;
      colorScheme: T.EbookColorScheme;
    }
  | {
      state: `error`;
      colorScheme: T.EbookColorScheme;
      reason: 'no_internet' | 'unknown';
    }
  | {
      state: `ready`;
      position: number;
      chapterId?: string;
      editionId: T.EditionId;
      html: string;
      css: string;
      headerHeight: number;
      colorScheme: T.EbookColorScheme;
      fontSize: number;
      justify: boolean;
      dispatch: Dispatch;
      showingSettings: boolean;
      showingHeader: boolean;
      safeAreaTopOffset: number;
      safeAreaBottomOffset: number;
    };

interface State {
  showingFootnote: boolean;
  touchStartLocationX: number;
  touchStartLocationY: number;
  touchStartTimestamp: number;
  position?: number;
}

class Read extends PureComponent<Props, State> {
  private htmlRef: React.MutableRefObject<string | null>;
  private intervalRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  private webViewRef: React.RefObject<WebView>;

  public state: State = {
    position: undefined,
    showingFootnote: false,
    touchStartLocationX: -999,
    touchStartLocationY: -999,
    touchStartTimestamp: -999,
  };

  public constructor(props: Props) {
    super(props);
    this.webViewRef = React.createRef();
    this.htmlRef = React.createRef();
    this.intervalRef = React.createRef();
    this.intervalRef.current = setInterval(() => {
      if (this.state.showingFootnote) {
        return;
      }
      this.injectJs(
        `window.requestPositionUpdateIfChanged && window.requestPositionUpdateIfChanged()`,
      );
    }, 1000);
  }

  public dispatch(action: AnyAction): void {
    if (this.props.state !== `ready`) {
      return;
    }
    this.props.dispatch(action);
  }

  public injectJs(js: string): void {
    this.webViewRef.current?.injectJavaScript(`${js}; true;`);
  }

  public componentWillUnmount(): void {
    if (this.intervalRef.current) {
      clearInterval(this.intervalRef.current);
    }
    if (this.props.state === `ready` && !this.props.showingHeader) {
      this.dispatch(toggleShowingEbookHeader());
    }
  }

  public componentDidUpdate(prev: Props): void {
    if (this.props.state !== `ready` || prev.state !== `ready`) {
      return;
    }

    const { colorScheme, justify, fontSize, headerHeight, showingHeader } = this.props;

    if (colorScheme !== prev.colorScheme) {
      this.injectJs(`window.setColorScheme("${colorScheme}")`);
    }

    if (headerHeight !== prev.headerHeight) {
      this.injectJs(`window.setHeaderHeight(${headerHeight})`);
    }

    if (showingHeader !== prev.showingHeader) {
      this.injectJs(`window.setShowingHeader(${showingHeader})`);
    }

    if (fontSize !== prev.fontSize) {
      this.injectJs(`window.setFontSize(${fontSize})`);
    }

    if (justify !== prev.justify) {
      this.injectJs(`window.setJustify(${justify})`);
    }
  }

  public handleWebViewMessage: (event: WebViewMessageEvent) => unknown = (event) => {
    if (this.props.state !== `ready`) {
      return;
    }

    const { dispatch, editionId } = this.props;
    const msg: Message = JSON.parse(event.nativeEvent.data);

    switch (msg.type) {
      case `search_results`:
        // @TODO
        break;
      case `update_position`: {
        const position = clamp(msg.position, 0, 1);
        this.setState({ position: Math.ceil(position * 100) / 100 });
        return dispatch(setEbookPosition({ editionId, position }));
      }
      case `toggle_header_visibility`:
        return dispatch(toggleShowingEbookHeader());
      case `debug`:
        return console.log(`WEBVIEW DEBUG: ${msg.value}`);
      case `set_footnote_visibility`:
        return this.setState({ showingFootnote: msg.visible });
    }
  };

  public closeSettingsPopover: () => void = () => {
    if (this.props.state !== `ready` || !this.props.showingSettings) {
      return;
    }
    this.props.dispatch(toggleShowingEbookSettings());
  };

  public onWebViewTouchEnd: (e: GestureResponderEvent) => void = (e) => {
    const { isRightSwipe } = this.analyzeGesture(e);
    if (this.state.showingFootnote && isRightSwipe) {
      this.injectJs(`window.dismissFootnote()`);
    }
  };

  public onWebViewTouchStart: (e: GestureResponderEvent) => void = (e) => {
    this.setState({
      touchStartLocationX: e.nativeEvent.locationX,
      touchStartLocationY: e.nativeEvent.locationY,
      touchStartTimestamp: e.nativeEvent.timestamp,
    });
  };

  public analyzeGesture(event: GestureResponderEvent): T.Gesture {
    return gesture.analyze(
      event,
      this.state.touchStartLocationX,
      this.state.touchStartLocationY,
      this.state.touchStartTimestamp,
    );
  }

  public onWebViewTouchCancel: (e: GestureResponderEvent) => void = (e) => {
    const { showingFootnote } = this.state;
    const { isBackSwipe, isRightSwipe, isSwipe, isLong } = this.analyzeGesture(e);
    if (isBackSwipe) {
      return;
    }

    if (showingFootnote && isRightSwipe) {
      return this.injectJs(`window.dismissFootnote()`);
    }

    if (!showingFootnote && !isSwipe && !isLong) {
      this.dispatch(toggleShowingEbookHeader());
    }
  };

  public render(): JSX.Element {
    if (this.props.state === `loading`) {
      return <FullscreenLoading colorScheme={this.props.colorScheme} />;
    }

    if (this.props.state === `error`) {
      return (
        <EbookError colorScheme={this.props.colorScheme} reason={this.props.reason} />
      );
    }

    const {
      showingSettings,
      showingHeader,
      headerHeight,
      html,
      css,
      colorScheme,
      fontSize,
      justify,
      position,
      chapterId,
      safeAreaTopOffset,
      safeAreaBottomOffset,
    } = this.props;

    if (this.htmlRef.current === null) {
      this.htmlRef.current = wrapHtml(
        html,
        css,
        colorScheme,
        fontSize,
        justify,
        position,
        chapterId,
        showingHeader,
        headerHeight,
        safeAreaTopOffset,
      );
    }

    const percentPos = clamp(Math.round((this.state.position ?? position) * 100), 0, 100);

    return (
      <View style={tw`flex-grow bg-ebookcolorscheme-${colorScheme}bg`}>
        <PrefersHomeIndicatorAutoHidden />
        <StatusBar
          hidden={!showingHeader}
          barStyle={
            Platform.OS === `ios` && colorScheme === `black`
              ? `light-content`
              : `dark-content`
          }
        />
        <View style={tw`flex-grow relative`}>
          {showingHeader && !this.state.showingFootnote && (
            <ReadFooter
              colorScheme={colorScheme}
              onScrub={(newPercentComplete) => {
                const newPosition = newPercentComplete / 100;
                this.setState({ position: newPosition });
                this.injectJs(`window.updatePosition(${newPosition})`);
              }}
              safeAreaBottomOffset={safeAreaBottomOffset}
              percentComplete={Math.max(percentPos, 0)}
            />
          )}
          <WebView
            style={tw`bg-transparent`}
            showsVerticalScrollIndicator={false}
            ref={this.webViewRef}
            decelerationRate="normal"
            onTouchStart={this.onWebViewTouchStart}
            onTouchEnd={this.onWebViewTouchEnd}
            onMessage={this.handleWebViewMessage}
            source={{ html: this.htmlRef.current }}
            onTouchCancel={this.onWebViewTouchCancel}
          />
        </View>
        <Popover
          mode={PopoverMode.JS_MODAL}
          onRequestClose={this.closeSettingsPopover}
          isVisible={showingSettings}
          animationConfig={{ duration: 0, delay: 0 }}
          popoverStyle={tw`p-4 bg-transparent`}
          backgroundStyle={tw`bg-transparent`}
        >
          <EbookSettings />
        </Popover>
      </View>
    );
  }
}

/**
 * The `html` and `css` props (for rendering the ebook)
 * we have to get _asynchronously_ from the filesystem or network.
 * This type models the rest of the props we can get immediately from state.
 */
export interface SyncProps {
  resource: T.EditionResource;
  networkConnected: boolean;
  position: number;
  fontSize: number;
  justify: boolean;
  colorScheme: T.EbookColorScheme;
  showingSettings: boolean;
  showingHeader: boolean;
  headerHeight: number;
}

interface OwnProps {
  navigation: StackNavigationProp<T.StackParamList, 'Read'>;
  route: RouteProp<T.StackParamList, 'Read'>;
}

const propSelector: PropSelector<OwnProps, SyncProps> = (ownProps) => (state) => {
  const editionId = ownProps.route.params.editionId;
  const resource = Editions.get(editionId);
  if (!resource) return null;
  return {
    resource,
    colorScheme: state.preferences.ebookColorScheme,
    fontSize: state.preferences.ebookFontSize,
    justify: state.preferences.ebookJustify,
    position: state.ebook.position[editionId] || 0,
    networkConnected: state.network.connected,
    showingSettings: state.ephemeral.showingEbookSettings,
    showingHeader: state.ephemeral.showingEbookHeader,
    headerHeight: state.dimensions.ebookHeaderHeight,
  };
};

type ContainerState =
  | { state: `loading` }
  | { state: `error`; reason: 'no_internet' | 'unknown' }
  | { state: `ready`; html: string; css: string; initialPosition: number };

const ReadContainer: React.FC<OwnProps> = (ownProps) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const props = useSelector(propSelector(ownProps, dispatch));
  const [containerState, setContainerState] = useState<ContainerState>({
    state: `loading`,
  });

  useEffect(() => {
    dispatch(setLastEbookEditionId(ownProps.route.params.editionId));
  }, [dispatch]);

  useEffect(() => {
    if (!props) {
      setContainerState({ state: `error`, reason: `unknown` });
      return;
    }

    const shouldNetworkRetry =
      containerState.state === `error` &&
      containerState.reason === `no_internet` &&
      props.networkConnected === true;

    if (containerState.state === `loading` || shouldNetworkRetry) {
      (async () => {
        const result = await readScreenProps(props.resource, props.networkConnected);
        if (result.success) {
          setContainerState({
            state: `ready`,
            initialPosition: props.position,
            ...result.value,
          });
        } else {
          setContainerState({ state: `error`, reason: result.error });
        }
      })();
    }
  }, [
    containerState.state,
    containerState.state === `error` ? containerState.reason : null,
    props?.networkConnected,
    setContainerState,
    props?.resource,
  ]);

  if (containerState.state !== `ready`) {
    return <Read {...containerState} colorScheme={props?.colorScheme || `white`} />;
  }

  return (
    <Read
      {...containerState}
      editionId={props!.resource.id}
      position={containerState.initialPosition}
      colorScheme={props!.colorScheme}
      fontSize={props!.fontSize}
      justify={props!.justify}
      showingSettings={props!.showingSettings}
      showingHeader={props!.showingHeader}
      headerHeight={props!.headerHeight}
      dispatch={dispatch}
      safeAreaTopOffset={insets.top}
      safeAreaBottomOffset={insets.bottom}
      chapterId={ownProps.route.params.chapterId}
    />
  );
};

export default ReadContainer;

/**
 * Because of ios scroll physics/bounce things, you can get negative
 * numbers, or numbers greater than 100% for window locations
 */
function clamp(num: number, lower: number, upper: number): number {
  return Math.max(lower, Math.min(upper, num));
}
