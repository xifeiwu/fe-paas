
### package.json

build vue project by ENV

- build for dev environment: npm run build-dev
- build for test environment: npm run build-test

dev vs test for vue project:

- different port: 7002 for dev, 80 for test and production
- prot is set in net/url.js of vue project

### build

- should build project by command 'npm run build-dev' in work dir, as process.cwd() is used in the process of build