'use strict';

const path = require('path');

module.exports = {
  apps: [
    {
      name: 'spa-server-paas',
      script: './main.js',
      watch: true,
      ignore_watch: ['logs\/*'],
      env: {
        'DEBUG': 'spa-server',
        'LOG_DIR': path.resolve(__dirname, 'logs')
      },
      env_dev: {
        'NODE_ENV': 'dev',
        'PORT': 6001,
      },
      env_test: {
        'NODE_ENV': 'test',
        'PORT': 80,
      },
      env_production: {
        'NODE_ENV': 'production',
        'PORT': 6001,
      },
      env_production_gray: {
        'name': 'spa-server-paas-production-gray',
        'NODE_ENV': 'production_gray',
        'PORT': 6001,
      },
    },
  ],
};
