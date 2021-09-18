import React, { useEffect } from 'react';
import { ScrollView, Dimensions, View, Alert } from 'react-native';
import {
  EditionResource,
  Audio as AudioResource,
  StackParamList,
  EditionId,
} from '../types';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { t } from '@friends-library/locale';
import { Sans } from '../components/Text';
import IconButton from '../components/IconButton';
import { ByLine, JustifiedDescription, MainTitle } from '../components/BookParts';
import CoverImage from '../components/CoverImage';
import {
  AudioControls,
  Props as AudioControlsProps,
  propSelector as audioControlsPropSelector,
} from '../components/AudioControls';
import {
  DownloadablePart,
  Props as DownloadablePartProps,
  propSelector as downloadablePartPropSelector,
} from '../components/DownloadablePart';
import tw from '../lib/tailwind';
import { humansize } from '../lib/utils';
import { useSelector, useDispatch, PropSelector } from '../state';
import {
  isDownloading,
  isQueued,
  isDownloaded,
  downloadAllAudios,
  deleteAllAudioParts,
} from '../state/audio/filesystem';
import * as select from '../state/selectors/audio-selectors';
import { LANG } from '../env';
import { isNotNull } from 'x-ts-utils';
import { Audio } from '@friends-library/friends';

interface Props {
  edition: EditionResource;
  audio: AudioResource;
  duration: string;
  unDownloaded: number;
  downloaded: number;
  downloadingActivePart: boolean;
  activePartIndex: number;
  notDownloading: boolean;
  showDownloadAll: boolean;
  showNetworkFail: boolean;
  deleteAllParts: () => unknown;
  downloadAllParts: () => unknown;
  controlsProps: AudioControlsProps;
  downloadablePartProps: DownloadablePartProps[];
}

export const AudioScreen: React.FC<Props> = ({
  edition,
  audio,
  downloaded,
  unDownloaded,
  showDownloadAll,
  activePartIndex,
  downloadingActivePart,
  notDownloading,
  showNetworkFail,
  deleteAllParts,
  downloadAllParts,
  controlsProps,
  downloadablePartProps,
  duration,
}) => {
  useEffect(() => {
    if (showNetworkFail) {
      Alert.alert(t`No internet`, `${t`Unable to download at this time`}.`, [
        { text: `OK` },
      ]);
    }
  }, [showNetworkFail]);

  const isMultipart = audio.parts.length > 1;

  return (
    <ScrollView>
      <CoverImage
        editionId={edition.id}
        layoutWidth={ARTWORK_WIDTH}
        type="square"
        style={{
          marginTop: `8%`,
          alignSelf: `center`,
          elevation: 2,
          shadowColor: `#000`,
          shadowOffset: { width: 3, height: 3 },
          shadowOpacity: 0.5,
          shadowRadius: 5,
        }}
      />
      <View style={tw`flex-grow py-4 px-8 justify-center`}>
        <AudioControls {...controlsProps} />
        {isMultipart && !downloadingActivePart && (
          <View style={tw`flex-row justify-center -mt-4`}>
            <Sans size={13} style={tw`text-v1gray-600`}>
              Part{LANG === `es` ? `e` : ``} {activePartIndex + 1}
              {` `}
              {LANG === `es` ? `de` : `of`} {audio.parts.length}
            </Sans>
          </View>
        )}
      </View>
      <MainTitle title={edition.document.utf8ShortTitle} />
      <ByLine title={edition.document.title} friend={edition.friend.name} />
      {showDownloadAll && (
        <IconButton
          onPress={downloadAllParts}
          icon="cloud-download"
          text={isMultipart ? t`Download all` : t`Download`}
          secondaryText={`(${humansize(unDownloaded)})`}
        />
      )}
      {isMultipart && (
        <View style={tw`flex-row items-center justify-center`}>
          <Sans style={tw`text-center text-v1gray-700 py-3`}>
            {audio.parts.length} {LANG === `en` ? `parts` : `partes`}
          </Sans>
          <Sans style={tw`mx-3 text-blue-300`}>|</Sans>
          <Sans style={tw`text-center text-v1gray-700 py-3`}>{duration}</Sans>
        </View>
      )}
      <JustifiedDescription description={edition.document.shortDescription} />
      {isMultipart && (
        <View style={tw`mb-16`}>
          {downloadablePartProps.map((props, idx) => (
            <DownloadablePart key={`${edition.id}--${idx}`} {...props} />
          ))}
        </View>
      )}
      {downloaded > 0 && notDownloading && (
        <IconButton
          onPress={deleteAllParts}
          icon="trash"
          text={isMultipart ? t`Delete all` : t`Delete`}
          secondaryText={`(${humansize(downloaded)})`}
          textTailwindClass="text-v1gray-700"
          bgTailwindClass="bg-red-200"
          tailwindClass={isMultipart ? `mb-8 -mt-8` : `mb-8 mt-2`}
        />
      )}
    </ScrollView>
  );
};

const ARTWORK_WIDTH = Dimensions.get(`window`).width * 0.8;

interface OwnProps {
  navigation: StackNavigationProp<StackParamList, 'Listen'>;
  route: RouteProp<StackParamList, 'Listen'>;
}

const propSelector: PropSelector<{ editionId: EditionId }, Props> = (
  { editionId },
  dispatch,
) => (state) => {
  const quality = state.preferences.audioQuality;
  const found = select.activeAudioPart(editionId, state);
  const files = select.audioFiles(editionId, state);
  if (!found || !files) return null;

  const [part, edition, audio] = found;
  const controlsProps = audioControlsPropSelector({ editionId }, dispatch)(state);

  if (!controlsProps) return null;
  const activeFile = select.audioPartFile(editionId, part.index, state);
  const size = quality === `HQ` ? `size` : `sizeLq`;
  return {
    audio,
    edition,
    duration: Audio.humanDuration(
      audio.parts.map((p) => p.duration),
      `abbrev`,
      LANG,
    ),
    controlsProps,
    downloadablePartProps: audio.parts
      .map((part, partIndex) =>
        downloadablePartPropSelector({ editionId, partIndex }, dispatch)(state),
      )
      .filter(isNotNull),
    showNetworkFail: state.network.recentFailedAttempt,
    deleteAllParts: () => dispatch(deleteAllAudioParts(editionId)),
    downloadAllParts: () => dispatch(downloadAllAudios(editionId)),
    unDownloaded: audio.parts.reduce((acc, part, idx) => {
      const file = files[idx];
      if (file && !isDownloaded(file)) {
        return acc + part[size];
      }
      return acc;
    }, 0),
    downloaded: audio.parts.reduce((acc, part, idx) => {
      const file = files[idx];
      if (file && isDownloaded(file)) {
        return acc + part[size];
      }
      return acc;
    }, 0),
    downloadingActivePart: isDownloading(activeFile),
    activePartIndex: part.index,
    notDownloading: files.filter((p) => isDownloading(p) || isQueued(p)).length === 0,
    showDownloadAll:
      files.filter((p) => !isDownloading(p) && !isDownloaded(p) && !isQueued(p)).length >
      0,
  };
};

const AudioScreenContainer: React.FC<OwnProps> = ({ route }) => {
  const dispatch = useDispatch();
  const props = useSelector(
    propSelector({ editionId: route.params.editionId }, dispatch),
  );
  if (!props) return null;
  return <AudioScreen {...props} />;
};

export default AudioScreenContainer;
