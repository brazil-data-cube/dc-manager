import { createReducer, on, Action } from '@ngrx/store';
import {
  setGrid, setBandsAvailable, setRangeTemporal, setTiles, setDefinition, setMetadata, setSatellite, setStacList
} from './admin.action';
import { AdminState } from './admin.state';

/** initial values to Admin State */
const initialState: AdminState = {
  grid: {},
  stacList: [],
  bandsAvailable: [],
  satellite: '',
  startDate: null,
  lastDate: null,
  tiles: [],
  definitionInfos: {
    bucket: '',
    name: '',
    version: null,
    public: true,
    resolution: null,
    temporal: '',
    function: {},
    bands: [],
    nodata: null,
    bandsQuicklook: [],
    indexes: [],
    qualityBand: '',
    qualityNodata: null
  },
  metadata: {
    license: '',
    description: ''
  }
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
  on(setSatellite, (state, payload) => {
    return { ...state, satellite: payload['satellite'] };
  }),
  on(setRangeTemporal, (state, payload) => {
    return { ...state, startDate: payload['startDate'], lastDate: payload['lastDate'] };
  }),
  on(setTiles, (state, payload) => {
    return { ...state, tiles: payload['tiles'] };
  }),
  on(setDefinition, (state, payload) => {
    return { ...state, definitionInfos: payload['definition'] };
  }),
  on(setMetadata, (state, payload) => {
    return { ...state, metadata: payload['metadata'] };
  }),
  on(setStacList, (state, payload) => {
    return { ...state, stacList: payload['stacList'] };
  }),
);

export function reducer(state: AdminState | undefined, action: Action) {
  return reducerAdmin(state, action);
}