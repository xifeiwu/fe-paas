<template>
  <div class="demo">
    <the_slot></the_slot>
    <the_clip_board></the_clip_board>
  </div>
</template>
<style>
  .demo {
    margin: 3px;
    padding: 0px;
    border: 1px solid gray;
  }
</style>
<script>
import the_slot from './demo/slot.vue';
import the_clip_board from './demo/clipboard.vue';
export default {
  components: {the_slot, the_clip_board}
}
</script>