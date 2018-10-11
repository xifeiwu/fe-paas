<template>
  <transition name="pop-in-container">
    <div class="pop-in-container left" v-if="popStatus.visible" v-clickoutside="">
      <div class="header" v-if="popStatus.title">
        <span>{{popStatus.title}}</span>
        <i class="paas-icon-fa-caret-left" @click="handleClickOutside"></i>
      </div>
      <div class="content">
        <slot name="content"></slot>
      </div>
    </div>
  </transition>
</template>
<style lang="scss" scoped>
  .pop-in-container-enter {
    &.right {
      right: 0;
      transform: translateX(100%);
    }
    &.left {
      left: 0;
      transform: translateX(-100%);
    }
  }
  .pop-in-container-leave-active {
    &.right {
      right: 0;
      transform: translateX(100%);
    }
    &.left {
      left: 0;
      transform: translateX(-100%);
    }
    //opacity: 0;
  }
  .pop-in-container {
    position: absolute;
    height: 100%;
    /*background-color: rgb(242, 246, 252);*/
    /*background-color: #F2F6FC;*/
    background-color: white;
    border-right: 1px solid #eee;
    transition: opacity .3s, transform .3s;
    width: 800px;
    top: 0px;
    display: flex;
    flex-direction: column;
    .header {
      text-align: center;
      background-color: #eee;
      border-right: 1px solid #eee;
      font-size: 16px;
      line-height: 28px;
      i {
        position: absolute;
        top: 8px;
        right: 10px;
        &:hover {
          color: #409EFF;
        }
      }
    }
    .content {
      flex: 1;
      overflow-y: scroll;
    }
  }
</style>

<script>
  import Clickoutside from 'element-ui/src/utils/clickoutside';
export default {
  directives: { Clickoutside },
  mounted() {
  },
  props: {
    popStatus: {
      type: Object,
      default() {
        return {
          id: null,
          title: '',
          visible: false,
        };
      }
    }
  },
  methods: {
    popToggle() {
      this.popStatus.visible = !this.popStatus.visible;
    },
    popShow() {
      this.popStatus.visible = true;
    },
    popHide() {
      this.popStatus.visible = false;
    },
    popSetId(id) {
      if (this.popStatus.id === id) {
        this.popToggle();
      } else {
        this.popStatus.id = id;
        if (this.popStatus.visible) {
          this.popHide();
          setTimeout(() => {
            this.popShow();
          }, 300);
        } else {
          this.popShow();
        }
      }
    },
    handleClickOutside(evt) {
//      setTimeout(() => {
        if (this.popStatus.visible) {
          this.popStatus.visible = false;
        }
//      });
    }
  }
}
</script>