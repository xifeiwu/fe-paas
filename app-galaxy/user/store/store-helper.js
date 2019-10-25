import BaseHelper from 'assets/js/store/helper'
import store from './index';

class StoreHelper extends BaseHelper {
  constructor() {
    super(store);
  }

  get groupList() {
    return this.$store.getters['user/groupList'];
  }
}

export default StoreHelper;