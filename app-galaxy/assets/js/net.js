
class Net {
  setVue(Vue) {
  }
  /**
   * get content from response
   * 1. if response if error, return null
   * 2. if response is ok, if content exist return content of response, else return empty object {}
   * @param response
   * @returns null, response err
   *          object, response ok
   *
   * format of success response.data:
   * {
   *    "code": 0,
   *    "t": 1526456817162,
   *    "content": {
   *      "permission": [{
   *        "id": 300,
   *        "name": "应用管理",
   *        "permissionType": "MENU",
   *        "path": "/app",
   *        "parentId": 0,
   *      }],
   *      "user": {
   *        "username": "admin",
   *        "password": null,
   *      }
   *    }
   *  }
   */
  getResponseContent (response) {
    let content = null;
    if ('data' in response) {
      let data = response.data;
      if (0 === data.code) {
        content = data.content ? data.content : {};
      } else {
        // console.log(this.getResponseContent.caller);
        console.log('request error:' + JSON.stringify(data));
      }
    }
    return content;
  }

  /**
   * get the message shown to user from error
   * @param error
   */
  getMsgFromErrorResponse(error) {
    let content = {
      title: '网络错误',
      msg: '请与管理员联系'
    };
    let response = null, data = null;
    if (error.hasOwnProperty('response')) {
      response = error.response;
      if (response.hasOwnProperty('data')) {
        data = response.data;
        if (data.hasOwnProperty('error') && data.hasOwnProperty('path')) {
          content.msg = data.error + ': ' + data.path;
        }
      }
    }
    return content;
  }

  /**
   * get the message to user from data
   * @param data
   * @returns {{success: boolean, msg: string}}
   *
   * format of error response.data
   * {
   *   "msg":"用户名或密码错误",
   *   "code":500,
   *   "t":1526456545447
   * }
   */
  getResponseMsg(response) {
    let result = {
      success: false,
      title: '',
      msg: '失败'
    };
    if ('data' in response) {
      let data = response.data;
      if (0 === data.code) {
        result.success = true;
        result.title = '';
        result.msg = '成功！';
      } else {
        result.success = false;
        result.title = '';
        result.msg = '失败！';
      }
      if (data.hasOwnProperty('msg') && data.msg && (data.msg.length > 0)) {
        result.msg = data.msg
      } else if (data.hasOwnProperty('content')) {
        result.msg = JSON.stringify(data.content);
      }
    }
    // console.log(result);
    return result;
  }
}

export default Net;