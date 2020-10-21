#!/bin/bash

##### BUILD

echo
echo "BUILD STARTED"
echo

cd data-cube-manager
npm run build -- --prod

cd ../deploy
echo
echo "NEW TAG:"
read IMAGE_TAG
IMAGE_BASE="registry.dpi.inpe.br/brazildatacube/data-cube-manager"
IMAGE_FULL="${IMAGE_BASE}:${IMAGE_TAG}"

docker build -t ${IMAGE_FULL} .
sudo rm -r dist
docker push ${IMAGE_FULL}
