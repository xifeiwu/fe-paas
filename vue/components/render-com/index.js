import RenderCom from './src/main';

/* istanbul ignore next */
RenderCom.install = function(Vue) {
    Vue.component(RenderCom.name, RenderCom);
};

export default RenderCom;
