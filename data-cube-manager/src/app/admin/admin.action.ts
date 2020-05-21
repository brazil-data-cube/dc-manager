import { createAction, props } from '@ngrx/store';

export const setGrid = createAction(
    '[Loading Component] setGrid',
    props<object>()
);

export const setBandsAvailable = createAction(
    '[Loading Component] setBandsAvailable',
    props<object>()
);

export const setCollection = createAction(
    '[Loading Component] setCollection',
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

export const setUrlSTAC = createAction(
    '[Loading Component] setUrlSTAC',
    props<object>()
);