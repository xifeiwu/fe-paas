<template>
  <div :class="{'paas-dismiss-message': true, 'expand': toExpand || expanding || expanded}">
    <custom-slide-up-down :active="expanding" :duration="duration" class="content"
                          @open-end="handleClick('open-end')" @close-end="handleClick('close-end')">
      <div v-for="item in msgList">{{item}}</div>
    </custom-slide-up-down>
    <i v-if="false" lass="paas-icon-double-arrow-right" style="transform: rotate(270deg)" @click="handleClick('shrink')"></i>
    <i v-if="false" class="paas-icon-fa-question" @click="handleClick('expand')"></i>
  </div>
</template>
<style lang="scss" scoped="">
  .paas-dismiss-message {
    flex-direction: row;
    & > .content {
      flex: 1;
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

    &.expand {
      display: flex;
      /*& > i.paas-icon-double-arrow-right {*/
        /*display: inline-block;*/
      /*}*/
    }
    display: none;
  }
</style>

<script>
  export default {
    created() {
    },
    mounted() {
      this.toExpand ? this.expand() : this.shrink();
    },
    props: {
      msgList: {
        type: Array,
        default: []
      },
      showSeconds: {
        type: [Number, String],
        default: 10
      },
      // 开始展示动画
      toExpand: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        intervalTag: null,
        showTimeCount: 0,
        // 动画进行中
        expanding: null,
        // 是否展示完成(is changed after transitionEnd)
        expanded: false,
        // slide动画时间
        duration: 500,
      }
    },
    watch: {
      toExpand(v) {
        if (v) {
          this.expand();
        } else {
          this.shrink();
        }
      },
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
        this.expanding = true;
        this.clearInterval();
        // no auto shrink when showSeconds is zero
        if (this.showSeconds == 0) {
          return;
        }
        this.intervalTag = setInterval(() => {
          this.showTimeCount++;
          if (this.showTimeCount >= this.showSeconds) {
            this.shrink();
          }
        }, 1000);
      },
      shrink() {
        this.expanding = false;
        this.clearInterval();
      },
      handleClick(action) {
        switch (action) {
//          case 'expand':
//            this.expand();
//            break;
//          case 'shrink':
//            this.shrink();
//            break;
          case 'open-end':
            this.expanded = true;
            this.$emit('status-change', true);
            break;
          case 'close-end':
            this.expanded = false;
            this.$emit('status-change', false);
            break;
        }
      }
    }
  }
</script>