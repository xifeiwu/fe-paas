import Vue from 'vue';

export default {
  name: 'RenderCom',
    props: {
        content: {
          type: String,
          default: 'dark'
        },
    },
    beforeCreate() {
        console.log('beforeCreate');
        this.popperVM = new Vue({
          data: { node: '' },
          render(h) {
            return this.node;
          }
        }).$mount();
    },
    created() {
        // console.log('created');
    },
    mounted() {
        // console.log('mounted');
    },
    render(createElement) {
        // console.log('render');
        this.popperVM.node = (<div ref="popper"><h1>Mounted</h1></div>);
        // console.log(this.popperVM);
        // console.log(this);
        // console.log(this.$slots.default);
        var theEle = createElement('h1', this.content);
        // console.log(theEle);
        var result = this.$slots.default[0];
        return result;
    }

 }