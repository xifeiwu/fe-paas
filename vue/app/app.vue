<template>
  <div class="element-ui-show" style="position: relative">
    <card_demo></card_demo>
    <alert_demo></alert_demo>
    <progress_demo></progress_demo>
    <radio_demo></radio_demo>
    <popover_demo></popover_demo>
    <scrollbar_demo></scrollbar_demo>
    <switch_demo></switch_demo>
    <checkbox_demo></checkbox_demo>
    <tooltip_demo></tooltip_demo>
    <render_com_demo></render_com_demo>
    <tag_demo></tag_demo>
    <table_demo></table_demo>
    <input_demo></input_demo>
    <input_number_demo></input_number_demo>
    <select_demo></select_demo>
    <badge_demo></badge_demo>
    <button_demo></button_demo>
    <loading_demo></loading_demo>
  </div>
</template>

<script>
  import card_demo from '../app/card';
  import alert_demo from '../app/alert';
  import progress_demo from '../app/progress';
  import radio_demo from '../app/radio';
  import popover_demo from '../app/popover.vue';
  import scrollbar_demo from '../app/scrollbar.vue';
  import switch_demo from '../app/switch.vue';
  import checkbox_demo from '../app/checkbox.vue';
  import tooltip_demo from '../app/tooltip.vue';
  import tag_demo from '../app/tag.vue';
  import table_demo from '../app/table.vue';
  import render_com_demo from '../app/render-com.vue'
  import input_demo from '../app/input.vue'
  import input_number_demo from '../app/input-number.vue'
  import select_demo from '../app/select.vue'
  import badge_demo from '../app/badge.vue'
  import button_demo from '../app/button.vue'
  import loading_demo from '../app/loading.vue'

  export default {
      name: 'index',
      data() {
          return {
              msgShow: '我要显示的内容',
              dilogStatus: false,
              msg: {
                  mdValue: '## Vue-markdownEditor'
              }
          }
      },
      components: {
          card_demo, alert_demo, progress_demo, radio_demo, popover_demo, scrollbar_demo, switch_demo, checkbox_demo,
          tooltip_demo, tag_demo, table_demo, render_com_demo, input_demo, input_number_demo, select_demo, badge_demo,
        button_demo, loading_demo
      }
  }
</script>
<style lang="scss" scoped>
  .element-ui-show {
    margin-bottom: 300px;
  }
  .text {
    font-size: 14px;
  }

  .item {
    margin-bottom: 18px;
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }

  .box-card {
    width: 480px;
  }

</style>