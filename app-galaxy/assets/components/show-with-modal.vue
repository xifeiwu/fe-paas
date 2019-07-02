<template>
  <transition
          :name="transition"
          @after-enter="handleAfterEnter"
          @after-leave="handleAfterLeave">
    <div class="paas-show-with-modal"
         v-show="status.show"
         :id="tooltipId">
      <div class="container">
        <i class="paas-icon-close" @click="hide" v-if="false"></i>
        <div class="content">
          <slot></slot>
        </div>
      </div>
    </div>
  </transition>
</template>
<style lang="scss">
  .paas-show-with-modal {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-around;
    align-items: center;
    background: rgba(255,255,255,.9);
    .container {
      max-height: 90%;
      max-width: 90%;
      min-height: 100px;
      min-width: 100px;
      position: relative;
      overflow: scroll;
      .paas-icon-close {
        position: absolute;
        right: -20px;
        top: -20px;
        font-size: 24px;
        color: #b4bccc;
        cursor: pointer;
        &:hover {
          color: black;
        }
      }
    }
  }
</style>
<script>
  import {
    PopupManager
  } from 'element-ui/src/utils/popup';

  import { on, off, once, getStyle } from 'element-ui/src/utils/dom';
  import { generateId } from 'element-ui/src/utils/util';

  export default {
    props: {
      closeOnRandomClick: {
        type: Boolean,
        default: true
      },
      transition: {
        type: String,
//        default: 'fade-in-linear'
        default: ''
      }
    },

    data() {
      return {
        status: {
          show: false,
        },
        bodyOverflow: null
      }
    },

    computed: {
      tooltipId() {
        return `show-with-modal-${generateId()}`;
      }
    },
    watch: {
    },

    mounted() {
      if (this.closeOnRandomClick) {
        on(document, 'click', this.handleDocumentClick);
      }
      this.popperElm = this.$el;
    },

    methods: {
      show(node) {
        if (node) {
          this.$slots.default = [node];
        }
        this.status.show = true;

        this.bodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

//        PopupManager.openModal(this.tooltipId, PopupManager.nextZIndex(), null);
        this.$el.style.zIndex = PopupManager.nextZIndex();
      },
      hide() {
        this.status.show = false;
        document.body.style.overflow = this.bodyOverflow;
//        PopupManager.closeModal(this.tooltipId);
      },
      handleDocumentClick(e) {
        this.hide();
      },
      handleAfterEnter() {
        this.$emit('after-enter');
      },
      handleAfterLeave() {
        this.$emit('after-leave');
      },
    },
    beforeDestroy() {
    },
    destroyed() {
      off(document, 'click', this.handleDocumentClick);
    }
  };
</script>
