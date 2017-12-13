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
  </div>
</template>

<script>
  import layout_demo from './layout.vue'
  import card_demo from './card';
  import alert_demo from './alert';
  import progress_demo from './progress';
  import radio_demo from './radio';
  import popover_demo from './popover.vue';
  import scrollbar_demo from './scrollbar.vue';
  import switch_demo from './switch.vue';
  import checkbox_demo from './checkbox.vue';
  import tooltip_demo from './tooltip.vue';
  import tag_demo from './tag.vue';
  import table_demo from './table.vue';
  import render_com_demo from './render-com.vue'
  import input_demo from './input.vue'
  import input_number_demo from './input-number.vue'
  import select_demo from './select.vue'
  import badge_demo from './badge.vue'
  import button_demo from './button.vue'
  import loading_demo from './loading.vue'
  import form_demo from './form.vue'
  import container_demo from './container.vue'
  import menu_demo from './menu.vue'
  import dropdown_demo from './dropdown.vue'
  import tabs_demo from './tabs.vue'
  import message_box_demo from './message-box.vue'

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
        button_demo, loading_demo, form_demo, container_demo, menu_demo, dropdown_demo, tabs_demo, message_box_demo
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