<template>
  <transition name="pop-in-container">
    <div class="pop-in-container left" v-if="status.visible">
      <div class="header" v-if="title">
        <span>{{title}}</span>
        <i class="paas-icon-fa-caret-left" @click="handleClickOutside"></i>
      </div>
      <slot name="content"></slot>
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
    background-color: #F2F6FC;
    transition: opacity .3s, transform .3s;
    width: 800px;
    top: 0px;
    .header {
      text-align: center;
      background-color: #eee;
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
  }
</style>

<script>
  import Clickoutside from 'element-ui/src/utils/clickoutside';
export default {
  directives: { Clickoutside },
  mounted() {
  },
  props: {
    title: String,
    status: {
      type: Object,
      default() {
        return {
          visible: false,
        };
      }
    }
  },
  methods: {
    handleClickOutside(evt) {
      this.status.visible = false;
    }
  }
}
</script>