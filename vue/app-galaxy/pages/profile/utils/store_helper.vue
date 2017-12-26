<script>
export default {
  computed: {
    currentGroupID() {
      let groupID = this.$store.getters['user/groupID'];
      return groupID;
    },
    groupList() {
      return this.$store.getters['user/groupList'];
    },
    profileListOfGroup() {
      let value = this.$store.getters['user/profileListOfGroup'];
      return value;
    },
    appInfoListOfGroup() {
      return this.$store.getters['user/appInfoListOfGroup'];
    }
  },
  methods: {
    getAppInfoByID(appID) {
      let result = null;
      for (let index in this.appInfoListOfGroup.appList) {
        let item = this.appInfoListOfGroup.appList[index];
        console.log(item);
        if (item.appId == appID) {
          result = {
            index: index,
            app: item,
            model: this.appInfoListOfGroup.appModelList[index]
          };
          break;
        }
      }
      return result;
    },
    serConfig(path, value) {
      this.$store.dispatch('user/setConfig', {
        path, value
      })
    },
    getConfig(keys) {
      let config = this.$store.getters['user/config'];
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
        keyList.slice(0, lastKeyIndex).forEach(it => {
          if (!tmpValue.hasOwnProperty(it)) {
            tmpValue = tmpValue[it];
          }
        });
        if (tmpValue.hasOwnProperty(prop)) {
          value = tmpValue[prop];
        }
      }
      return value;
    }
  }
}
</script>