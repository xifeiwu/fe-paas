<template>
  <transition
          :name="transition"
          @after-enter="handleAfterEnter"
          @after-leave="handleAfterLeave">
    <div
      class="el-popover el-popper"
      :class="[popperClass, content && 'el-popover--plain']"
      ref="popper"
      v-show="showPopper"
      :style="{ width: width + 'px' }"
      :id="tooltipId"
    >
      <div class="el-popover__title" v-if="title" v-text="title"></div>
      <div>{{ content }}</div>
    </div>
  </transition>
</template>
<script>
  import Vue from 'vue';
  import {
    PopupManager
  } from 'element-ui/src/utils/popup';

  const PopperJS = Vue.prototype.$isServer ? function() {} : require('element-ui/src/utils/popper');
  const stop = e => e.stopPropagation();
//  import PopperJS from 'element-ui/src/utils/popper';

//  import Popper from 'element-ui/src/utils/vue-popper';
  import { on, off } from 'element-ui/src/utils/dom';
  import { addClass, removeClass } from 'element-ui/src/utils/dom';
  import { generateId } from 'element-ui/src/utils/util';

  export default {
//    mixins: [Popper],

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
      trigger: {
        type: String,
        default: 'click',
        validator: value => ['click', 'focus', 'hover', 'manual'].indexOf(value) > -1
      },
      closeDelay: {
        type: Number,
        default: 0
      },
      popperClass: String,
      width: {},
      transition: {
        type: String,
        default: 'fade-in-linear'
      }
    },

    data() {
      return {
        reference: null,
        content: '',
        showPopper: false,
        currentPlacement: ''
      }
    },

    computed: {
      tooltipId() {
        return `el-popover-${generateId()}`;
      }
    },
    watch: {
      showPopper(val) {
        val ? this.$emit('show') : this.$emit('hide');
      },
    },

    mounted() {
      if (this.trigger === 'click') {
        on(document, 'click', this.handleDocumentClick);
      } else if (this.trigger === 'hover') {
//        on(reference, 'mouseenter', this.handleMouseEnter);
//        on(popper, 'mouseenter', this.handleMouseEnter);
//        on(reference, 'mouseleave', this.handleMouseLeave);
//        on(popper, 'mouseleave', this.handleMouseLeave);
      }
      this.popperElm = this.$el;
    },

    methods: {
      doToggle() {
        this.showPopper = !this.showPopper;
      },
      show({ref, msg}) {
        if (this.reference && this.reference !== ref && this.showPopper) {
          this.showPopper = false;
        }
        this.$nextTick(() => {
          this.reference = ref;
          this.content = msg;
          this.showPopper = true;
          this.createPopper();
          if (this.closeDelay) {
            setTimeout(() => {
              this.showPopper = false;
            }, this.closeDelay);
          }
        });
      },
      doClose() {
        this.showPopper = false;
//        this.doDestroy();
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
        this.showPopper = false;
      },
      handleAfterEnter() {
        this.$emit('after-enter');
      },
      handleAfterLeave() {
        this.$emit('after-leave');
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
//         console.log(reference);
//         console.log(popper);
        // console.log(options);
        // console.log(reference.offsetParent);
        this.popperJS = new PopperJS(reference, popper, options);
        this.popperJS.onCreate(_ => {
          this.$emit('created', this);
          this.resetTransformOrigin();
          this.$nextTick(this.updatePopper);
        });
        if (typeof options.onUpdate === 'function') {
          this.popperJS.onUpdate(options.onUpdate);
        }
        this.popperJS._popper.style.zIndex = PopupManager.nextZIndex();
//        this.popperElm.addEventListener('click', stop);
      },

      updatePopper() {
        this.popperJS ? this.popperJS.update() : this.createPopper();
      },

      doDestroy() {
        /* istanbul ignore if */
        if (this.showPopper || !this.popperJS) return;
        this.popperJS.destroy();
        this.popperJS = null;
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
