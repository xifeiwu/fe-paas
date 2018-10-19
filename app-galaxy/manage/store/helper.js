import BaseHelper from 'assets/js/store/helper'
import store from './index';

class StoreHelper extends BaseHelper{
  constructor() {
    super(store);
  }

  get screen() {
    return this.$store.getters['screen'];
  }

  get lobList() {
    return this.$store.getters['lobList'];
  }
  get scrumList() {
    return this.$store.getters['scrumList'];
  }
  get groupListAll() {
    return this.$store.getters['groupListAll'];
  }
  get profileListAll() {
    return this.$store.getters['profileListAll'];
  }

  getLobInfoById(id) {
    let result = null;
    if (id && this.lobList && Array.isArray(this.lobList)) {
      this.lobList.some(it => {
        if (it.id == id) {
          result = it;
        }
        return result;
      })
    }
    return result
  }

  getScrumInfoById(id) {
    let result = null;
    if (id && this.scrumList && Array.isArray(this.scrumList)) {
      this.scrumList.some(it => {
        if (it.id == id) {
          result = it;
        }
        return result;
      })
    }
    return result
  }
}

export default StoreHelper;