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
    'token',
    props<any>()
);

/**
 * set url cube builder
 */
export const setURLCubeBuilder = createAction(
    'URL Cube Builder',
    props<any>()
);

/**
 * set url cube builder
 */
export const logout = createAction(
    'logout object (remove token and url)'
);
