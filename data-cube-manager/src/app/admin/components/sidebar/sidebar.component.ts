import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment'

declare const $: any;
declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}
export const ROUTES: RouteInfo[] = [
    { path: '/list-cubes', title: 'My Cubes',  icon: 'dashboard', class: '' },
    { path: '/create-cube', title: 'Create Cube',  icon: 'build', class: '' },
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: any[];

  constructor() { }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
  }
  isMobileMenu() {
      if ($(window).width() > 991) {
          return false;
      }
      return true;
  };

  getVersion() {
    return environment.appVersion;
  }
}
