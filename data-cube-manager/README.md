# Data Cube Manager (Web Application)

Data Cube Manager is a web application for [`cube-builder`](https://github.com/brazil-data-cube/cube-builder), built on top of Angular to manage Data Cubes on Brazil Data Cube project.

## Installation

### Requirements

Make sure you have the following libraries installed:

- [`Node.js >= 18.x`](https://nodejs.org/en/)
- [`Angular CLI >= 16`](https://angular.io/)

Install the dependencies with ``npm`` as following:

```bash
npm install
```

## Running

First of all, you must have an instance of [Cube-Builder](https://github.com/brazil-data-cube/cube-builder) up and running.

### Development Setup

Create or Edit the file ``assets/env.js`` and set the required variables:

- ``environmentVersion``: Flag to set ``Data Cube Manager`` application context.
    The available options are: ``local`` for on-premise cube-builder and ``cloud`` for AWS environment. Defaults to ``local``.
- ``itemPrefix``: Base prefix for identity/composed data cubes. Defaults to ``/cubes``.
- ``itemBaseUrl``: Base URL for HTTP image preview. Defaults to ``https://brazildatacube.dpi.inpe.br``.


To launch the development server, use the command:

```bash
npm start
```

And then navigate to `http://localhost:4200`. The app will automatically reload if you change any of the source files.

## Production Setup - Build

To build package as `production` mode, use the following command line:

```bash
npm run build
# ng build # if you have installed the angular cli globally.
```

The build artifacts will be stored in the `dist/` directory.

You can also build the `Data Cube Manager` with [`Docker Image`](../deploy).
