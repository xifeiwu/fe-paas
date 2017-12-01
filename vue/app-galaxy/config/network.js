/**
 * Created by xifei.wu on 2017/12/1.
 */
import Axios from 'axios';
Axios.defaults.withCredentials = true;
Axios.defaults.timeout = 5000;

//添加请求拦截器
Axios.interceptors.request.use(function(config){
  //在发送请求之前做某事
  // console.log('config');
  // console.log(config);
  let token = window.localStorage.getItem('token');
  if (token) {
    config.headers['token'] = token;
  }
  return config;
}, function(error){
  //请求错误时做些事
  return Promise.reject(error);
});

//添加响应拦截器
Axios.interceptors.response.use(function(response){
  if (response && 'data' in response && 'code' in response.data) {
    if (response.data.code === 0) {
      if ('token' in response.headers && window.localStorage.getItem('token') !== response.headers['token']) {
        window.localStorage.setItem('token', response.headers['token']);
      }
    }
  }
  return response;
}, function(error){
  //请求错误时做些事
  return Promise.reject(error);
});

export default Axios;
