import Vue from 'vue';
import PopoverMessage from '../popover-message.vue';

const popper = new (Vue.extend(PopoverMessage))({
  el: document.createElement('div')
});
popper.popperClass = 'el-popover--small is-dark';
popper.customStyle = {
  color: '#eb9e05',
  fontSize: '12px',
  fontWeight: 'bold',
  maxWidth: '600px'
};
popper.closeOnLeave = true;
document.body.appendChild(popper.$el);

export default {
  bind(el, binding, vnode) {
    el.addEventListener('mouseenter', evt => {
      if (evt.target === el) {
        popper.show({
          ref: el,
          msg: binding.value
        });
      }
    }, true);
  },
  update: function(el, binding) {
  },
  unbind(el, binding, vnode) {
  },
}