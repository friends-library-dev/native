import React from 'react';
import { View, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { t } from '@friends-library/locale';
import tw from '../lib/tailwind';
import { useSelector, useDispatch, State, Dispatch } from '../state';
import {
  isDownloading,
  isDownloaded,
  downloadProgress,
  downloadAudio,
} from '../state/audio/filesystem';
import { togglePartPlayback } from '../state/audio/playback';
import { AudioPart, EditionId } from '../types';
import { Sans } from './Text';
import { isAudioPartPlaying, audioPartFile } from '../state/selectors/audio-selectors';
import { LANG } from '../env';
import Editions from '../lib/Editions';
import { EDITION_META_MAX_WIDTH } from '../screens/constants';

type CommonProps = {
  part: Pick<AudioPart, 'title'>;
  download: () => any;
  play: () => any;
};

type PartState =
  | 'downloading'
  | 'downloaded'
  | 'queued_for_download'
  | 'playing'
  | 'not_downloaded';

export type Props =
  | (CommonProps & { state: Exclude<PartState, 'downloading'> })
  | (CommonProps & { state: 'downloading'; progress: number });

const winWidth = Dimensions.get(`window`).width;

export const DownloadablePart: React.FC<Props> = (props) => {
  const { part, download, play, state } = props;
  let rightColWidth = 33;
  if (state === `downloading`) {
    rightColWidth = 110;
  } else if (state === `queued_for_download`) {
    rightColWidth = LANG === `en` ? 85 : 96;
  } else if (state === `not_downloaded`) {
    rightColWidth = 60;
  }
  return (
    <TouchableOpacity
      style={tw`border-b border-v1gray-300`}
      onPress={state === `downloaded` ? play : undefined}
    >
      <View
        style={tw.style(`absolute bg-white h-full`, {
          width: props.state === `downloading` ? `${props.progress}%` : `0%`,
        })}
      />
      <View style={tw`p-2 pl-1 pr-6 flex-row`}>
        <Icon
          style={tw.style(
            `mt-1 ml-1 mr-1 text-blue-500`,
            state === `playing` ? `opacity-100` : `opacity-0`,
          )}
          name="play"
          size={9}
        />
        <Sans
          size={14}
          numberOfLines={1}
          style={{ width: Math.min(winWidth, EDITION_META_MAX_WIDTH) - rightColWidth }}
        >
          {part.title}
        </Sans>
        {(state === `queued_for_download` || state === `downloading`) && (
          <Sans size={12} style={tw`italic lowercase text-v1gray-500 ml-4`}>
            {state === `downloading` ? t`Downloading` : t`queued`}
          </Sans>
        )}
        {state === `not_downloaded` && (
          <TouchableOpacity style={tw`items-center pl-2`} onPress={download}>
            <Icon name="cloud-download" size={17} style={tw`text-v1gray-500 p-2 -m-2`} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

export const propSelector: (
  ownProps: ContainerProps,
  dispatch: Dispatch,
) => (state: State) => null | Props = ({ editionId, partIndex }, dispatch) => {
  return (state) => {
    const found = Editions.getAudioPart(editionId, partIndex);
    if (!found) return null;
    const [part] = found;
    const file = audioPartFile(editionId, partIndex, state);
    const common = {
      play: () => dispatch(togglePartPlayback(editionId, partIndex)),
      download: () => dispatch(downloadAudio(editionId, partIndex)),
      part,
    };

    if (isDownloading(file)) {
      return { ...common, state: `downloading`, progress: downloadProgress(file) };
    }

    if (isAudioPartPlaying(editionId, partIndex, state)) {
      return { ...common, state: `playing` };
    }

    if (isDownloaded(file)) {
      return { ...common, state: `downloaded` };
    }
    if (file.queued === true) {
      return { ...common, state: `queued_for_download` };
    }
    return { ...common, state: `not_downloaded` };
  };
};

interface ContainerProps {
  editionId: EditionId;
  partIndex: number;
}

const DownloadablePartContainer: React.FC<ContainerProps> = (ownProps) => {
  const props = useSelector(propSelector(ownProps, useDispatch()));
  if (!props) return null;
  return <DownloadablePart {...props} />;
};

export default DownloadablePartContainer;
