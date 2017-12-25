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

    }
  }
}
</script>