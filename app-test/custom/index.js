/**
 * Created by xifei.wu on 2017/12/28.
 */
import Slot from 'components/slot';
import ClipBoard from 'components/clipboard';

const components = [
  Slot, ClipBoard
];
export default {
  install(Vue) {
    components.forEach(it => {
      it.install(Vue);
    })
  }
}