import { createReducer, on, Action } from '@ngrx/store';
import {
  setGrid, setBandsAvailable, setCollection, setRangeTemporal, setTiles
} from './admin.action';
import { AdminState } from './admin.state';

/** initial values to Admin State */
const initialState: AdminState = {
  grid: '',
  bandsAvailable: [],
  collection: '',
  startDate: null,
  lastDate: null,
  tiles: []
};

/**
 * reducer to manage Admin state
 * set new values in AdminState
 */
const reducerAdmin = createReducer(initialState,
  on(setGrid, (state, payload) => {
    return { ...state, grid: payload['grid'] };
  }),
  on(setBandsAvailable, (state, payload) => {
    return { ...state, bandsAvailable: payload['bands'] };
  }),
  on(setCollection, (state, payload) => {
    return { ...state, collection: payload['collection'] };
  }),
  on(setCollection, (state, payload) => {
    return { ...state, collection: payload['collection'] };
  }),
  on(setRangeTemporal, (state, payload) => {
    return { ...state, startDate: payload['startDate'], lastDate: payload['lastDate'] };
  }),
  on(setTiles, (state, payload) => {
    return { ...state, tiles: payload['tiles'] };
  }),
);

export function reducer(state: AdminState | undefined, action: Action) {
  return reducerAdmin(state, action);
} 