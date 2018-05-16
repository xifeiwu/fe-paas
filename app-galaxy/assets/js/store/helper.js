export default class StoreHelper {
  constructor(Store) {
    this.$store = Store;
  }

  setUserConfig(keys, value) {
    this.$store.dispatch('global/setConfig', {
      keys, value
    })
  }

  getUserConfig(keys) {
    let config = this.$store.getters['global/config'];
    if (!keys || 0 === keys.length) {
      return;
    }
    if (!config) {
      return;
    }
    let value = null;
    let keyList = keys.split('/');
    let lastKeyIndex = keyList.length - 1;
    let prop = keyList[lastKeyIndex];
    if (0 === lastKeyIndex) {
      if (config.hasOwnProperty(prop)) {
        value = config[prop];
      }
    } else {
      let tmpValue = config;
      let subList = keyList.slice(0, lastKeyIndex);
      for (var index in subList) {
        let key = keyList[index];
        if (tmpValue.hasOwnProperty(key)) {
          tmpValue = tmpValue[key];
        } else {
          tmpValue = null;
          break;
        }
      }
      if (tmpValue && tmpValue.hasOwnProperty(prop)) {
        value = tmpValue[prop];
      }
    }
    return value;
  }

  setUserInfo(keys, value) {
    this.$store.dispatch('global/setInfo', {
      keys, value
    })
  }

  getUserInfo(keys) {
    let config = this.$store.getters['global/info'];
    if (!keys || 0 === keys.length) {
      return;
    }
    if (!config) {
      return;
    }
    let value = null;
    let keyList = keys.split('/');
    let lastKeyIndex = keyList.length - 1;
    let prop = keyList[lastKeyIndex];
    if (0 === lastKeyIndex) {
      if (config.hasOwnProperty(prop)) {
        value = config[prop];
      }
    } else {
      let tmpValue = config;
      let subList = keyList.slice(0, lastKeyIndex);
      for (var index in subList) {
        let key = keyList[index];
        if (tmpValue.hasOwnProperty(key)) {
          tmpValue = tmpValue[key];
        } else {
          tmpValue = null;
          break;
        }
      }
      if (tmpValue && tmpValue.hasOwnProperty(prop)) {
        value = tmpValue[prop];
      }
    }
    return value;
  }

  set menuList(value) {
    this.$store.commit('global/menuList', value);

  }
  get menuList() {
    // return this.getUserInfo('menuList');
    return this.$store.getters['global/menuList'];
  }
}