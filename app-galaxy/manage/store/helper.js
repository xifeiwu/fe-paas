import BaseHelper from '$assets/js/store/helper'
import store from './index';

class StoreHelper extends BaseHelper{
  constructor() {
    super(store);
  }

  get lobList() {
    return this.$store.getters['lobList'];
  }
  get groupList() {
    return this.$store.getters['groupList'];
  }
}

export default StoreHelper;