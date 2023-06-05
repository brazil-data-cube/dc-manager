import { createAction, props } from '@ngrx/store';
import { DataSourceLocal } from './admin.state';

export const setGrid = createAction(
    '[Loading Component] setGrid',
    props<any>()
);

export const setBandsAvailable = createAction(
    '[Loading Component] setBandsAvailable',
    props<any>()
);

export const setSatellite = createAction(
    '[Loading Component] setSatellite',
    props<any>()
);

export const setRangeTemporal = createAction(
    '[Loading Component] setRangeTemporal',
    props<any>()
);

export const setTiles = createAction(
    '[Loading Component] setTiles',
    props<any>()
);

export const setDefinition = createAction(
    '[Loading Component] setDefinition',
    props<any>()
);

export const setMetadata = createAction(
    '[Loading Component] setMetadata',
    props<any>()
);

export const setStacList = createAction(
    '[Loading Component] setStacList',
    props<any>()
);

export const setLocalDataSource = createAction(
    '[Admin Component] setLocalDataSource',
    props<DataSourceLocal>()
);

export const setCustomBands = createAction(
    '[Admin Component] setCustomBands',
    props<any>()
);
