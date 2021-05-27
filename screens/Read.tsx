import React, { PureComponent, useEffect, useState } from 'react';
import { View, StatusBar, GestureResponderEvent, Platform } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { EditionResource, StackParamList, EbookColorScheme } from '../types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EbookLoading from '../components/EbookLoading';
import EbookError from '../components/EbookError';
import tw from '../lib/tailwind';
import { useSelector, PropSelector, useDispatch, Dispatch } from '../state';
import * as select from '../state/selectors/edition';
import { readScreenProps } from './read-helpers';
import { wrapHtml, Message } from '../lib/ebook-code';
import { setEbookPosition } from '../state/editions/ebook-position';
import { Html } from '@friends-library/types';
import Popover, { PopoverMode } from 'react-native-popover-view';
import EbookSettings from '../components/EbookSettings';
import { toggleShowingEbookHeader, toggleShowingEbookSettings } from '../state/ephemeral';

// @ts-ignore
import PrefersHomeIndicatorAutoHidden from 'react-native-home-indicator';
import { AnyAction } from 'redux';

export type Props =
  | {
      state: `loading`;
      colorScheme: EbookColorScheme;
    }
  | {
      state: `error`;
      colorScheme: EbookColorScheme;
      reason: 'no_internet' | 'unknown';
    }
  | {
      state: `ready`;
      position: number;
      editionId: string;
      html: string;
      css: string;
      headerHeight: number;
      colorScheme: EbookColorScheme;
      fontSize: number;
      dispatch: Dispatch;
      showingSettings: boolean;
      showingHeader: boolean;
      safeAreaVerticalOffset: number;
    };

interface State {
  showingFootnote: boolean;
  touchStartLocationX: number;
  touchStartLocationY: number;
  touchStartTimestamp: number;
}

class Read extends PureComponent<Props, State> {
  private htmlRef: React.MutableRefObject<Html | null>;
  private intervalRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  private webViewRef: React.RefObject<WebView>;

  public state: State = {
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

    const { colorScheme, fontSize, headerHeight, showingHeader } = this.props;

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
      this.injectJs(`window.setFontSize("${fontSize}")`);
    }
  }

  public handleWebViewMessage: (event: WebViewMessageEvent) => unknown = (event) => {
    if (this.props.state !== `ready`) {
      return;
    }

    const { dispatch, editionId } = this.props;
    const msg: Message = JSON.parse(event.nativeEvent.data);

    switch (msg.type) {
      case `update_position`:
        return dispatch(setEbookPosition({ editionId, position: msg.position }));
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

  public analyzeGesture(
    gestureEvent: GestureResponderEvent,
  ): {
    isSwipe: boolean;
    isHorizontalSwipe: boolean;
    isVerticalSwipe: boolean;
    isRightSwipe: boolean;
    isLeftSwipe: boolean;
    isBackSwipe: boolean;
    isLong: boolean;
  } {
    const { locationX, locationY, timestamp } = gestureEvent.nativeEvent;
    const {
      touchStartLocationX: startX,
      touchStartLocationY: startY,
      touchStartTimestamp: startTimestamp,
    } = this.state;

    const gesture = {
      isSwipe: false,
      isHorizontalSwipe: false,
      isVerticalSwipe: false,
      isRightSwipe: false,
      isLeftSwipe: false,
      isBackSwipe: false,
      isLong: false,
    };

    const SWIPE_THRESHOLD = 5;
    const LONG_THRESHOLD_MS = 150;
    const xDelta = locationX - startX;
    const yDelta = locationY - startY;
    const xAbsDelta = Math.abs(xDelta);
    const yAbsDelta = Math.abs(yDelta);

    if (timestamp - startTimestamp > LONG_THRESHOLD_MS) {
      gesture.isLong = true;
    }

    if (xAbsDelta > SWIPE_THRESHOLD || yAbsDelta > SWIPE_THRESHOLD) {
      gesture.isSwipe = true;
    }

    if (xAbsDelta / yAbsDelta > 4) {
      gesture.isHorizontalSwipe = true;
      const dir = xDelta > 0 ? `isRightSwipe` : `isLeftSwipe`;
      gesture[dir] = true;
    }

    if (yAbsDelta / xAbsDelta > 4) {
      gesture.isVerticalSwipe = true;
    }

    if (gesture.isRightSwipe && startX < 35) {
      gesture.isHorizontalSwipe = true;
      gesture.isRightSwipe = true;
      gesture.isBackSwipe = true;
    }

    return gesture;
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

  render(): JSX.Element {
    if (this.props.state === `loading`) {
      return <EbookLoading colorScheme={this.props.colorScheme} />;
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
      position,
      safeAreaVerticalOffset,
    } = this.props;

    if (this.htmlRef.current === null) {
      this.htmlRef.current = wrapHtml(
        html,
        css,
        colorScheme,
        fontSize,
        position,
        showingHeader,
        headerHeight,
        safeAreaVerticalOffset,
      );
    }
    return (
      <View style={tw`flex-grow bg-ebook-colorscheme-${colorScheme}-bg`}>
        <PrefersHomeIndicatorAutoHidden />
        <StatusBar
          hidden={!showingHeader}
          barStyle={
            Platform.OS === `ios` && colorScheme === `black`
              ? `light-content`
              : `dark-content`
          }
        />
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
  resource: Pick<EditionResource, 'url' | 'revision' | 'id'>;
  networkConnected: boolean;
  position: number;
  fontSize: number;
  colorScheme: EbookColorScheme;
  showingSettings: boolean;
  showingHeader: boolean;
  headerHeight: number;
}

interface OwnProps {
  navigation: StackNavigationProp<StackParamList, 'Read'>;
  route: RouteProp<StackParamList, 'Read'>;
}

const propSelector: PropSelector<OwnProps, SyncProps> = (ownProps) => (state) => {
  const editionId = ownProps.route.params.resourceId;
  const resource = select.editionResource(editionId, state);
  if (!resource) return null;
  return {
    resource,
    colorScheme: state.preferences.ebookColorScheme,
    fontSize: state.preferences.ebookFontSize,
    position: select.ebookPosition(editionId, state),
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
  const [containerState, setContainerState] = useState<ContainerState>({
    state: `loading`,
  });
  const dispatch = useDispatch();
  const props = useSelector(propSelector(ownProps, dispatch));

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
    props?.resource.id,
    props?.resource.url,
    props?.resource.revision,
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
      showingSettings={props!.showingSettings}
      showingHeader={props!.showingHeader}
      headerHeight={props!.headerHeight}
      dispatch={dispatch}
      safeAreaVerticalOffset={insets.top}
    />
  );
};

export default ReadContainer;
