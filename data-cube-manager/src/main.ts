/*!
 * This file is part of the Data Cube Manager.
    Copyright (C) 2020 Brazil Data Cube.
 * Data Cube Manager is free software; you can redistribute it and/or modify it
    under the terms of the MIT License; see LICENSE file for more details.
 */

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import 'hammerjs';

platformBrowserDynamic().bootstrapModule(AppModule);
