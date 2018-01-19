<template>
  <el-dialog :title="title" :visible="showStatus.visible"
             @close="showStatus.visible = false"
             class="dialog4log"
             :closeOnClickModal="false"
             ref="dialog4log"
  >
    <el-scrollbar>
      <slot name="log-list"></slot>
    </el-scrollbar>
  </el-dialog>
</template>
<style lang="scss">
  .el-dialog__wrapper {
    &.dialog4log {
      .el-dialog {
        background-color: rgba(0, 0, 0, 0.8);
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
              .log-item {
                font-size: 12px;
                line-height: 16px;
              }
            }
          }
        }
      }
    }

    /*style for dialog log-run-log*/
    &.log-run-log {
      .log-item {
        font-size: 12px;
        line-height: 16px;
        .time {
          color:#FFFF00;
        }
        .thread {
          color: #00FFCC;
        }
        .level {
          color: #FF0000;
        }
        .content, .exception{
          color: white;
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
      // waiting until all dom is mounted
      this.$nextTick(() => {
        this.scrollWrap = this.dialog.querySelector('.el-dialog__body .el-scrollbar .el-scrollbar__wrap');
        this.scrollWrap && this.scrollWrap.addEventListener('scroll', (evt) => {
          let target = evt.target;
          if (target) {
//            console.log(target.scrollTop);
            if (target.scrollTop === 0) {
              this.$emit('scrollTop');
              console.log('scrollTop');
            } else if (target.scrollTop + target.clientHeight === target.scrollHeight) {
              this.$emit('scrollBottom');
              console.log('scrollBottom');
            }
          }
        })
      });
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
      title: {
        type: String,
        default: '日志'
      },
    },
    watch: {
      'showStatus.visible': function (value) {
        if (value) {
          this.$nextTick(() => {
            this.scrollTop();
          });
        }
      }
    },
    data() {
      return {
        dialog: null,
        scrollWrap: null,
      }
    },
    methods: {
      scrollTop() {
        if (this.scrollWrap) {
          this.scrollWrap.scrollTop = 0;
        }
      }
    }

  }
</script>