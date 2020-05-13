import { createAction, props } from '@ngrx/store';

export const setGrid = createAction(
    '[Loading Component] setGrid',
    props<object>()
);