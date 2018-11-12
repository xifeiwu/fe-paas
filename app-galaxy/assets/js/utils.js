import BaseUtils from '$assets/js/utils';

export default class Utils extends BaseUtils {
  constructor() {
    super();
  }

  formatMilliSeconds(ms) {
    const ss = 1000;
    const mi = ss * 60;
    const hh = mi * 60;
    const dd = hh * 24;

    const floatToInt = (v) => {
      return Math.floor(v);
    }

    var day = floatToInt(ms / dd);
    var hour = floatToInt((ms - day * dd) / hh);
    var minute = floatToInt((ms - day * dd - hour * hh) / mi);
    var second = floatToInt((ms - day * dd - hour * hh - minute * mi) / ss);
    var milliSecond = floatToInt(ms - day * dd - hour * hh - minute * mi - second * ss);

    var timeList = [];
    if(day > 0) {
      timeList.push(`${day}天`);
    }
    if(hour > 0) {
      timeList.push(`${hour}小时`);
    }
    if(minute > 0) {
      timeList.push(`${minute}分`);
    }
    if(second > 0) {
      timeList.push(`${second}秒`);
    }
    if(milliSecond > 0) {
      timeList.push(`${milliSecond}毫秒`);
    }
    return timeList.join('');
  }

  // get Date from DateTime or timeStamp
  getDate(dateOrLong) {
    var result = dateOrLong;
    if (!(dateOrLong instanceof Date)) {
      result = new Date(dateOrLong);
    }
    result.setHours(0);
    result.setMinutes(0);
    result.setSeconds(0);
    return result.getTime();
  }
  getDate2(dt) {
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  }
}