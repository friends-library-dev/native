/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EbookColorScheme, EditionResource, StackParamList } from '../types';
import Editions from '../lib/Editions';
import { useSelector, PropSelector, useDispatch } from '../state';
import { readScreenProps } from './read-helpers';
import { setLastEbookEditionId } from '../state/resume';
import Read from './Read';

/**
 * The `html` and `css` props (for rendering the ebook)
 * we have to get _asynchronously_ from the filesystem or network.
 * This type models the rest of the props we can get immediately from state.
 */
export interface SyncProps {
  resource: EditionResource;
  networkConnected: boolean;
  position: number;
  fontSize: number;
  justify: boolean;
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
