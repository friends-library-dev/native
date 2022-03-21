import React, { PureComponent } from 'react';
import {
  View,
  StatusBar,
  GestureResponderEvent,
  Platform,
  Dimensions,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import Popover, { PopoverMode, Rect, PopoverPlacement } from 'react-native-popover-view';
import { AnyAction } from 'redux';
import * as T from '../types';
import FullscreenLoading from '../components/FullscreenLoading';
import { SEARCH_OVERLAY_MAX_WIDTH } from './constants';
import EbookError from '../components/EbookError';
import tw from '../lib/tailwind';
import { Dispatch } from '../state';
import { wrapHtml, Message } from '../lib/ebook-code';
import * as gesture from '../lib/gesture';
import { setEbookPosition } from '../state/ebook/position';
import EbookSettings from '../components/EbookSettings';
import { toggleShowingEbookHeader, toggleShowingEbookSettings } from '../state/ephemeral';
import ReadFooter from '../components/ReadFooter';
import SearchOverlay from '../components/SearchOverlay';

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
  searching: boolean;
  searchQuery: string;
  searchResults: null | T.SearchResult[];
}

export default class Read extends PureComponent<Props, State> {
  private htmlRef: React.MutableRefObject<string | null>;
  private intervalRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  private webViewRef: React.RefObject<WebView>;

  public state: State = {
    position: undefined,
    showingFootnote: false,
    touchStartLocationX: -999,
    touchStartLocationY: -999,
    touchStartTimestamp: -999,
    searching: false,
    searchQuery: ``,
    searchResults: null,
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
        return this.setState({ searchResults: msg.results });
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

  public toggleSearchOverlay: () => void = () => {
    this.closeSettingsPopover();
    if (!this.state.searching) {
      this.injectJs(`window.clearSearchResults()`);
    }
    this.setState({
      searchResults: null,
      searching: !this.state.searching,
      searchQuery: ``,
    });
  };

  public submitSearchQuery: () => void = () => {
    this.setState({ searchResults: null });
    const sanitizedQuery = this.state.searchQuery.trim().replace(/"/g, `\\"`);
    this.injectJs(`window.requestSearchResults("${sanitizedQuery}")`);
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
              onSearchClick={this.toggleSearchOverlay}
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
        <Popover
          mode={PopoverMode.RN_MODAL}
          onRequestClose={this.toggleSearchOverlay}
          isVisible={this.state.searching}
          animationConfig={{ duration: 0, delay: 0 }}
          popoverStyle={tw`p-4 bg-transparent`}
          backgroundStyle={tw`bg-black/30`}
          placement={PopoverPlacement.BOTTOM}
          from={searchPlacementRect()}
        >
          <SearchOverlay
            query={this.state.searchQuery}
            setQuery={(searchQuery) => this.setState({ searchQuery })}
            colorScheme={colorScheme}
            results={this.state.searchResults}
            onQuerySubmit={this.submitSearchQuery}
            onSelectResult={(result) => {
              this.injectJs(`window.navigateToSearchResult(${JSON.stringify(result)})`);
              this.toggleSearchOverlay();
            }}
          />
        </Popover>
      </View>
    );
  }
}

function searchPlacementRect(): Rect {
  return new Rect(
    (Dimensions.get(`window`).width - SEARCH_OVERLAY_MAX_WIDTH) / 2,
    100,
    SEARCH_OVERLAY_MAX_WIDTH,
    0,
  );
}

/**
 * Because of ios scroll physics/bounce things, you can get negative
 * numbers, or numbers greater than 100% for window locations
 */
function clamp(num: number, lower: number, upper: number): number {
  return Math.max(lower, Math.min(upper, num));
}
