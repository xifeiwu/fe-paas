import BaseHelper from '$assets/js/store/helper'
import store from './index';

class StoreHelper extends BaseHelper{
  constructor() {
    super(store);
  }

  get lobList() {
    return this.$store.getters['lobList'];
  }
  get scrumList() {
    return this.$store.getters['scrumList'];
  }
  get groupList() {
    return this.$store.getters['groupList'];
  }
  get profileListAll() {
    return this.$store.getters['profileListAll'];
  }
}

export default StoreHelper;