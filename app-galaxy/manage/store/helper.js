import BaseHelper from '$assets/js/store/helper'
import store from './index';

class StoreHelper extends BaseHelper{
  constructor() {
    super(store);
  }
}

export default StoreHelper;