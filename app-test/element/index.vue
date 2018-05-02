<template>
  <div class="element-ui-show" style="position: relative">
    <layout_demo></layout_demo>
    <card_demo></card_demo>
    <alert_demo></alert_demo>
    <progress_demo></progress_demo>
    <radio_demo></radio_demo>
    <popover_demo></popover_demo>
    <scrollbar_demo></scrollbar_demo>
    <switch_demo></switch_demo>
    <checkbox_demo></checkbox_demo>
    <tooltip_demo></tooltip_demo>
    <tag_demo></tag_demo>
    <table_demo></table_demo>
    <input_demo></input_demo>
    <input_number_demo></input_number_demo>
    <select_demo></select_demo>
    <multi_select_demo></multi_select_demo>
    <badge_demo></badge_demo>
    <button_demo></button_demo>
    <loading_demo></loading_demo>
    <form_demo></form_demo>
    <container_demo></container_demo>
    <menu_demo></menu_demo>
    <message_box_demo></message_box_demo>
    <upload_demo></upload_demo>
    <!--<jsx_demo1></jsx_demo1>-->
  </div>
</template>

<script>
  import layout_demo from './demo/layout.vue'
  import card_demo from './demo/card';
  import alert_demo from './demo/alert';
  import progress_demo from './demo/progress';
  import radio_demo from './demo/radio';
  import popover_demo from './demo/popover.vue';
  import scrollbar_demo from './demo/scrollbar.vue';
  import switch_demo from './demo/switch.vue';
  import checkbox_demo from './demo/checkbox.vue';
  import tooltip_demo from './demo/tooltip.vue';
  import tag_demo from './demo/tag.vue';
  import table_demo from './demo/table.vue';
  import input_demo from './demo/input.vue'
  import input_number_demo from './demo/input-number.vue'
  import select_demo from './demo/select.vue'
  import multi_select_demo from './demo/multi-select.vue'
  import badge_demo from './demo/badge.vue'
  import button_demo from './demo/button.vue'
  import loading_demo from './demo/loading.vue'
  import form_demo from './demo/form.vue'
  import container_demo from './demo/container.vue'
  import menu_demo from './demo/menu.vue'
  import dropdown_demo from './demo/dropdown.vue'
  import tabs_demo from './demo/tabs.vue'
  import message_box_demo from './demo/message-box.vue'
  import upload_demo from './demo/upload.vue'

  // import jsx_demo1 from './jsx/demo1.vue'
//  import jsx_demo1 from './jsx/demo1.js'

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
          card_demo, layout_demo, alert_demo, progress_demo, radio_demo, popover_demo, scrollbar_demo, switch_demo, checkbox_demo,
          tooltip_demo, tag_demo, table_demo, input_demo, input_number_demo, select_demo, multi_select_demo, badge_demo,
        button_demo, loading_demo, form_demo, container_demo, menu_demo, dropdown_demo, tabs_demo, message_box_demo, upload_demo
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