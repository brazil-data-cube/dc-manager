#!/bin/bash

##### BUILD

echo
echo "BUILD STARTED"
echo

cd data-cube-manager
docker build -t image-to-build-data-cube-manager . --no-cache

docker run --name data-cube-manager-node-build -v $PWD/../deploy/dist:/deploy/dist image-to-build-data-cube-manager
docker rm data-cube-manager-node-build
docker rmi image-to-build-data-cube-manager

cd ../deploy
echo
echo "NEW TAG:"
read IMAGE_TAG
IMAGE_BASE="registry.dpi.inpe.br/brazildatacube/data-cube-manager"
IMAGE_FULL="${IMAGE_BASE}:${IMAGE_TAG}"

docker build -t ${IMAGE_FULL} .
sudo rm -r dist
docker push ${IMAGE_FULL}
