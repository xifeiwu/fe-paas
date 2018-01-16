<script>
export default {
  created() {
//    console.log('in created of store-helper.vue');
  },
  data() {
    return {
    }
  },
  computed: {
    currentGroupID: {
      get() {
        let groupID = null;
        let groupInfo = this.$store.getters['user/groupInfo'];
        if (groupInfo && groupInfo.hasOwnProperty('id')) {
          groupID = groupInfo.id;
        }
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
    groupInfo() {
      return this.$store.getters['user/groupInfo'];
    },
    profileListOfGroup() {
      let value = this.$store.getters['user/profileListOfGroup'];
      return value;
    },
    appInfoListOfGroup() {
      return this.$store.getters['user/appInfoListOfGroup'];
    },
    usersInGroup() {
      return this.$store.getters['user/usersInGroup'];
    },
    usersAll() {
      return this.$store.getters['app/usersAll'];
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
    getGroupInfoByID(groupID) {
      let target;
      this.groupList.some(it => {
        target = it.id === groupID ? it : null;
        return target
      });
      return target;
    },
    getUserInfoByID(userIdList) {
      let results = null;
      if (Array.isArray(userIdList)) {
        if (this.usersAll && Array.isArray(this.usersAll)) {
          results = this.usersAll.filter(it => {
            return userIdList.indexOf(it.id) > -1;
          })
        }
      }
      return results;
    }
  }
}
</script>