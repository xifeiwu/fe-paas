<template>
  <div :class="['stage', item.name, hovering?'is-hover':'', item.active?'is-active':'', item.selected?'is-selected':'un-selected']">
    <div :class="{'node': true,}"
         @mouseenter="handleMouseEnter($event)"
         @mouseleave="handleMouseLeave($event)"
         @click="handleClick($event)"
         v-clickoutside="handleClickOutside"
    >
      <i :class="[item.result == 'FAILURE' ?'el-icon-close' : 'el-icon-check']" v-if="item.showIcon"></i>
      <span v-else>{{item.index ? item.index : ''}}</span>
    </div>
    <div class="description">{{item.description}}</div>
    <div class="line"></div>
  </div>
</template>
<style lang="scss" scoped>
  .stage {
    margin-top: 30px;
    display: inline-flex;
    position: relative;
    align-items: center;
    height: 30px;
    width: 120px;
    &.is-hover {
      .description {
      }
    }
    &.is-selected {
      .node {
        width: 28px;
        height: 28px;
        background-color: rgb(140, 192, 79);
        border: 2px solid white;
      }
      &.is-active {
        .description {
          font-weight: 700;
        }
        .node {
          border-color: #409EFF;
        }
      }
    }
    &.un-selected {
      .node {
        width: 24px;
        height: 24px;
        background-color: transparent;
        border: 2px solid #949393;
      }
      &.is-active {
        .description {
          font-weight: 700;
        }
        .node {
          width: 26px;
          height: 26px;
          border-color: #409EFF;
        }
      }
    }
    &.start, &.end {
      width: 70px;
      .node {
        /*cursor: not-allowed;*/
        pointer-events: none;
        border-width: 0px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background-color: #949393;
      }
      .description {
        font-weight: normal;
      }
    }
    &.download, &.download.is-selected.is-active {
      width: 90px;
      .node {
        /*cursor: not-allowed;*/
        pointer-events: none;
        width: 24px;
        height: 24px;
        background-color: #949393;
        border-width: 0px;
      }
      .description {
        font-weight: normal;
      }
    }
    &:nth-last-of-type(2) {
      width: 80px;
    }
    &:nth-last-of-type(1) {
      width: 7px;
    }

    .line {
      height: 4px;
      width: 100%;
      background-color: #949393;
    }
    .node {
      position: absolute;
      left: 0px;
      transform: translateX(-50%);
      box-sizing: border-box;
      border-radius: 50%;
      cursor: pointer;
      text-align: center;
      line-height: 24px;
      font-size: 14px;
      color: white;
      z-index: 10;
    }
    .description {
      position: absolute;
      top: 0px;
      left: 0px;
      color: #4a4a4a;
      font-size: 14px;
      line-height: 100%;
      text-align: center;
      transform: translate(-50%, -100%);
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
      item: {
        type: Object,
        default() {
          return {
            name: 'unknown',
            selected: false,
            description: 'unknown',
            active: false,
            index: 0,
            id: null,
            showIcon: false,
            result: '',
          }
        }
      }
    },
    data() {
      return {
        hovering: false,
      }
    },
    methods: {
      handleMouseEnter(evt) {
//        this.hovering = true;
//        this.$emit('stage-mouse-event', 'enter', evt, this.description);
      },

      handleMouseLeave(evt) {
//        this.hovering = false;
//        this.$emit('stage-mouse-event', 'leave', evt, this.description);
      },

      handleClick(evt) {
        this.item.active = true;
        this.$emit('stage-click-event', evt, this.item);
      },
      handleClickOutside() {
//        this.active = false;
//        this.$emit('stage-click-event', null, null);
      }
    }
  }
</script>