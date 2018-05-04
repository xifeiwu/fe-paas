import {URL_LIST} from './url';
import axios from 'axios';
import NetBase from 'assets/js/net';

class Net extends NetBase{

  getTerminalInfo(options) {
    return new Promise((resolve, reject) => {
      axios.post(URL_LIST.terminal_info, options).then(response => {
        console.log(response);
      });
    })
  }
}

export default new Net();