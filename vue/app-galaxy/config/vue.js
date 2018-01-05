/**
 * Created by xifei.wu on 2018/1/5.
 */
class VUEConfig {
  constructor(Vue, Store) {
    this.setConfig(Vue, Store);
  }
  setConfig(Vue, Store) {
    this.addMixin(Vue);
    this.addStoreTools(Vue, Store);
  }
  addMixin(Vue){
    Vue.mixin({
      methods: {
        $refresh: function () {
          this.$router.go({
            path: this.$route.path,
            force: true
          })
        }
      }
    });
  }
  addStoreTools(Vue, Store) {
    Vue.prototype.$setUserConfig = function(keys, value) {
      Store.dispatch('user/setConfig', {
        keys, value
      })
    };
    Vue.prototype.$getUserConfig = function(keys) {
      let config = Store.getters['user/config'];
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
    };
    Vue.prototype.$setUserInfo = function(keys, value) {
      Store.dispatch('user/setInfo', {
        keys, value
      })
    };
    Vue.prototype.$getUserInfo = function(keys) {
      let config = Store.getters['user/info'];
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
    };
  }
}

export default VUEConfig;