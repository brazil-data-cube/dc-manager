import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';
import { AdminGuardService } from './admin/admin-guard.service';

const routes: Routes =[
  {
    path: '',
    redirectTo: 'list-cubes',
    pathMatch: 'full',
  }, 
  {
    path: '',
    component: AdminLayoutComponent,
    canActivateChild: [AdminGuardService],
    children: [
      {
        path: '',
        loadChildren: './admin/admin.module#AdminModule'
      } 
    ]
  },
  {
    path: '**',
    redirectTo: 'list-cubes'
  },
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
  ],
})
export class AppRoutingModule { }
