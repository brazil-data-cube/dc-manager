# Deploying

This section explains how to get the Data Cube Manager GUI up and running with Docker and Docker Compose.
If you do not have Docker installed, take a look at [this tutorial on how to install it in your system](https://docs.docker.com/install/)
See also the [`tutorial on how to install Docker Compose`](https://docs.docker.com/compose/install/)


## Installation
### Requirements

Make sure you have the following libraries installed:

- [`Node.js >= 8.x,<17`](https://nodejs.org/en/)
- [`Angular CLI >= 7`](https://angular.io/)


## Build and Running

Use the following command to build docker image ``brazil-data-cube/dc-manager:1.0.0``:

```bash
docker build --tag brazil-data-cube/dc-manager:1.0.0 \
             --build-arg DC_MANAGER_VERSION=1.0.0 \
             -f deploy/Dockerfile .
```

If the above command runs successfully, you will be able to list the docker image:

```bash
brazil-data-cube/dc-manager           1.0.0            c1a745bfd47e   11 minutes ago   74.7MB
```

In order to launch docker image, you may pass the following command:

```bash
docker run --interactive \
           --tty \
           --name dc-manager \
           --env DC_MANAGER_MODE=local \
           --env DC_MANAGER_ITEM_PREFIX=/cubes \
           --env DC_MANAGER_ITEM_BASE_URL=https://brazildatacube.dpi.inpe.br \
           --publish 8080:8080 \
           --env DC_MANAGER_BASE_URL=/ \
           brazil-data-cube/dc-manager:1.0.0
```

You may need to replace the definition of some environment variables:

- ``DC_MANAGER_MODE="local"``: used to tell Data Cube Manager to use context mode of ``local`` (on-premise services). You may also set to ``cloud`` if your application is running with AWS set up support.

- ``DC_MANAGER_ITEM_PREFIX="/cubes"``: prefix used for data cube items in database. See [``Cube Builder Config``](https://cube-builder.readthedocs.io/en/latest/configuration.html#cube_builder.config.Config.ITEM_PREFIX).

- ``DC_MANAGER_ITEM_BASE_URL="https://brazildatacube.dpi.inpe.br"``: base url prefix of HTTP served used to serve data cubes images.
