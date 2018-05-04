### how to run

nvm install v8.9.4
npm install -g yarn

pushd ./vue
yarn install
npm run dev

popd
yarn install
cd ./server
npm run start-dev

open http://127.0.0.1:8080 in browser

### profile

- dev
- test
- production

dev vs test for vue project:

- different port: 7002 for dev, 80 for test and production
- prot is set in net/url.js of vue project

### package.json

build vue project by ENV

- build for dev environment: npm run build-dev
- build for test environment: npm run build-test

### build

- should build project by command 'npm run build-dev' in work dir, as process.cwd() is used in the process of build

- browserDebug is provide by webpack.ProvidePlugin


### assets directory

- libs/debug is a copy of debug module of node, with a modify of function formatArgs in browser.js