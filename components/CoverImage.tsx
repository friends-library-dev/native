import React, { useEffect, useRef } from 'react';
import { View, Image, ViewStyle } from 'react-native';
import { useSelector } from '../state';
import { coverImage } from '../lib/cover-images';
import { EditionId } from '../types';
import Service from '../lib/service';
import tw from '../lib/tailwind';
import { EditionEntity } from '../lib/models';
import { LANG } from '../env';

interface Props {
  editionId: EditionId;
  layoutWidth: number;
  type: 'square' | 'threeD';
  style?: ViewStyle;
}

const THREE_D_RATIO = 564 / 824;

const CoverImage: React.FC<Props> = ({ editionId, layoutWidth, style = {}, type }) => {
  const uri = useRef<string>();
  const connected = useSelector((state) => state.network.connected);
  const image = coverImage(type, editionId, layoutWidth);

  useEffect(() => {
    if (image && !image.downloaded && connected) {
      Service.fsDownloadFile(image.entity, image.networkUrl);
    } else if (image && image.downloaded && connected) {
      Service.refreshNetworkFileIfChanged(`background`, image.entity, image.networkUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, !!image, image?.downloaded, image?.entity, image?.networkUrl]);

  const dims = {
    width: layoutWidth,
    height: layoutWidth / (type === `square` ? 1 : THREE_D_RATIO),
  };

  if (!image) {
    return <View style={{ ...dims, ...style, ...bgStyle(type, editionId) }} />;
  }

  // prevent flicker of image resulting from loading it first
  // with network url, then re-rendering with downloaded uri
  if (!uri.current) {
    uri.current = image.uri;
  }

  return (
    <View style={{ ...dims, ...style, ...bgStyle(type, editionId) }}>
      <Image source={{ uri: uri.current, ...dims }} />
    </View>
  );
};

export default CoverImage;

function bgStyle(type: 'square' | 'threeD', editionId: EditionId): Record<string, any> {
  if (type !== `square`) {
    return {};
  }
  return {
    backgroundColor: tw.color(
      {
        original: `flgreen`,
        modernized: `flblue`,
        updated: LANG === `es` ? `flgold` : `flmaroon`,
      }[new EditionEntity(editionId).editionType],
    ),
  };
}
