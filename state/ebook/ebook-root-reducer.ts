import { combineReducers } from '@reduxjs/toolkit';
import ebookPosition, { initialState as ebookPositionInit } from './position';
import ebookSelectedEdition, {
  initialState as ebookSelectedEditionInit,
} from './selected-edition';

const editionsRootReducer = combineReducers({
  position: ebookPosition,
  selectedEdition: ebookSelectedEdition,
});

export type EditionState = ReturnType<typeof editionsRootReducer>;

export const initialState: EditionState = {
  position: ebookPositionInit,
  selectedEdition: ebookSelectedEditionInit,
};

export default editionsRootReducer;
