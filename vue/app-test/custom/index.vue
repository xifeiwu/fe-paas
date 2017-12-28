<template>
  <div class="demo"><the_slot></the_slot></div>
</template>
<style>
  .demo {
    margin: 3px;
    padding: 0px;
    border: 1px solid gray;
  }
</style>
<script>
import the_slot from './slot.vue';
export default {
  components: {the_slot}
}
</script>