import { Action, AnyAction, Dispatch as RDXDispatch } from '@reduxjs/toolkit';
import { useDispatch as RDXUseDispatch, createSelectorHook } from 'react-redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { State } from './root-reducer';
import { initialState as audioInitialState } from './audio/audio-root-reducer';
import { initialState as editionsInitialState } from './editions/editions-root-reducer';
import { initialState as fsInitialState } from './filesystem';
import { initialState as prefsInitialState } from './preferences';
import { initialState as networkInitialState } from './network';
import { initialState as ephemeralInitialState } from './ephemeral';
import { initialState as dimensionsInitialState } from './dimensions';

export const INITIAL_STATE: State = {
  version: 2,
  audio: audioInitialState,
  editions: editionsInitialState,
  preferences: prefsInitialState,
  filesystem: fsInitialState,
  network: networkInitialState,
  ephemeral: ephemeralInitialState,
  dimensions: dimensionsInitialState,
};

export type { State };
// this type derived from looking at `type of store.dispatch`
export type Dispatch = ThunkDispatch<any, null, AnyAction> &
  ThunkDispatch<any, undefined, AnyAction> &
  RDXDispatch<AnyAction>;
export type Thunk = ThunkAction<void, State, unknown, Action<string>>;
export const useSelector = createSelectorHook<State>();
export const useDispatch = (): Dispatch => RDXUseDispatch<Dispatch>();

export type PropSelector<OwnProps, Props> = (
  ownProps: OwnProps,
  dispatch: Dispatch,
) => (state: State) => null | Props;
