import { Routes } from '@angular/router';

import { ListCubesComponent } from './pages/list-cubes/list-cubes.component';
import { DetailsCubeComponent } from './pages/details-cube/details-cube.component';

import { CheckCubeComponent } from './pages/check-cube/check-cube.component';
import { CreateCubeComponent } from './pages/create-cube/create-cube.component';

export const AdminRoutes: Routes = [
    { path: 'list-cubes', component: ListCubesComponent },
    { path: 'details-cube/:cube', component: DetailsCubeComponent },
    { path: 'check-cube/:cube', component: CheckCubeComponent },
    { path: 'create-cube', component: CreateCubeComponent },
];
