import { createReducer, on, Action } from '@ngrx/store';
import {
  setGrid
} from './admin.action';
import { AdminState } from './admin.state';

/** initial values to Admin State */
const initialState: AdminState = {
  grid: ''
};

/**
 * reducer to manage Admin state
 * set new values in AdminState
 */
const reducerAdmin = createReducer(initialState,
  on(setGrid, (state, payload) => {
    return { ...state, grid: payload['grid'] };
  }),
);

export function reducer(state: AdminState | undefined, action: Action) {
  return reducerAdmin(state, action);
} 