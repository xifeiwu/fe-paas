/**
 * Created by xifei.wu on 2017/12/5.
 */
import axios from 'axios';
import URL_LIST from '../config/url';

export default {
  getGroupList: function () {
    return new Promise((resolve, reject) => {
      axios.get(URL_LIST.get_group_id).then(res => {
        if ('data' in res) {
          let data = res.data;
          if (0 === data.code) {
            resolve(data.content);
          }
        }
      }).catch(err => {
        reject(err);
      });
    })
  }
}
