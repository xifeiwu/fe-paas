import ClipBoard from '$components/custom/clipboard';
import SlideUpDown from '$components/custom/slide-up-down';

const components = [
  ClipBoard,
  SlideUpDown
];
export default {
  install(Vue) {
    components.map(it => {
      it.install(Vue);
    })
  }
}