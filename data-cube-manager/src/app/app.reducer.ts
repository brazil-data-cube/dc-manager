import { createReducer, on, Action } from '@ngrx/store';
import {
  showLoading,
  closeLoading,
  token,
  setURLCubeBuilder,
  logout
} from './app.action';
import { AppState } from './app.state';

/** initial values to App State */
const initialState: AppState = {
  loading: false,
  token: localStorage.getItem('DC_MANAGER_api_token') || '',
  urlService: localStorage.getItem('DC_MANAGER_url_service') || ''
};

/**
 * reducer to manage App state
 * set new values in AppState
 */
const reducerApp = createReducer(initialState,
  on(showLoading, (state) => {
    return { ...state, loading: true };
  }),
  on(closeLoading, (state) => {
    return { ...state, loading: false };
  }),
  on(token, (state, payload) => {
    localStorage.setItem('DC_MANAGER_api_token', payload['token']);
    return { ...state, token: payload['token'] };
  }),
  on(setURLCubeBuilder, (state, payload) => {
    localStorage.setItem('DC_MANAGER_url_service', payload['url']);
    return { ...state, urlService: payload['url'] };
  }),
  on(logout, (state) => {
    localStorage.removeItem('DC_MANAGER_api_token');
    localStorage.removeItem('DC_MANAGER_url_service');
    return { ...state, token: '', urlService: '' };
  })
);

export function reducer(state: AppState | undefined, action: Action) {
  return reducerApp(state, action);
}