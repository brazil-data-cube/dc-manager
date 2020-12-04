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
  token: sessionStorage.getItem('dc_manager_api_token') || '',
  urlService: sessionStorage.getItem('dc_manager_url_service') || ''
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
    sessionStorage.setItem('dc_manager_api_token', payload['token']);
    return { ...state, token: payload['token'] };
  }),
  on(setURLCubeBuilder, (state, payload) => {
    sessionStorage.setItem('dc_manager_url_service', payload['url']);
    return { ...state, urlService: payload['url'] };
  }),
  on(logout, (state) => {
    sessionStorage.removeItem('dc_manager_api_token');
    sessionStorage.removeItem('dc_manager_url_service');
    return { ...state, token: '', urlService: '' };
  })
);

export function reducer(state: AppState | undefined, action: Action) {
  return reducerApp(state, action);
} 