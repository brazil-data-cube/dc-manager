import { createAction, props } from '@ngrx/store';

/**
 * set loading as true
 */
export const showLoading = createAction(
    '[Loading Component] showLoading'
);

/**
 * set loading as false
 */
export const closeLoading = createAction(
    '[Loading Component] closeLoading'
);

/**
 * set token
 */
export const token = createAction(
    '[Loading Component] token',
    props<object>()
);
