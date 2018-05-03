let port = null;
switch (process.env.NODE_ENV) {
  case 'test':
    port = 80;
    break;
  case 'production':
    port = 80;
    break;
  case 'dev':
  default:
    port = 7002;
    break;
}

var ORIGIN = window.location.protocol + '//' + window.location.hostname + ':' + port;

var URL_LIST = {};

export {
  ORIGIN, URL_LIST
};
