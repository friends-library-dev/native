import { combineReducers } from '@reduxjs/toolkit';
import resources, { initialState as resourcesInit } from './resources';

const editionsRootReducer = combineReducers({
  resources,
});

export type EditionsState = ReturnType<typeof editionsRootReducer>;

export const initialState: EditionsState = {
  resources: resourcesInit,
};

export default editionsRootReducer;
