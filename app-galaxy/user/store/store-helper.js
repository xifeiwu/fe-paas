import BaseHelper from '$assets/js/store/helper'

class StoreHelper extends BaseHelper {
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
}

export default StoreHelper;