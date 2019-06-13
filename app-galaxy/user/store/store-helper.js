import BaseHelper from 'assets/js/store/helper'
import store from './index';

class StoreHelper extends BaseHelper {
  constructor() {
    super(store);
  }

  set notPermitted(value) {
    this.setPermission({user: value})
  }

  get notPermitted() {
    let result = {};
    let permission = this.getPermission('user');
    if (Array.isArray(permission)) {
      permission.forEach(it => {
        result[it] = true;
      })
    }
    return result;
  }

  get screen() {
    return this.$store.getters['screen'];
  }

  get groupList() {
    return this.$store.getters['user/groupList'];
  }
}

export default StoreHelper;