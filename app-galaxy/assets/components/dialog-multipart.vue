<template>
  <el-dialog :visible="showStatus.visible"
             @close="handleIconClick('close')"
             class="dialog-for-log"
             customClass="dialog-for-log"
             :appendToBody="true"
             :fullscreen="fullScreen"
             :closeOnClickModal="false"
             ref="dialog-for-log"
             top="80px"
  >
    <div slot="title" class="dialog-title">
      <div class="title">
        <el-tabs type="border-tab" v-model="showStatus.currentModule">
          <el-tab-pane v-for="item in showStatus.moduleList" :label="item.label" :name="item.key"
                       :key="item.key"></el-tab-pane>
        </el-tabs>
      </div>
      <slot name="icons"></slot>
      <!--class="icons slot"-->
      <div class="icons fixed">
        <i :class="['paas-icon', fullScreen ? 'paas-icon-screen-shrink':'paas-icon-screen-expand']"
           @click="handleIconClick('expand-or-shrink')"></i>
        <i class="el-icon el-icon-close" @click="handleIconClick('close')"></i>
      </div>
    </div>
    <el-scrollbar v-loading="showStatus.loading"
                  element-loading-text="加载中"
                  element-loading-spinner="el-icon-loading"
                  element-loading-background="rgba(0, 0, 0, 0.1)">
      <slot name="content"></slot>
    </el-scrollbar>
  </el-dialog>
</template>
<style lang="scss">
  .el-dialog__wrapper.dialog-for-log {
    /*font-family: "微软雅黑", 'Microsoft Yahei','HelveticaNeue',sans-serif;*/
    /*font-family: Helvetica, Arial, sans-serif;*/
    font-family: Consolas, Menlo, Courier, monospace;
    -webkit-font-smoothing: antialiased;
    .el-dialog.dialog-for-log {
      background-color: rgba(0, 0, 0, 0.9);
      width: 95%;
      max-width: 1500px;
      height: 75%;
      text-align: left;
      &.is-fullscreen {
        width: 100%;
        margin-top: 0;
        margin-bottom: 0;
        height: 100%;
        overflow: auto;
      }
      .el-dialog__header {
        height: 28px;
        box-sizing: content-box;
        padding: 0px;
        margin: 0px;
        border-bottom: 1px solid gray;
        background-color: transparent;
        .dialog-title {
          height: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          /*margin-right: 28px;*/
          font-size: 14px;
          .title {
            flex: 1;
            color: white;
            font-weight: bold;
            .el-tabs {
              height: 100%;
              height: 28px;
              padding-top: 3px;
              background-color: black;
              .el-tabs__header {
                border-bottom: 1px solid gray;
                .el-tabs__item {
                  border-color: gray;
                  font-weight: bold;
                  &.is-active {
                    background: #aaa;
                    color: white;
                  }
                }
              }
              .el-tabs__content {
                display: none;
              }
            }
          }
          .icons {
            color: white;
            display: inline-flex;
            align-items: center;
            &.fixed {
              margin-right: 5px;
            }
            > i {
              color: white;
              margin: 0px 2px;
              display: inline-block;
              color: #878d99;
              font-size: 14px;
              line-height: 100%;
              height: 14px;
              font-weight: normal;
              cursor: pointer;
              &:hover {
                color: #46A0FC;
              }
            }
          }
        }
        > .el-dialog__headerbtn {
          display: none;
        }
      }
      .el-dialog__body {
        padding: 0px;
        color: white;
        height: calc(100% - 30px);
        box-sizing: border-box;
        overflow: scroll;
        .el-scrollbar {
          height: 100%;
          font-size: 14px;
          line-height: 16px;
          &__thumb {
            background-color: #409EFF;
            /*background-color: white;*/
          }
          &__view {
            color: lightgray;
            /*padding: 5px;*/
          }
          .el-scrollbar__wrap {
            .el-scrollbar__view {
              box-sizing: border-box;
              // min-height: calc(100% - 10px);
            }
          }
        }
        .log-item {
          .info {
            color: #409EFF;
            font-weight: bold;
          }
          .warning {
            color: #E6A23C;
            font-weight: bold;
          }
          .error {
            color: #F56C6C;
            font-weight: bold;
          }
          .success {
            color: #67C23A;
            font-weight: bold;
          }
        }
      }
    }
  }
</style>
<script>
  export default {
    created() {
    },
    mounted() {
    },
    beforeDestroy() {
    },
    props: {
      showStatus: {
        type: Object,
        default() {
          return {
            title: '日志',
            visible: false,
            loading: false,
            currentModule: null,
            moduleList: []
          };
        }
      }
    },
    watch: {
      'showStatus.visible': function (visible) {
        if (visible) {
          this.show();
        } else {
          this.hide();
        }
      },
      'showStatus.currentModule': function (currentModule) {
        this.$emit('module-change', currentModule);
      }
    },
    data() {
      return {
        top: '80px',
        fullScreen: false,
        dialog: null,
        scrollWrap: null,
        // 是否滚动到了最底端
        isScrolledBottom: true,
      }
    },
    methods: {
      show() {
        this.$nextTick(() => {
          const clientHeight = this.$el.clientHeight;
          this.top = `${parseInt(clientHeight * 0.1)}px`;
          // make sure dialog and scrollWrap is find
          this.dialog = this.$refs['dialog-for-log'].$refs['dialog'];
          this.scrollWrap = this.dialog.querySelector('.el-dialog__body .el-scrollbar .el-scrollbar__wrap');
          if (!this.dialog || !this.scrollWrap) {
            console.log('error: dialog or scrollWrap is not found!');
            return;
          }
          this.scrollWrap.addEventListener('scroll', this.scrollListener);
          this.scrollToTop();
        });
      },
      hide() {
        if (!this.scrollWrap) {
          return;
        }
        this.scrollWrap.removeEventListener('scroll', this.scrollListener);
        // remove content when dialog is hidden
        this.$slots.content = [];
      },

      handleIconClick(action) {
        switch (action) {
          case 'expand-or-shrink':
            this.fullScreen = !this.fullScreen;
            break;
          case 'close':
            this.showStatus.visible = false;
            this.$emit('close');
            break;
        }
      },

      scrollListener(evt) {
        let target = evt.target;
        if (target) {
          if (target.scrollTop === 0) {
            this.$emit('scrollTop');
          } else {
            this.isScrolledBottom = target.scrollTop + target.clientHeight === target.scrollHeight;
            if (this.isScrolledBottom) {
              this.$emit('scrollBottom');
            }
          }
        }
      },

      scrollToTop() {
        if (!this.scrollWrap) {
          return;
        }
        this.scrollWrap.scrollTop = 0;
      },
      scrollToBottom() {
        if (!this.scrollWrap) {
          return;
        }
        this.scrollWrap.scrollTop = this.scrollWrap.scrollHeight - this.scrollWrap.clientHeight;
      }
    }

  }
</script>
