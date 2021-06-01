import React from 'react';
import { View, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { EditionType } from '@friends-library/types';
import { Sans, Serif } from '../components/Text';
import { StackParamList } from '../types';
import { EditionEntity } from '../lib/models';
import { PropSelector, useDispatch, useSelector } from '../state';
import * as select from '../state/selectors/edition';
import BookListItem from '../components/BookListItem';
import CoverImage from '../components/CoverImage';
import tw from '../lib/tailwind';
import { ByLine, JustifiedDescription, MainTitle } from '../components/BookParts';
import IconButton from '../components/IconButton';
import { selectEdition } from '../state/editions/ebook-selected-edition';

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
  return (
    <ScrollView style={tw.style(``, { backgroundColor: `#efefef` })}>
      <View style={tw`pt-4 items-center`}>
        <TouchableOpacity onPress={read}>
          <CoverImage
            // use key to force a re-render when the selected edition changes
            // because of "caching" inherent in the implementation of CoverImage
            key={selected.id}
            type="threeD"
            layoutWidth={COVER_IMG_WIDTH}
            resourceId={selected.id}
          />
        </TouchableOpacity>
        <MainTitle title={documentTitle} />
        <ByLine title={documentTitle} friend={friendName} />
        <IconButton onPress={read} icon="book" text="Read →" style="mb-2" />
        <JustifiedDescription description={description} />
        {chapters.length > 2 && (
          <View
            style={tw.style(
              `mt-2 px-4 self-stretch border-t pt-4`,
              `pb-${editions.length === 1 ? 8 : 4}`,
              { backgroundColor: `#eaeaea`, borderColor: `#e5e5e5` },
            )}
          >
            <Serif size={20} style={tw`mb-4 text-center`}>
              Contents:
            </Serif>
            {chapters.map((ch) => (
              <TouchableOpacity
                key={ch.id}
                style={tw.style(`pl-5 pr-2`, { height: 30 })}
                onPress={() => readChapter(ch.id)}
              >
                <Sans size={15} numberOfLines={1} style={tw`text-flblue-700`}>
                  {ch.title} <Sans style={tw`text-flblue-600 opacity-50 pl-px`}>→</Sans>
                </Sans>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      {editions.length > 1 && (
        <View style={tw.style({ 'mt-4': chapters.length <= 2 })}>
          <Sans size={16} style={tw`p-2 italic text-white text-center bg-gray-400`}>
            Available in {editions.length == 3 ? `three` : `two`} editions:
          </Sans>
          {editions.map((edition) => (
            <TouchableOpacity
              disabled={edition.type == selected.id}
              key={edition.id}
              onPress={() => selectEdition(edition.type)}
            >
              <BookListItem
                friend={`${edition.type.toLocaleUpperCase()} EDITION`}
                title={
                  edition.isSelected
                    ? `Reading the ${edition.type} edition`
                    : `Switch to the ${edition.type} edition`
                }
                resourceId={edition.id}
                duration={edition.isSelected ? `SELECTED` : ``}
                progress={edition.isSelected ? 100 : 0}
                isNew={edition.isMostModernized}
              />
            </TouchableOpacity>
          ))}
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
  { editionId: string; navigation: OwnProps['navigation'] },
  Props
> = ({ editionId, navigation }, dispatch) => (state) => {
  const resource = select.editionResource(editionId, state);
  if (!resource) {
    return null;
  }
  const edition = new EditionEntity(editionId);
  const selectedEditionType = select.documentSelectedEdition(edition.document, state);
  if (!selectedEditionType) {
    return null;
  }

  const editionResources = select.documentEditions(edition.document, state);
  const selectedResource = editionResources.find((e) => e.type === selectedEditionType);
  if (!selectedResource) {
    return null;
  }

  const editions = editionResources.map((edition) => ({
    id: edition.id,
    type: edition.type,
    isSelected: edition.id == selectedResource.id,
    isMostModernized: edition.isMostModernized,
  }));

  return {
    selectEdition: (editionType: EditionType) =>
      dispatch(selectEdition({ documentId: edition.documentId, editionType })),
    read: () => navigation.navigate(`Read`, { resourceId: selectedResource.id }),
    readChapter: (chapterId: string) =>
      navigation.navigate(`Read`, { resourceId: selectedResource.id, chapterId }),
    friendName: resource.friendName,
    documentTitle: resource.documentTitle,
    description: resource.documentDescription,
    chapters: selectedResource.chapters,
    editions,
  };
};

const EbookContainer: React.FC<OwnProps> = ({ route, navigation }) => {
  const editionId = route.params.resourceId;
  const props = useSelector(propSelector({ editionId, navigation }, useDispatch()));
  if (!props) {
    return null;
  }
  return <Ebook {...props} />;
};

export default EbookContainer;

const COVER_IMG_WIDTH = Dimensions.get(`window`).width * 0.8; // @TODO