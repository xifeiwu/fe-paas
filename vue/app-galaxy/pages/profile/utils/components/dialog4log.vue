<template>
  <el-dialog title="部署日志" :visible="showStatus.visible"
             @close="showStatus.visible = false"
             class="dialog4log"
             :closeOnClickModal="false"
             ref="dialog4log"
  >
    <el-scrollbar>
      <div v-for="(item,index) in deployLogs" :key="index" class="deploy-log">{{item}}</div>
    </el-scrollbar>
  </el-dialog>
</template>
<style lang="scss">
  .el-dialog__wrapper {
    &.dialog4log {
      .el-dialog {
        background-color: black;
        width: 80%;
        height: 70%;
        text-align: left;
        .el-dialog__header {
          padding: 6px;
          border-bottom: 1px solid gray;
          .el-dialog__title {
            font-size: 14px;
            font-weight: bold;
            color: white;
          }
          .el-dialog__headerbtn {
            top: 10px;
          }
        }
        .el-dialog__body {
          padding: 0px;
          color: lightgray;
          height: calc(100% - 40px);
          box-sizing: border-box;
          overflow: scroll;
          .el-scrollbar {
            height: 100%;
            .el-scrollbar__wrap {
              .el-scrollbar__view {
                padding: 0px 6px 10px 6px;
                pre {
                  font-size: 12px;
                  line-height: 16px;
                }
              }
            }
            .el-scrollbar__bar {
              &.is-horizontal {
                height: 2px;
              }
              &.is-vertical {
                width: 2px;
              }
              .el-scrollbar__thumb {
                background-color: #409EFF;
              }
            }
            .el-scrollbar__view {
              .deploy-log {
                font-size: 12px;
                line-height: 16px;
              }
            }
          }
        }
      }
    }
  }
</style>
<script>
  export default {
    created() {
//      console.log('created');
    },
    mounted() {
      let dialog = this.$refs['dialog4log'].$refs['dialog'];
      if (this.showStatus.full && dialog) {
        dialog.style.width = '100%';
        dialog.style.height = '100%';
        dialog.style.margin = '0px';
      }
      this.dialog = dialog;
    },
    props: {
      showStatus: {
        type: Object,
        default() {
          return {
            visible: false,
            full: false
          };
        }
      },
      deployLogs: {
        type: Array,
        default() {
          return [];
        }
      }
    },
    watch: {
      'showStatus.visible': function (value) {
        if (value) {
          this.$nextTick(() => {
            this.updateScroll();
          });
        }
      }
    },
    data() {
      return {
        dialog: null,
      }
    },
    methods: {
      updateScroll() {
        let scrollBarWrap = this.dialog.querySelector('.el-dialog__body .el-scrollbar .el-scrollbar__wrap');
        if (scrollBarWrap) {
          scrollBarWrap.scrollTop = 0;
        }
      }
    }

  }
</script>