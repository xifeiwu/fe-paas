import ClipBoard from '$components/custom/clipboard';

const components = [
  ClipBoard
]
export default {
  install(Vue) {
    components.map(it => {
      it.install(Vue);
    })
  }
}