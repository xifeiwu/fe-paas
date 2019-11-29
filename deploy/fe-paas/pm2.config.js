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
        'DEBUG': 'spa-server*',
        'LOG_DIR': path.resolve(__dirname, 'logs')
      },
      env_finup_development: {
        name: 'finup:development',
        PLATFORM: 'finup:development',
      },
      env_finup_test: {
        name: 'finup:test',
        PLATFORM: 'finup:test',
      },
      env_finup_production: {
        name: 'finup:production',
        PLATFORM: 'finup:production',
      },
      env_finup_production_gray: {
        name: 'finup:production-gray',
        PLATFORM: 'finup:production_gray',
      },
      env_renmai_production: {
        name: 'renmai:production',
        PLATFORM: 'renmai:production',
      },
      env_renmai_production_gray: {
        name: 'renmai:production_gray',
        PLATFORM: 'renmai:production_gray',
      },
    },
  ],
};
