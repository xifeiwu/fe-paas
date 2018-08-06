class URL {
  constructor() {
    let port = null;
    // switch (process.env.NODE_ENV) {
    //   case 'test':
    //     port = 80;
    //     break;
    //   case 'production':
    //     port = 80;
    //     break;
    //   case 'dev':
    //   default:
    //     port = 7002;
    //     break;
    // }
    // this.ORIGIN = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port;
    this.API_PATH = '/j-api/paas';
  }
}

export default URL;
