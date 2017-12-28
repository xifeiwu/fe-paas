/**
 * Created by xifei.wu on 2017/12/28.
 */
import Slot from './src/main';

/* istanbul ignore next */
Slot.install = function(Vue) {
  Vue.component(Slot.name, Slot);
};

export default Slot;