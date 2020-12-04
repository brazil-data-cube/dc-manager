# Web Portal - Deploy

## Installation
### Requirements

Make sure you have the following libraries installed:

- [`Node.js >= 8.x`](https://nodejs.org/en/)
- [`Angular CLI >= 7`](https://angular.io/)

```
cd ../data-cube-manager && npm install
```

## Running

```
cd ../data-cube-manager && npm run build
cd ../deploy
docker build -t brazildatacube/data-cube-manager:0.0.1
```