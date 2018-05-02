<template>
  <div class="container">
    <input type="text" v-model="message">
    <button type="button"
            v-clipboard:copy="message"
            v-clipboard:success="done">Copy!</button>
  </div>
</template>
<script>
  module.exports = {
    created() {
//      console.log(this.$copyText);
    },
    data: function () {
      return {
        message: 'Copy These Text'
      }
    },
    methods: {
      done: function () {
        alert('Copied!')
      }
    }
  }
</script>