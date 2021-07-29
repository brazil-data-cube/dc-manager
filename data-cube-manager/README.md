# Data Cube Manager (Web Application)

Web Application to manager cubes on Brazil Data Cube project

## Installation
### Requirements

Make sure you have the following libraries installed:

- [`Node.js >= 8.x`](https://nodejs.org/en/)
- [`Angular CLI >= 7`](https://angular.io/)

```
npm install
```

## Running

First of all, you must have an instance of [Cube-Builder](https://github.com/brazil-data-cube/cube-builder) running.

### Development server

To launch the development server, use the command:

```bash
npm start
```

And then navigate to `http://localhost:4200`. The app will automatically reload if you change any of the source files.

## Build

To build package as `development` mode, use the following command line:

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a `production` build.

You can also build the `Data Cube Manager` with [`Docker Image`](../deploy).
