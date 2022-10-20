import { createAction, props } from '@ngrx/store';
import { DataSourceLocal } from './admin.state';

export const setGrid = createAction(
    '[Loading Component] setGrid',
    props<object>()
);

export const setBandsAvailable = createAction(
    '[Loading Component] setBandsAvailable',
    props<object>()
);

export const setSatellite = createAction(
    '[Loading Component] setSatellite',
    props<object>()
);

export const setRangeTemporal = createAction(
    '[Loading Component] setRangeTemporal',
    props<object>()
);

export const setTiles = createAction(
    '[Loading Component] setTiles',
    props<object>()
);

export const setDefinition = createAction(
    '[Loading Component] setDefinition',
    props<object>()
);

export const setMetadata = createAction(
    '[Loading Component] setMetadata',
    props<object>()
);

export const setStacList = createAction(
    '[Loading Component] setStacList',
    props<object>()
);

export const setLocalDataSource = createAction(
    '[Admin Component] setLocalDataSource',
    props<DataSourceLocal>()
);
