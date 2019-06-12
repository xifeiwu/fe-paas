<template>
  <transition
          :name="transition"
          @after-enter="handleAfterEnter"
          @after-leave="handleAfterLeave">
    <div
            class="el-popover el-popper"
            :class="[popperClass, content && 'el-popover--plain']"
            ref="popper"
            v-show="popperStatus.show"
            :style="{ width: width + 'px' }"
            :id="tooltipId"
    >
      <div class="popover_header">
        <span class="popover_title" v-if="title" v-text="title"></span>
        <button class="popover-close-button" type="button" @click="doClose">
          <i class="el-dialog__close el-icon el-icon-close"></i>
        </button>
      </div>
      <!--<div class="el-popover__title" v-if="title" v-text="title"></div>-->
      <div class="content" v-if="contentType === 'html'" v-html="content"></div>
      <div class="content" v-if="contentType === 'text'">{{ content }}</div>
      <slot class="content" name="content" v-if="contentType === 'node'"></slot>
    </div>
  </transition>
</template>
<style lang="scss">
  .paas-popover-element-with-modal-mask {
    .content {
      font-size: 14px;
    }
  }
  .popover_header {
    margin-bottom: 12px;
    .popover_title {
      font-weight: bold;
      color: #2d2f33;
      font-size: 16px;
      line-height: 1;
    }
    .popover-close-button {
      position: absolute;
      right: 5px;
      padding: 0;
      background: 0 0;
      border: none;
      outline: 0;
      cursor: pointer;
      font-size: 16px;
      &:hover {
        color: #63afff;
      }
    }
  }
</style>
<script>
  import Vue from 'vue';
  import {
    PopupManager
  } from 'element-ui/src/utils/popup';

  const PopperJS = Vue.prototype.$isServer ? function() {} : require('element-ui/src/utils/popper');
  import { on, off, once } from 'element-ui/src/utils/dom';
  import { addClass, removeClass } from 'element-ui/src/utils/dom';
  import { generateId } from 'element-ui/src/utils/util';

  export default {
    props: {
      title: String,
      placement: {
        type: String,
        default: 'bottom'
      },
      boundariesPadding: {
        type: Number,
        default: 5
      },
      offset: {
        default: 0
      },
      visibleArrow: {
        default: true
      },
      arrowOffset: {
        type: Number,
        default: 0
      },
      appendToBody: {
        type: Boolean,
        default: true
      },
      popperOptions: {
        type: Object,
        default() {
          return {
            gpuAcceleration: false
          };
        }
      },

      closeOnRandomClick: {
        type: Boolean,
        default: false
      },
      // 延迟多长时间，自动关闭
      closeDelay: {
        type: Number,
        default: 0
      },
      closeOnLeave: {
        type: Boolean,
        default: false
      },
      popperClass: {
        type: String,
        default: 'paas-popover-element-with-modal-mask'
      },
      width: {},
      transition: {
        type: String,
        default: 'fade-in-linear'
      },
      showModal: {
        type: Boolean,
        default: true
      }
    },

    data() {
      return {
        reference: null,
        referenceInfo: {
          zIndex: null
        },
        content: '',
        contentType: 'node',
        popperStatus: {
          show: false,
          ref:null
        },
        currentPlacement: ''
      }
    },

    computed: {
      tooltipId() {
        return `el-popover-${generateId()}`;
      }
    },
    watch: {
      'popperStatus.show': function(show) {
        if (show) {
          this.$emit('show');
        } else {
          this.$emit('hide');
          this.reference.style.zIndex = this.referenceInfo.zIndex;
          if (this.showModal) {
            PopupManager.closeModal(this.tooltipId);
          }
        }
      },
    },

    mounted() {
      if (this.closeOnRandomClick) {
        on(document, 'click', this.handleDocumentClick);
      }
      this.popperElm = this.$el;
    },

    methods: {
      show({ref, msg, type = 'node'}) {
        if (['text', 'html'].indexOf(type) > -1) {
          this.content = msg;
        }
        this.contentType = type;

        this.$nextTick(() => {
          this.reference = ref;
          this.referenceInfo.zIndex = window.getComputedStyle(ref)['zIndex'];
          this.popperStatus.show = true;
          this.popperStatus.ref = ref;
          this.createPopper();
          if (this.closeDelay) {
            setTimeout(() => {
              if (this.popperStatus.ref === ref) {
                this.popperStatus.show = false;
              }
            }, this.closeDelay);
          }
          if (this.closeOnLeave) {
            once(ref, 'mouseleave', () => {
              this.doClose();
            })
          }
        });
      },
      isShowing() {
        return this.popperStatus.show;
      },

      createPopper() {
        if (this.$isServer) return;
        this.currentPlacement = this.currentPlacement || this.placement;
        if (!/^(top|bottom|left|right)(-start|-end)?$/g.test(this.currentPlacement)) {
          return;
        }

        const options = this.popperOptions;
        const popper = this.popperElm = this.popperElm || this.popper || this.$refs.popper;
        let reference = this.reference || this.$refs.reference;

        if (!reference &&
          this.$slots.reference &&
          this.$slots.reference[0]) {
          reference = this.$slots.reference[0].elm;
        }

        if (!popper || !reference) return;
        if (this.visibleArrow) this.appendArrow(popper);
        if (this.appendToBody) document.body.appendChild(this.popperElm);
        if (this.popperJS && this.popperJS.destroy) {
          this.popperJS.destroy();
        }

        options.placement = this.currentPlacement;
        options.offset = this.offset;
        this.popperJS = new PopperJS(reference, popper, options);
        this.popperJS.onCreate(_ => {
          this.$emit('created', this);
          this.resetTransformOrigin();
          this.$nextTick(this.updatePopper);
        });
        if (typeof options.onUpdate === 'function') {
          this.popperJS.onUpdate(options.onUpdate);
        }
        if (this.showModal) {
          PopupManager.openModal(this.tooltipId, PopupManager.nextZIndex(), null);
          this.reference.style.zIndex = PopupManager.nextZIndex();
          this.popperJS._popper.style.zIndex = PopupManager.nextZIndex();
        }
      },

      handleDocumentClick(e) {
        let reference = this.reference;
        const popper = this.popper || this.$refs.popper;
        if (!this.$el ||
          !reference ||
          this.$el.contains(e.target) ||
          reference.contains(e.target) ||
          !popper ||
          popper.contains(e.target)) return;
        this.popperStatus.show = false;
      },
      handleAfterEnter() {
        this.$emit('after-enter');
      },
      handleAfterLeave() {
        this.$emit('after-leave');
      },

      updatePopper() {
        this.popperJS ? this.popperJS.update() : this.createPopper();
      },

      destroyPopper() {
        if (this.popperJS) {
          this.resetTransformOrigin();
        }
      },

      resetTransformOrigin() {
        let placementMap = {
          top: 'bottom',
          bottom: 'top',
          left: 'right',
          right: 'left'
        };
        let placement = this.popperJS._popper.getAttribute('x-placement').split('-')[0];
        let origin = placementMap[placement];
        this.popperJS._popper.style.transformOrigin = ['top', 'bottom'].indexOf(placement) > -1 ? `center ${ origin }` : `${ origin } center`;
      },

      appendArrow(element) {
        let hash;
        if (this.appended) {
          return;
        }

        this.appended = true;

        for (let item in element.attributes) {
          if (/^_v-/.test(element.attributes[item].name)) {
            hash = element.attributes[item].name;
            break;
          }
        }

        const arrow = document.createElement('div');

        if (hash) {
          arrow.setAttribute(hash, '');
        }
        arrow.setAttribute('x-arrow', '');
        arrow.className = 'popper__arrow';
        element.appendChild(arrow);
      },

      // hide realated node
      doClose() {
        this.popperStatus.show = false;
//        this.doDestroy();
      },

      // remove realated node
      doDestroy() {
        /* istanbul ignore if */
        if (this.popperJS) {
          this.popperJS.destroy();
          this.popperJS = null;
        }
        if (this.popperElm && this.popperElm.parentNode === document.body) {
          document.body.removeChild(this.popperElm);
        }
      }
    },
    beforeDestroy() {
      this.doDestroy();
//      if (this.popperElm && this.popperElm.parentNode === document.body) {
//        this.popperElm.removeEventListener('click', stop);
//        document.body.removeChild(this.popperElm);
//      }
    },
    destroyed() {
      off(document, 'click', this.handleDocumentClick);
    }
  };
</script>
