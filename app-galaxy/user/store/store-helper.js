import BaseHelper from 'assets/js/store/helper'
import store from './index';

class StoreHelper extends BaseHelper {
  constructor() {
    super(store);
  }

  get screen() {
    return this.$store.getters['screen'];
  }

  get groupList() {
    return this.$store.getters['user/groupList'];
  }
}

export default StoreHelper;