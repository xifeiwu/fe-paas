<template>
  <div :class="['stage', name, hovering ? 'is-hover':'']">
    <div :class="{'node': true, 'un-selected': !index}"
         @mouseenter="handleMouseEnter($event)"
         @mouseleave="handleMouseLeave($event)"
    >{{index ? index : ''}}</div>
    <div class="description">{{description}}</div>
    <div class="line"></div>
  </div>
</template>
<style lang="scss">
  .stage {
    display: inline-flex;
    position: relative;
    align-items: center;
    height: 30px;
    width: 160px;
    &.is-hover {
      .description {
        font-weight: 700;
      }
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
      background-color: rgb(140, 192, 79);
      box-sizing: border-box;
      width: 28px;
      height: 28px;
      border: 2px solid white;
      /*padding: 2px;*/
      border-radius: 50%;
      cursor: pointer;
      &:hover {
        border-color: #409EFF;
      }

      text-align: center;
      line-height: 24px;
      font-size: 14px;
      color: white;

      &.un-selected {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: transparent;
        border: 2px solid #949393;
        &:hover {
          border-color: #409EFF;
        }
      }
    }
    .description {
      position: absolute;
      top: 0px;
      left: 0px;
      color: #4a4a4a;
      font-size: 14px;
      transform: translate(-50%, -100%);
    }
    &.start, &.end {
      width: 100px;
      .node {
        border-width: 0px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background-color: #949393;
      }
    }
    &:nth-last-child(2) {
      width: 100px;
    }
    &:last-of-type {
      width: 7px;
    }
  }
</style>
<script>
  export default {
    props: {
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
    }
  }
</script>