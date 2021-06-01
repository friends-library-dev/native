import React, { useEffect, useRef } from 'react';
import { View, Image, ViewStyle } from 'react-native';
import { useSelector, useDispatch } from '../state';
import { downloadFile } from '../state/filesystem';
import * as select from '../state/selectors/filesystem-selectors';

interface Props {
  resourceId: string;
  layoutWidth: number;
  type: 'square' | 'threeD';
  style?: ViewStyle;
}

const THREE_D_RATIO = 564 / 824;

const CoverImage: React.FC<Props> = ({ resourceId, layoutWidth, style = {}, type }) => {
  const uri = useRef<string>();
  const dispatch = useDispatch();
  const image = useSelector((state) =>
    select.coverImage(type, resourceId, layoutWidth, state),
  );

  useEffect(() => {
    if (image && !image.downloaded) {
      dispatch(downloadFile(image.entity.fsPath, image.networkUrl));
    }
  }, [image?.downloaded, image?.entity?.fsPath, image?.networkUrl]);

  const dims = {
    width: layoutWidth,
    height: layoutWidth / (type === `square` ? 1 : THREE_D_RATIO),
  };

  if (!image) {
    return <View style={{ ...dims, ...style }} />;
  }

  // prevent flicker of image resulting from loading it first
  // with network url, then re-rendering with downloaded uri
  if (!uri.current) {
    uri.current = image.uri;
  }

  return (
    <View style={{ ...dims, ...style }}>
      <Image source={{ uri: uri.current, ...dims }} />
    </View>
  );
};

export default CoverImage;
