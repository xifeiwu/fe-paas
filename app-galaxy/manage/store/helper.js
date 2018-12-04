import BaseHelper from 'assets/js/store/helper'
import store from './index';

class StoreHelper extends BaseHelper{
  constructor() {
    super(store);
  }

  get screen() {
    return this.$store.getters['screen'];
  }
  get navMenuWidth() {
    return this.$store.getters['navMenuWidth'];
  }

  get currentLobId() {
    return this.$store.state.currentLobId;
  }
  set currentLobId(lobId) {
    // this.$store.state.currentLobId = lobId;
    this.$store.dispatch('currentLobId',  lobId);
  }
  get currentScrumList() {
    return this.$store.getters['currentScrumList'];
  }
  set currentScrumId(scrumId) {
    this.$store.state.currentScrumId = scrumId;
  }
  get currentScrumId() {
    return this.$store.state.currentScrumId;
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