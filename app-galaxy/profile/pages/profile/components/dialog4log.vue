<template>
  <el-dialog :title="title" :visible="showStatus.visible"
             @close="showStatus.visible = false"
             class="dialog-for-log"
             :closeOnClickModal="false"
             ref="dialog-for-log"
             v-loading="showStatus.showLoading"
             element-loading-text="加载中"
             element-loading-spinner="el-icon-loading"
             element-loading-background="rgba(0, 0, 0, 0.1)"
  >
    <el-scrollbar>
      <slot name="log-list"></slot>
    </el-scrollbar>
    <div slot="title" class="dialog-title">
      <span class="title">{{title}}</span>
      <i :class="['paas-icon', showStatus.full ? 'paas-icon-screen-shrink':'paas-icon-screen-expand', !showIconExpand ? 'hide': '']" @click="showStatus.full = !showStatus.full"></i>
    </div>
  </el-dialog>
</template>
<style lang="scss">
  .spa .el-dialog__wrapper {
    &.dialog-for-log {
      .el-dialog {
        background-color: rgba(0, 0, 0, 0.8);
        /*background-color: #303133;*/
        width: 80%;
        height: 70%;
        text-align: left;
        .el-dialog__header {
          padding: 6px;
          border-bottom: 1px solid gray;
          background-color: transparent;
          .dialog-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-right: 30px;
            .title {
              font-size: 14px;
              font-weight: bold;
              color: white;
            }
            .paas-icon {
              display: inline-block;
              font-size: 12px;
              line-height: 100%;
              margin-top: 2px;
              font-weight: normal;
              color:#878d99;
              &.hide {
                visibility: hidden;
              }
              &:hover{
                color:#46A0FC;
              }
              &.paas-icon-screen-expand {
                transform: rotate(45deg);
              }
            }
          }
          .el-dialog__headerbtn {
            top: 8px;
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
                word-wrap: break-word;
                word-break: break-all;
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
        word-wrap: break-word;
        word-break: break-all;
        font-size: 12px;
        line-height: 16px;
        .time {
          color: #FFFF00;
        }
        .thread {
          color: #00FFCC;
        }
        .level {
          color: #FF0000;
        }
        .content, .exception {
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
      let dialog = this.$refs['dialog-for-log'].$refs['dialog'];
      console.log(this.showStatus);
      if (!this.showStatus.hasOwnProperty('full')) {
        this.showIconExpand = false;
        this.showStatus.full = false;
      }
      if (this.showStatus.full && dialog) {
        dialog.style.width = '100%';
        dialog.style.height = '100%';
        dialog.style.margin = '0px';
      }
      this.dialog = dialog;
      // waiting until all dom is mounted
      this.$nextTick(() => {
        this.getScrollWrap();
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
            this.scrollToTop();
            this.getScrollWrap();
            this.scrollListener = this.addListenerForScrollWrap();
          });
        } else {
          this.removeListenerForScrollWrap();
        }
      },
      'showStatus.showLoading': function (value) {
      },
      'showStatus.full': function(value) {
        console.log(`full: ${value}`);
        let dialog = this.$refs['dialog-for-log'].$refs['dialog'];
        if (this.showStatus.full) {
          dialog.style.width = '100%';
          dialog.style.height = '100%';
          dialog.style.margin = '0px';
        }else{
          dialog.style.width = '80%';
          dialog.style.height = '70%';
          dialog.style.margin = 'auto';
          dialog.style.marginTop = '15vh';
        }
      }
    },
    data() {
      return {
        dialog: null,
        scrollWrap: null,
        scrollListener: null,
        showIconExpand: true,
        isExpand: false
      }
    },
    methods: {
      getScrollWrap() {
        if (this.scrollWrap) {
          return;
        }
        this.scrollWrap = this.dialog.querySelector('.el-dialog__body .el-scrollbar .el-scrollbar__wrap');
        return this.scrollWrap;
      },
      addListenerForScrollWrap() {
        let scrollListener = null;
        if (this.scrollWrap) {
          scrollListener = (evt) => {
            let target = evt.target;
            if (target) {
//            console.log(target.scrollTop);
              if (target.scrollTop === 0) {
                this.$emit('scrollTop');
//              console.log('scrollTop');
              } else if (target.scrollTop + target.clientHeight === target.scrollHeight) {
                this.$emit('scrollBottom');
//              console.log('scrollBottom');
              }
            }
          };
          this.scrollWrap.addEventListener('scroll', scrollListener);
        }
        return scrollListener;
      },
      removeListenerForScrollWrap() {
        if (this.scrollWrap && this.scrollListener) {
          this.scrollWrap.removeEventListener('scroll', this.scrollListener);
        }
      },

      scrollToTop() {
        if (this.scrollWrap) {
          this.scrollWrap.scrollTop = 0;
        }
      },
      scrollToBottom() {
        if (!this.scrollWrap) {
          this.getScrollWrap();
          return;
        }
        this.scrollWrap.scrollTop = this.scrollWrap.scrollHeight - this.scrollWrap.clientHeight;
      }
    }

  }
</script>