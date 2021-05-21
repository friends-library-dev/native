import { combineReducers } from '@reduxjs/toolkit';
import resources, { initialState as resourcesInit } from './resources';
import ebookPosition, { initialState as ebookPositionInit } from './ebook-position';

const editionsRootReducer = combineReducers({
  resources,
  ebookPosition,
});

export type EditionsState = ReturnType<typeof editionsRootReducer>;

export const initialState: EditionsState = {
  resources: resourcesInit,
  ebookPosition: ebookPositionInit,
};

export default editionsRootReducer;
