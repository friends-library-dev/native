import React from 'react';
import { View, TouchableOpacity, Dimensions, ScrollView, Linking } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome';
import { EditionType, LARGEST_THREE_D_COVER_IMAGE_WIDTH } from '@friends-library/types';
import { t } from '@friends-library/locale';
import { Sans, Serif } from '../components/Text';
import { EditionId, StackParamList } from '../types';
import { EditionEntity } from '../lib/models';
import Editions from '../lib/Editions';
import { PropSelector, useDispatch, useSelector } from '../state';
import * as select from '../state/selectors/ebook';
import BookListItem from '../components/BookListItem';
import CoverImage from '../components/CoverImage';
import tw from '../lib/tailwind';
import { ByLine, JustifiedDescription, MainTitle } from '../components/BookParts';
import IconButton from '../components/IconButton';
import { selectEdition } from '../state/ebook/selected-edition';
import { LANG } from '../env';
import { EDITION_META_MAX_WIDTH } from './constants';

interface Props {
  documentTitle: string;
  friendName: string;
  description: string;
  selectEdition(editionType: EditionType): unknown;
  read(): unknown;
  readChapter(chapterId: string): unknown;
  chapters: Array<{
    id: string;
    title: string;
  }>;
  editions: Array<{
    id: string;
    type: EditionType;
    isSelected: boolean;
    isMostModernized: boolean;
  }>;
}

export const Ebook: React.FC<Props> = ({
  read,
  readChapter,
  editions,
  description,
  documentTitle,
  friendName,
  selectEdition,
  chapters,
}) => {
  const selected = editions.find((e) => e.isSelected);
  if (!selected) return null;

  const coverImgWidth = Math.min(
    Dimensions.get(`window`).width * 0.8,
    tw.prefixMatch(`retina`)
      ? LARGEST_THREE_D_COVER_IMAGE_WIDTH / 2
      : LARGEST_THREE_D_COVER_IMAGE_WIDTH,
  );
  return (
    <ScrollView style={tw.style(``, { backgroundColor: `#efefef` })}>
      <View style={tw`pt-4 items-center`}>
        <TouchableOpacity onPress={read}>
          <CoverImage
            // use key to force a re-render when the selected edition changes
            // because of "caching" inherent in the implementation of CoverImage
            key={selected.id}
            type="threeD"
            layoutWidth={coverImgWidth}
            editionId={selected.id}
          />
        </TouchableOpacity>
        <MainTitle title={documentTitle} />
        <ByLine title={documentTitle} friend={friendName} />
        <IconButton
          onPress={read}
          icon="book"
          text={`${t`Read`} →`}
          tailwindClass="mb-2"
        />
        <View style={tw`max-w-[${EDITION_META_MAX_WIDTH}px]`}>
          <JustifiedDescription description={description} />
        </View>
        {chapters.length > 2 && (
          <View
            style={tw.style(
              `mt-2 px-4 self-stretch border-t pt-4 items-center`,
              `pb-${editions.length === 1 ? 8 : 6}`,
              { backgroundColor: `#eaeaea`, borderColor: `#e5e5e5` },
            )}
          >
            <Serif
              size={tw.prefixMatch(`ipad`) ? 22 : 20}
              style={tw`mb-4 ipad:py-2 text-center`}
            >
              {LANG === `en` ? `Contents:` : `Contenido:`}
            </Serif>
            <View>
              {chapters.map((ch) => (
                <TouchableOpacity
                  key={ch.id}
                  style={tw`pl-5 pr-2 h-[30px] ipad:h-[34px]`}
                  onPress={() => readChapter(ch.id)}
                >
                  <Sans
                    size={tw.prefixMatch(`ipad`) ? 17 : 15}
                    numberOfLines={1}
                    style={tw`text-flblue-700`}
                  >
                    {ch.title} &nbsp;<Sans style={tw`text-flblue-600 opacity-50`}>→</Sans>
                  </Sans>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
      {editions.length > 1 && (
        <View style={tw.style(`mb-6`, { 'mt-4': chapters.length <= 2 })}>
          <Sans size={16} style={tw`p-2 italic text-white text-center bg-gray-500`}>
            Choose from {editions.length === 3 ? `three` : `two`} editions:
          </Sans>
          <View style={tw`ipad-lg:flex-row`}>
            {editions.map((edition) => (
              <TouchableOpacity
                style={tw`ipad-lg:w-[33.3333vw]`}
                disabled={edition.type === selected.type}
                key={edition.id}
                onPress={() => selectEdition(edition.type)}
              >
                <BookListItem
                  upperLeft={`${edition.type.toLocaleUpperCase()} EDITION`}
                  title={() =>
                    edition.isSelected ? (
                      <Serif size={22}>
                        <Serif size={22}>Now reading</Serif>:{` `}
                        <Serif size={22} style={tw`italic underline`}>
                          {edition.type} edition
                        </Serif>
                        {` `}
                      </Serif>
                    ) : (
                      <Serif size={22} style={tw`text-gray-500`}>
                        Switch to the{` `}
                        <Serif size={22} style={tw`italic`}>
                          {edition.type} edition
                        </Serif>
                        {`  `}
                        <Icon name="refresh" size={12} style={tw`ml-4 text-flblue-700`} />
                      </Serif>
                    )
                  }
                  editionId={edition.id}
                  upperRight={edition.isSelected ? `SELECTED` : ``}
                  progress={edition.isSelected ? 100 : 0}
                  badgeText={edition.isMostModernized ? `Recommended` : undefined}
                />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={tw`pt-1 pb-6 px-4`}
            onPress={() => Linking.openURL(`https://www.friendslibrary.com/editions`)}
          >
            <Sans style={tw`text-right text-flblue`}>
              Learn more about editions <Icon name="external-link" size={10} />
            </Sans>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

interface OwnProps {
  navigation: StackNavigationProp<StackParamList, 'Ebook'>;
  route: RouteProp<StackParamList, 'Ebook'>;
}

const propSelector: PropSelector<
  { editionId: EditionId; navigation: OwnProps['navigation'] },
  Props
> = ({ editionId, navigation }, dispatch) => (state) => {
  const resource = Editions.get(editionId);
  if (!resource) {
    return null;
  }
  const edition = new EditionEntity(editionId);
  const selectedEditionType = select.documentSelectedEdition(edition.document, state);
  if (!selectedEditionType) {
    return null;
  }

  const editionResources = Editions.getDocumentEditions(edition.document);
  const selectedResource = editionResources.find((e) => e.type === selectedEditionType);
  if (!selectedResource) {
    return null;
  }

  const editions = editionResources.map((edition) => ({
    id: edition.id,
    type: edition.type,
    isSelected: edition.id === selectedResource.id,
    isMostModernized: edition.isMostModernized,
  }));

  return {
    selectEdition: (editionType: EditionType) =>
      dispatch(selectEdition({ documentId: edition.documentId, editionType })),
    read: () => navigation.navigate(`Read`, { editionId: selectedResource.id }),
    readChapter: (chapterId: string) =>
      navigation.navigate(`Read`, { editionId: selectedResource.id, chapterId }),
    friendName: resource.friend.name,
    documentTitle: resource.document.utf8ShortTitle,
    description: resource.document.description,
    chapters: selectedResource.chapters.map((ch) => ({
      id: ch.id,
      title: ch.shortHeading,
    })),
    editions,
  };
};

const EbookContainer: React.FC<OwnProps> = ({ route, navigation }) => {
  const editionId = route.params.editionId;
  const props = useSelector(propSelector({ editionId, navigation }, useDispatch()));
  if (!props) {
    return null;
  }
  return <Ebook {...props} />;
};

export default EbookContainer;
