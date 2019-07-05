<template>
  <div :class="['paas-dismiss-message', expanded ? 'expanded' : 'shrinked']">
    <custom-slide-up-down :active="slideActive" :duration="duration" class="content">
      <div v-for="item in msgList">{{item}}</div>
    </custom-slide-up-down>
    <i class="paas-icon-double-arrow-right" style="transform: rotate(270deg)" @click="handleClick('shrink')"></i>
    <i class="paas-icon-fa-question" @click="handleClick('expand')"></i>
  </div>
</template>
<style lang="scss" scoped="">
  .paas-dismiss-message {
    flex-direction: row;
    & > .content {
      flex: 1;
      margin-top: 3px;
      padding-left: 8px;
      background-color: #e6a23c;
      background-color: #eee;
      color: #eb9e05;
      font-size: 12px;
      font-weight: bold;
      line-height: 1.5;
      text-align: left;
    }
    & > i {
      display: none;
      font-size: 14px;
      width: 0px;
      line-height: 20px;
      color: #eee;
    }

    &.expanded {
      display: flex;
      /*& > i.paas-icon-double-arrow-right {*/
        /*display: inline-block;*/
      /*}*/
    }
    &.shrinked {
      /*display: inline-block;*/
      .content {
        display: none;
      }
      /*& > i.paas-icon-fa-question {*/
        /*display: inline-block;*/
      /*}*/
    }
  }
</style>

<script>
  export default {
    created() {
    },
    mounted() {
      this.active ? this.expand() : this.shrink();
    },
    props: {
      msgList: {
        type: Array,
        default: []
      },
      showSeconds: {
        type: Number,
        default: 10
      },
      // 是否展示
      active: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        intervalTag: null,
        showTimeCount: 0,
        // 组件是否展开
        expanded: null,
        // 是否展示slide
        slideActive: null,
        // slide动画时间
        duration: 500,
      }
    },
    watch: {
      active(active) {
        if (active) {
          this.expand();
        } else {
          this.shrink();
        }
      },
      expanded(expand) {
        this.$emit('status-change', expand);
      }
    },
    methods: {
      clearInterval() {
        this.showTimeCount = 0;
        if (this.intervalTag) {
          clearInterval(this.intervalTag);
          this.intervalTag = null;
        }
      },
      expand() {
        this.expanded = true;
        this.slideActive = true;
        this.clearInterval();
        this.intervalTag = setInterval(() => {
          this.showTimeCount++;
          if (this.showTimeCount >= this.showSeconds) {
            this.shrink();
          }
        }, 1000);
      },
      shrink() {
        this.slideActive = false;
        this.clearInterval();
        setTimeout(() => {
          this.expanded = false;
        }, this.duration);
      },
      handleClick(action) {
        switch (action) {
          case 'expand':
            this.expand();
            break;
          case 'shrink':
            this.shrink();
            break;
        }
      }
    }
  }
</script>