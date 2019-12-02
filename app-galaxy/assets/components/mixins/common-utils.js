export default {
  data() {
    return {
      queueForWaitingResponse: [],
      action: {
        requesting: false,
        name: null,
        promise: {
          resolve: () => {},
          reject: () => {},
        },
        dataOrigin: null,
        data: null
      },
      style: {
        '$env-fpdev-color': '#409EFF',
        '$env-test-color': '#28a745',
        '$env-performance-color': '#17a2b8',
        '$env-beta-color': '#ffc107',
        '$env-production-color': '#F56C6C',
        '$env-production-ff-color': '#F56C6C',
        '$env-staging-color': '#EF5b9C',
        'color-primary': '#409EFF',
        'color-success': '#67c23a',
        'color-warning': '#eb9e05',
        'color-danger': '#fa5555',
        'color-info': '#878d99',
      }
    }
  },
  methods: {
    openDialog(name, data) {
      this.action.dataOrigin = data;
      this.action.data = this.$utils.cloneDeep(data);
      this.action.name = name;

      return new Promise((resolve, reject) => {
        this.action.promise.resolve = resolve;
        this.action.promise.reject = reject;
      });
    },
    closeDialog() {
      this.action.name = null;
      this.action.promise.reject('cancel');
    },

    // helper for loading action of el-button
    addToWaitingResponseQueue(action) {
      if (this.queueForWaitingResponse.indexOf(action) === -1) {
        this.queueForWaitingResponse.push(action);
      }
    },
    hideWaitingResponse(action) {
      let index = this.queueForWaitingResponse.indexOf(action);
      if (index > -1) {
        this.queueForWaitingResponse.splice(index, 1);
      }
    },
    statusOfWaitingResponse(action) {
      return this.queueForWaitingResponse.indexOf(action) > -1;
    },

    closeAllResponse() {
      this.queueForWaitingResponse.length = 0;
    },

    warningConfirm(content) {
      return new Promise((resolve, reject) => {
        this.$confirm(content, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          resolve();
        }).catch(() => {
          reject()
        });
      });
    },
  }
}