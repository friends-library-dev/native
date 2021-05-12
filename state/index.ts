import { Action, AnyAction, Dispatch as RDXDispatch } from '@reduxjs/toolkit';
import {
  useDispatch as RDXUseDispatch,
  useSelector as RDXUseSelector,
  TypedUseSelectorHook,
} from 'react-redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { State } from './root-reducer';
import { initialState as audioInitialState } from './audio/audio-root-reducer';
import { initialState as fsInitialState } from './filesystem';
import { initialState as prefsInitialState } from './preferences';
import { initialState as networkInitialState } from './network';

export const INITIAL_STATE: State = {
  version: 2,
  audio: audioInitialState,
  preferences: prefsInitialState,
  filesystem: fsInitialState,
  network: networkInitialState,
};

export type { State };
// this type derived from looking at `type of store.dispatch`
export type Dispatch = ThunkDispatch<any, null, AnyAction> &
  ThunkDispatch<any, undefined, AnyAction> &
  RDXDispatch<AnyAction>;
export type Thunk = ThunkAction<void, State, unknown, Action<string>>;
export const useSelector: TypedUseSelectorHook<State> = RDXUseSelector;

// eslint-disable-next-line
export const useDispatch = () => RDXUseDispatch<Dispatch>();

export type PropSelector<OwnProps, Props> = (
  ownProps: OwnProps,
  dispatch: Dispatch,
) => (state: State) => null | Props;
