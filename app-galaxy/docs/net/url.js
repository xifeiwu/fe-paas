import BaseURL from '$assets/js/url';

class URL extends BaseURL {
  constructor() {
    super();
    this.setUrlList();
  }

  setUrlList() {
    let ORIGIN = this.ORIGIN;
    this.URL_LIST = {
      menu_list: ORIGIN + '/docs/guide/menu.json',
      doc_content: ORIGIN + '/docs/{path}'
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
