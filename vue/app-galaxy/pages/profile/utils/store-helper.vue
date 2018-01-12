<script>
export default {
  created() {
//    console.log('in created of store-helper.vue');
  },
  computed: {
    currentGroupID: {
      get() {
        let groupID = this.$store.getters['user/groupID'];
        return groupID;
      },
      set(value) {
        this.$store.dispatch('user/groupID', {
          value,
          from: 'store-helper'
        });
      }
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
    },
    languageInfo() {
      let result = [];
      let value = this.$store.getters['app/messageForCreateAPP'];
      if (value && value.hasOwnProperty('LanguageList')) {
        result = value.LanguageList;
      }
      return result;
    },
    cpuAndMemoryList() {
      let result = [];
      let value = this.$store.getters['app/messageForCreateAPP'];
      if (value && value.hasOwnProperty('cpuAndMemorylist')) {
        result = value.cpuAndMemorylist;
      }
      return result;
    },
  },
  methods: {
    getAppInfoByID(appID) {
      let result = null;
      for (let index in this.appInfoListOfGroup.appList) {
        let item = this.appInfoListOfGroup.appList[index];
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
    deleteAppInfoByID(appID) {
//      this.$store.dispatch('user/deleteAppInfoByID', appID);
      let result = {
        exist: false,
        index: -1,
      }
      for (let index in this.appInfoListOfGroup.appList) {
        let item = this.appInfoListOfGroup.appList[index];
        if (item.appId == appID) {
          result.exist = true;
          result.index = index;
          break;
        }
      }
      if (result.exist) {
        this.appInfoListOfGroup.appList.splice(result.index, 1);
        this.appInfoListOfGroup.appModelList.splice(result.index, 1);
        this.appInfoListOfGroup.total -= 1;
      }
      console.log(this.appInfoListOfGroup);
    },
  }
}
</script>