<template>
  <div :class="['stage', item.name, hovering?'is-hover':'', active?'is-active':'', item.selected?'is-selected':'']">
    <div :class="{'node': true,}"
         @mouseenter="handleMouseEnter($event)"
         @mouseleave="handleMouseLeave($event)"
         @click="handleClick($event)"
         v-clickoutside="handleClickOutside"
    >{{item.index ? item.index : ''}}</div>
    <div class="description">{{description}}</div>
    <div class="line"></div>
  </div>
</template>
<style lang="scss">
  .stage {
    margin-top: 20px;
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
      &.download {
        width: 100px;
        .node {
          width: 24px;
          height: 24px;
          background-color: #949393;
          border-width: 0px;
        }
      }
    }
    &.start, &.end {
      width: 80px;
      .node {
        border-width: 0px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background-color: #949393;
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

      width: 24px;
      height: 24px;
      background-color: transparent;
      border: 2px solid #949393;
    }
    .description {
      position: absolute;
      top: 0px;
      left: 0px;
      color: #4a4a4a;
      font-size: 14px;
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
      console.log(this.active);
    },
    props: {
      item: {
        type: Object,
        default() {
          return {
            name: 'unknown',
            selected: false,
            description: 'unknown',
            index: 0
          }
        }
      },
      name: {
        type: String,
        default: 'normal'
      },
      index: {
        type: Number,
        default: null
      },
      description: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        hovering: false,
        active: false,
      }
    },
    methods: {
      handleMouseEnter(evt) {
        this.hovering = true;
        this.$emit('stage-mouse-event', 'enter', evt, this.description);
//        console.log(this.hovering);
      },

      handleMouseLeave(evt) {
        this.hovering = false;
        this.$emit('stage-mouse-event', 'leave', evt, this.description);
//        console.log(this.hovering);
      },

      handleClick(evt) {
//        console.log(evt);
        this.active = true;
        this.$emit('stage-click-event', evt, this.name);
      },
      handleClickOutside() {
        this.active = false;
      }
    }
  }
</script>