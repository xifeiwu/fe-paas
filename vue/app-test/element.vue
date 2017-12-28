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
    <render_com_demo></render_com_demo>
    <tag_demo></tag_demo>
    <table_demo></table_demo>
    <input_demo></input_demo>
    <input_number_demo></input_number_demo>
    <select_demo></select_demo>
    <badge_demo></badge_demo>
    <button_demo></button_demo>
    <loading_demo></loading_demo>
    <form_demo></form_demo>
    <container_demo></container_demo>
    <menu_demo></menu_demo>
    <message_box_demo></message_box_demo>
    <upload_demo></upload_demo>
    <jsx_demo1></jsx_demo1>
  </div>
</template>

<script>
  import layout_demo from './element/layout.vue'
  import card_demo from './element/card';
  import alert_demo from './element/alert';
  import progress_demo from './element/progress';
  import radio_demo from './element/radio';
  import popover_demo from './element/popover.vue';
  import scrollbar_demo from './element/scrollbar.vue';
  import switch_demo from './element/switch.vue';
  import checkbox_demo from './element/checkbox.vue';
  import tooltip_demo from './element/tooltip.vue';
  import tag_demo from './element/tag.vue';
  import table_demo from './element/table.vue';
  import render_com_demo from './element/render-com.vue'
  import input_demo from './element/input.vue'
  import input_number_demo from './element/input-number.vue'
  import select_demo from './element/select.vue'
  import badge_demo from './element/badge.vue'
  import button_demo from './element/button.vue'
  import loading_demo from './element/loading.vue'
  import form_demo from './element/form.vue'
  import container_demo from './element/container.vue'
  import menu_demo from './element/menu.vue'
  import dropdown_demo from './element/dropdown.vue'
  import tabs_demo from './element/tabs.vue'
  import message_box_demo from './element/message-box.vue'
  import upload_demo from './element/upload.vue'

  // import jsx_demo1 from './jsx/demo1.vue'
  import jsx_demo1 from './jsx/demo1.js'

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
          tooltip_demo, tag_demo, table_demo, render_com_demo, input_demo, input_number_demo, select_demo, badge_demo,
        button_demo, loading_demo, form_demo, container_demo, menu_demo, dropdown_demo, tabs_demo, message_box_demo, upload_demo, jsx_demo1
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