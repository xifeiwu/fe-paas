import Vue from 'vue';
import '../packages/theme-chalk/src/index.scss';
import APP from './element/element.js';
APP.install(Vue);
import entry from './element.vue';
// import progressEntry from './progress'

// console.log(entry);
// console.log(Card);


new Vue({ // eslint-disable-line
  el: '#app',
  render: h => h(entry)
});

// new Vue({ // eslint-disable-line
//     el: '#progress',
//     data: {
//         thePercent: 50
//     },
//     render: h => h(entry)
// });

// new Vue({ // eslint-disable-line
//   render: h => h(entry),
//   router
// }).$mount('#app');