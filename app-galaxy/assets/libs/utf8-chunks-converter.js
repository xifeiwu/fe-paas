// convert utf8 chunk
// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000;
export default class Utf8Convert {
  constructor() {
    this.buf = null;
    this.bufList = [];
    this.isChunk = false;
  }

  async readAsArrayBuffer(blob) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.readAsArrayBuffer(blob);
      reader.onload = function() {
        var result = reader.result;
        resolve(result);
      }
      reader.onerror = function(e) {
        reject(e)
      }
    })
  }

  concat(buf1, buf2) {
    if (!buf1) {
      return buf2
    }
    if (!buf2) {
      return buf1;
    }

    var concated = new Uint8Array(buf1.byteLength + buf2.byteLength);
    concated.set(buf1);
    concated.set(buf2, buf1.byteLength);
    return concated;
  }

  // @parms bytes: Uint8Array
  async convert2(buf, cb) {
    if (buf instanceof Blob) {
      buf = await this.readAsArrayBuffer(buf);
    }
    if (buf instanceof ArrayBuffer) {
      buf = new Uint8Array(buf);
    }
    if (buf.byteLength >= 4 * 1024) {
      this.isChunk = true;
    } else {
      this.isChunk = false;
    }
    // console.log(`buf.byteLength: ${buf.byteLength}`);
    // console.log(buf);
    if (this.isChunk) {
      if (!this.isStartValid(buf)) {
        // buf = this.concat(this.buf, buf);
        buf = this.getBufAll(buf);
      }
      // console.log(buf);
      // console.log(this.isStartValid(buf));
      // console.log(this.isEndValid(buf));
      // console.log(this.getLastInValidPos(buf));
      if (!this.isEndValid(buf)) {
        this.bufList.push(buf);
      } else {
        cb(null, this.forceUtf8Slice(this.getBufAll(buf)));
      }
    } else {
      cb(null, this.forceUtf8Slice(this.getBufAll(buf)));
    }
  }

  getBufAll(buf) {
    this.bufList.push(buf);
    var length = this.bufList.reduce((sum, buf) => {
      sum += buf.byteLength;
      return sum
    }, 0);

    var concated = new Uint8Array(length);
    var pos = 0;
    this.bufList.forEach(it => {
      concated.set(it, pos);
      pos += it.byteLength;
    });

    this.bufList.length = 0;
    return concated;
  }

  async convert(buf, cb) {
    if (buf instanceof Blob) {
      buf = await this.readAsArrayBuffer(buf);
    }
    if (buf instanceof ArrayBuffer) {
      buf = new Uint8Array(buf);
    }
    if (this.isEndValid(buf) || buf.byteLength < 2 * 1024) {
      cb(null, this.forceUtf8Slice(this.getBufAll(buf)));
    } else {
      this.bufList.push(buf);
    }
  }

  isStartValid(buf) {
    var pos = this.getInValidPos(buf.subarray(0, 4));
    return pos > 0;
  }
  isEndValid(buf) {
    return this.getInValidPos(buf.subarray(-4)) === 4 || this.getInValidPos(buf.subarray(-3)) === 3
      || this.getInValidPos(buf.subarray(-2)) === 2 || this.getInValidPos(buf.subarray(-1)) === 1
  }
  getLastInValidPos(buf) {
    var size = 8;
    var pos = 0;
    while (pos === 0 && size > 0) {
      pos = this.getInValidPos(buf.subarray(size * -1));
      if (pos === 0) {
        size -= 1;
      }
    }
    return pos - size;
  }

  getInValidPos (buf) {
    var start = 0, end = buf.byteLength;

    var i = start
    while (i < end) {
      var firstByte = buf[i]
      var codePoint = null
      var bytesPerSequence = (firstByte > 0xEF) ? 4
        : (firstByte > 0xDF) ? 3
          : (firstByte > 0xBF) ? 2
            : 1

      if (i + bytesPerSequence <= end) {
        var secondByte, thirdByte, fourthByte, tempCodePoint

        switch (bytesPerSequence) {
          case 1:
            if (firstByte < 0x80) {
              codePoint = firstByte
            }
            break
          case 2:
            secondByte = buf[i + 1]
            if ((secondByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
              if (tempCodePoint > 0x7F) {
                codePoint = tempCodePoint
              }
            }
            break
          case 3:
            secondByte = buf[i + 1]
            thirdByte = buf[i + 2]
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
              if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                codePoint = tempCodePoint
              }
            }
            break
          case 4:
            secondByte = buf[i + 1]
            thirdByte = buf[i + 2]
            fourthByte = buf[i + 3]
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
              if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                codePoint = tempCodePoint
              }
            }
        }
      }
      if (codePoint === null) {
        break;
      } else {
        i += bytesPerSequence
      }
    }
    return i;
  }

  decodeCodePointsArray (codePoints) {
    var len = codePoints.length
    if (len <= MAX_ARGUMENTS_LENGTH) {
      return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
    }

    // Decode in chunks to avoid "call stack size exceeded".
    var res = ''
    var i = 0
    while (i < len) {
      res += String.fromCharCode.apply(
        String,
        codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
      )
    }
    return res
  }

  forceUtf8Slice (buf, start, end) {
    var res = [];
    var start = 0;
    var end = buf.byteLength;

    var i = start;
    while (i < end) {
      var firstByte = buf[i];
      var codePoint = null;
      var bytesPerSequence = (firstByte > 0xEF) ? 4
        : (firstByte > 0xDF) ? 3
          : (firstByte > 0xBF) ? 2
            : 1;

      if (i + bytesPerSequence <= end) {
        var secondByte, thirdByte, fourthByte, tempCodePoint

        switch (bytesPerSequence) {
          case 1:
            if (firstByte < 0x80) {
              codePoint = firstByte
            }
            break;
          case 2:
            secondByte = buf[i + 1]
            if ((secondByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
              if (tempCodePoint > 0x7F) {
                codePoint = tempCodePoint
              }
            }
            break;
          case 3:
            secondByte = buf[i + 1]
            thirdByte = buf[i + 2]
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
              if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                codePoint = tempCodePoint
              }
            }
            break;
          case 4:
            secondByte = buf[i + 1]
            thirdByte = buf[i + 2]
            fourthByte = buf[i + 3]
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
              if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                codePoint = tempCodePoint
              }
            }
        }
      }

      if (codePoint === null) {
        // we did not generate a valid codePoint so insert a
        // replacement char (U+FFFD) and advance only 1 byte
        codePoint = 0xFFFD
        bytesPerSequence = 1
      } else if (codePoint > 0xFFFF) {
        // encode to utf16 (surrogate pair dance)
        codePoint -= 0x10000
        res.push(codePoint >>> 10 & 0x3FF | 0xD800)
        codePoint = 0xDC00 | codePoint & 0x3FF
      }

      res.push(codePoint)
      i += bytesPerSequence
    }

    return this.decodeCodePointsArray(res)
  }
}
// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000;
class ConvertHelper {
  constructor() {
    this.buf = null;
    this.bufList = [];
    this.isChunk = false;
  }

  async readAsArrayBuffer(blob) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.readAsArrayBuffer(blob);
      reader.onload = function() {
        var result = reader.result;
        resolve(result);
      }
      reader.onerror = function(e) {
        reject(e)
      }
    })
  }

  concat(buf1, buf2) {
    if (!buf1) {
      return buf2
    }
    if (!buf2) {
      return buf1;
    }

    var concated = new Uint8Array(buf1.byteLength + buf2.byteLength);
    concated.set(buf1);
    concated.set(buf2, buf1.byteLength);
    return concated;
  }

  // @parms bytes: Uint8Array
  async convert2(buf, cb) {
    if (buf instanceof Blob) {
      buf = await this.readAsArrayBuffer(buf);
    }
    if (buf instanceof ArrayBuffer) {
      buf = new Uint8Array(buf);
    }
    if (buf.byteLength >= 4 * 1024) {
      this.isChunk = true;
    } else {
      this.isChunk = false;
    }
    // console.log(`buf.byteLength: ${buf.byteLength}`);
    // console.log(buf);
    if (this.isChunk) {
      if (!this.isStartValid(buf)) {
        // buf = this.concat(this.buf, buf);
        buf = this.getBufAll(buf);
      }
      // console.log(buf);
      // console.log(this.isStartValid(buf));
      // console.log(this.isEndValid(buf));
      // console.log(this.getLastInValidPos(buf));
      if (!this.isEndValid(buf)) {
        this.bufList.push(buf);
      } else {
        cb(null, this.forceUtf8Slice(this.getBufAll(buf)));
      }
    } else {
      cb(null, this.forceUtf8Slice(this.getBufAll(buf)));
    }
  }

  getBufAll(buf) {
    this.bufList.push(buf);
    var length = this.bufList.reduce((sum, buf) => {
      sum += buf.byteLength;
      return sum
    }, 0);

    var concated = new Uint8Array(length);
    var pos = 0;
    this.bufList.forEach(it => {
      concated.set(it, pos);
      pos += it.byteLength;
    });

    this.bufList.length = 0;
    return concated;
  }

  async convert(buf, cb) {
    if (buf instanceof Blob) {
      buf = await this.readAsArrayBuffer(buf);
    }
    if (buf instanceof ArrayBuffer) {
      buf = new Uint8Array(buf);
    }
    if (this.isEndValid(buf) || buf.byteLength < 2 * 1024) {
      cb(null, this.forceUtf8Slice(this.getBufAll(buf)));
    } else {
      this.bufList.push(buf);
    }
  }

  isStartValid(buf) {
    var pos = this.getInValidPos(buf.subarray(0, 4));
    return pos > 0;
  }
  isEndValid(buf) {
    return this.getInValidPos(buf.subarray(-4)) === 4 || this.getInValidPos(buf.subarray(-3)) === 3
      || this.getInValidPos(buf.subarray(-2)) === 2 || this.getInValidPos(buf.subarray(-1)) === 1
  }
  getLastInValidPos(buf) {
    var size = 8;
    var pos = 0;
    while (pos === 0 && size > 0) {
      pos = this.getInValidPos(buf.subarray(size * -1));
      if (pos === 0) {
        size -= 1;
      }
    }
    return pos - size;
  }

  getInValidPos (buf) {
    var start = 0, end = buf.byteLength;

    var i = start
    while (i < end) {
      var firstByte = buf[i]
      var codePoint = null
      var bytesPerSequence = (firstByte > 0xEF) ? 4
        : (firstByte > 0xDF) ? 3
          : (firstByte > 0xBF) ? 2
            : 1

      if (i + bytesPerSequence <= end) {
        var secondByte, thirdByte, fourthByte, tempCodePoint

        switch (bytesPerSequence) {
          case 1:
            if (firstByte < 0x80) {
              codePoint = firstByte
            }
            break
          case 2:
            secondByte = buf[i + 1]
            if ((secondByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
              if (tempCodePoint > 0x7F) {
                codePoint = tempCodePoint
              }
            }
            break
          case 3:
            secondByte = buf[i + 1]
            thirdByte = buf[i + 2]
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
              if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                codePoint = tempCodePoint
              }
            }
            break
          case 4:
            secondByte = buf[i + 1]
            thirdByte = buf[i + 2]
            fourthByte = buf[i + 3]
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
              if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                codePoint = tempCodePoint
              }
            }
        }
      }
      if (codePoint === null) {
        break;
      } else {
        i += bytesPerSequence
      }
    }
    return i;
  }

  decodeCodePointsArray (codePoints) {
    var len = codePoints.length
    if (len <= MAX_ARGUMENTS_LENGTH) {
      return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
    }

    // Decode in chunks to avoid "call stack size exceeded".
    var res = ''
    var i = 0
    while (i < len) {
      res += String.fromCharCode.apply(
        String,
        codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
      )
    }
    return res
  }

  forceUtf8Slice (buf, start, end) {
    var res = [];
    var start = 0;
    var end = buf.byteLength;

    var i = start;
    while (i < end) {
      var firstByte = buf[i];
      var codePoint = null;
      var bytesPerSequence = (firstByte > 0xEF) ? 4
        : (firstByte > 0xDF) ? 3
          : (firstByte > 0xBF) ? 2
            : 1;

      if (i + bytesPerSequence <= end) {
        var secondByte, thirdByte, fourthByte, tempCodePoint

        switch (bytesPerSequence) {
          case 1:
            if (firstByte < 0x80) {
              codePoint = firstByte
            }
            break;
          case 2:
            secondByte = buf[i + 1]
            if ((secondByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
              if (tempCodePoint > 0x7F) {
                codePoint = tempCodePoint
              }
            }
            break;
          case 3:
            secondByte = buf[i + 1]
            thirdByte = buf[i + 2]
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
              if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                codePoint = tempCodePoint
              }
            }
            break;
          case 4:
            secondByte = buf[i + 1]
            thirdByte = buf[i + 2]
            fourthByte = buf[i + 3]
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
              if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                codePoint = tempCodePoint
              }
            }
        }
      }

      if (codePoint === null) {
        // we did not generate a valid codePoint so insert a
        // replacement char (U+FFFD) and advance only 1 byte
        codePoint = 0xFFFD
        bytesPerSequence = 1
      } else if (codePoint > 0xFFFF) {
        // encode to utf16 (surrogate pair dance)
        codePoint -= 0x10000
        res.push(codePoint >>> 10 & 0x3FF | 0xD800)
        codePoint = 0xDC00 | codePoint & 0x3FF
      }

      res.push(codePoint)
      i += bytesPerSequence
    }

    return this.decodeCodePointsArray(res)
  }
}