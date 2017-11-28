import Vue from 'vue';
import '../packages/theme-chalk/src/index.scss';
import APP from './app.js';
APP.install(Vue);
import entry from './app.vue';
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