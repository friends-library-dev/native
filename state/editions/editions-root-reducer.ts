import { combineReducers } from '@reduxjs/toolkit';
import resources, { initialState as resourcesInit } from './resources';
import ebookPosition, { initialState as ebookPositionInit } from './ebook-position';
import ebookSelectedEdition, {
  initialState as ebookSelectedEditionInit,
} from './ebook-selected-edition';

const editionsRootReducer = combineReducers({
  resources,
  ebookPosition,
  ebookSelectedEdition,
});

export type EditionsState = ReturnType<typeof editionsRootReducer>;

export const initialState: EditionsState = {
  resources: resourcesInit,
  ebookPosition: ebookPositionInit,
  ebookSelectedEdition: ebookSelectedEditionInit,
};

export default editionsRootReducer;
