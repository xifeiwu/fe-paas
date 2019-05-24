<template>
  <div :class="['stage', item.name, hovering?'is-hover':'', item.active?'is-active':'', item.selected?'is-selected':'un-selected',
                  item.showLoading ? 'is-loading' : '']">
    <div :class="{'node': true,}"
         @mouseenter="handleMouseEnter($event)"
         @mouseleave="handleMouseLeave($event)"
         @click="handleClick($event)"
         v-clickoutside="handleClickOutside"
    >
      <i :class="[item.result == 'FAILURE' || item.result == 'NOT_BUILT' || item.result == 'ABORTED'?'el-icon-close' : 'el-icon-check']" v-if="item.showIcon"></i>
      <svg width="100%" height="100%" version="1.1" xmlns="http://www.w3.org/2000/svg" viewPort="0 0 24 24" v-else-if="item.showLoading">
        <circle r="8" cx="12" cy="12" fill="none" stroke="#D1D3D7" stroke-width="4px" stroke-dashoffset="0"></circle>
        <circle r="8" cx="12" cy="12" fill="none" stroke="#00A5E0" stroke-width="4px" stroke-dasharray="25 25" transform="matrix(0,-1,1,0,0,24)"></circle>
        <circle id="bar" r="2" cx="12" cy="12" fill="#00A5E0"></circle>
      </svg>
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
    &.is-loading {
      .node {
        background-color: transparent !important;
      }
      @keyframes node-loading {
        0% {
          r: 2;
        }
        50% {
          r: 4;
        }
        100% {
          r: 2;
        }
      }
      #bar {
        animation:  node-loading 3s linear infinite;
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
            showLoading: false,
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