import BaseURL from '$assets/js/url';

class URL extends BaseURL {
  constructor() {
    super();
    this.setUrlList();
  }

  setUrlList() {
    let ORIGIN = this.ORIGIN;
    let API_PATH = this.API_PATH;
    this.URL_LIST = {
      'page_login_path': ORIGIN + '/galaxy.html',
      // 获取打开实例终端信息
      'terminal_info': API_PATH + '/service/queryTerminalInfo',
    }
  }

  getUrlList() {
    return this.URL_LIST;
  }
}
let url = new URL();
const ORIGIN = url.ORIGIN;
const URL_LIST = url.getUrlList();

export {
  ORIGIN,
  URL_LIST
}