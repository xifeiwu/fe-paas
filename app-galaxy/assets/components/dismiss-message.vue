<template>
  <div :class="['paas-dismiss-message', hide ? 'hide' : '']">
    <div v-for="item in msgList">{{item}}</div>
    <i class="paas-icon-close" @click="hide = true;"></i>
  </div>
</template>
<style lang="scss" scoped="">
  .paas-dismiss-message {
    position: relative;
    padding: 0px 3px;
    background-color: #e6a23c;
    color: black;
    font-size: 12px;
    overflow: hidden;
    &.hide {
      height: 0px;
    }
    .paas-icon-close {
      position: absolute;
      right: 2px;
      top: 2px;
      color: #eee;
      &:hover {
        color: gray;
      }
    }
  }
</style>

<script>
  export default {
    created() {
    },
    mounted() {
      setTimeout(() => {
        this.hide = true;
      }, this.timeout * 1000);
    },
    props: {
      msgList: {
        type: Array,
        default: []
      },
      timeout: {
        type: Number,
        default: 20
      }
    },
    data() {
      return {
        hide: false
      }
    },
    watch: {
      hide(v) {
        setTimeout(() => {
          this.$emit('resize', v);
        }, 200);
      }
    }
  }
</script>