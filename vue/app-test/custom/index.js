/**
 * Created by xifei.wu on 2017/12/28.
 */
import Slot from 'components/slot';

const components = [
  Slot,
];
export default {
  install(Vue) {
    components.forEach(it => {
      it.install(Vue);
    })
  }
}