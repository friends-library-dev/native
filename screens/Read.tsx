import React, { PureComponent, useEffect, useState } from 'react';
import { View, StatusBar } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { EditionResource, StackParamList, EbookColorScheme } from '../types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Sans } from '../components/Text';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// @ts-ignore
import PrefersHomeIndicatorAutoHidden from 'react-native-home-indicator';

export type Props =
  | { state: `loading` }
  | { state: `error`; reason: 'no_internet' | 'unknown' }
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

class Read extends PureComponent<Props> {
  private htmlRef: React.MutableRefObject<Html | null>;
  private webViewRef: React.RefObject<WebView>;

  public constructor(props: Props) {
    super(props);
    this.webViewRef = React.createRef();
    this.htmlRef = React.createRef();
  }

  public componentDidUpdate(prev: Props) {
    if (this.props.state !== `ready` || prev.state !== `ready`) {
      return;
    }

    const { colorScheme, fontSize, headerHeight, showingHeader } = this.props;

    if (colorScheme !== prev.colorScheme) {
      this.webViewRef.current?.injectJavaScript(
        `window.setColorScheme("${colorScheme}")`,
      );
    }

    if (headerHeight !== prev.headerHeight) {
      this.webViewRef.current?.injectJavaScript(
        `window.setHeaderHeight(${headerHeight})`,
      );
    }

    if (showingHeader !== prev.showingHeader) {
      this.webViewRef.current?.injectJavaScript(
        `window.setShowingHeader(${showingHeader})`,
      );
    }

    if (fontSize !== prev.fontSize) {
      this.webViewRef.current?.injectJavaScript(`window.setFontSize("${fontSize}")`);
    }
  }

  public handleWebViewMessage = (event: WebViewMessageEvent) => {
    if (this.props.state !== `ready`) {
      return;
    }

    const { dispatch, editionId } = this.props;
    const message: Message = JSON.parse(event.nativeEvent.data);

    switch (message.type) {
      case `update_position`:
        return dispatch(
          setEbookPosition({ editionId: editionId, position: message.position }),
        );
      case `click`:
        return dispatch(toggleShowingEbookHeader());
    }
  };

  public closeSettingsPopover = () => {
    console.log(`handle the touch start`);
    if (this.props.state !== `ready` || !this.props.showingSettings) {
      return;
    }
    this.props.dispatch(toggleShowingEbookSettings());
  };

  render() {
    if (this.props.state === `loading`) {
      return (
        <View>
          <Sans>Loading</Sans>
        </View>
      );
    }

    if (this.props.state === `error`) {
      return (
        <View>
          <Sans>Error: {this.props.reason}</Sans>
        </View>
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
          barStyle={colorScheme === `black` ? `light-content` : `dark-content`}
        />
        <WebView
          style={tw`bg-transparent`}
          showsVerticalScrollIndicator={false}
          ref={this.webViewRef}
          decelerationRate="normal"
          onMessage={this.handleWebViewMessage}
          source={{ html: this.htmlRef.current }}
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

const propSelector: PropSelector<OwnProps, SyncProps> = (ownProps, dispatch) => (
  state,
) => {
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
    return <Read {...containerState} />;
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
