/**
 * Created by xifei.wu on 2017/12/1.
 */
import Axios from 'axios';

class NetworkConfig {
  constructor(Vue) {
    Vue.prototype.$ajax = Axios;
    this.setConfig(Vue);
  }

  setConfig(Vue) {
    Axios.defaults.withCredentials = true;
    // Axios.defaults.timeout = 5000;

    let currentToken = Vue.prototype.$getUserInfo('token');
    //添加请求拦截器
    Axios.interceptors.request.use(function(config) {
      //在发送请求之前做某事
      // console.log('config');
      // console.log(config);
      // let token = window.localStorage.getItem('token');
      if (!currentToken) {
        currentToken = Vue.prototype.$getUserInfo('token');
      }
      if (currentToken) {
        config.headers['token'] = currentToken;
      }
      return config;
    }, function(error) {
      //请求错误时做些事
      return Promise.reject(error);
    });

    //添加响应拦截器
    Axios.interceptors.response.use(function(response) {
      if (response && 'data' in response && 'code' in response.data) {
        let statueCode = response.data.code;
        if (0 === statueCode) {
          if ('token' in response.headers && currentToken !== response.headers['token']) {
            // window.localStorage.setItem('token', response.headers['token']);
            Vue.prototype.$setUserInfo('token', response.headers['token']);
          }
        } else if (555 === statueCode) {
          // localStorage.removeItem('token');
          Vue.prototype.$setUserInfo('token', null);
        }
      }
      return response;
    }, function(error) {
      //请求错误时做些事
      return Promise.reject(error);
    });
  }
}

NetworkConfig.Axios = Axios;

export default NetworkConfig;