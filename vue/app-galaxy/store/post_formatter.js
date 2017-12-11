/**
 * Created by xifei.wu on 2017/12/7.
 */

export default {
  infoToCreateAPP(origin) {
    let copy = JSON.parse(JSON.stringify(origin));
    let keyMap = {
      instanceCount: 'instanceNum',
      // appName: 'tag',
      // projectName: 'serviceName',
      appName: 'serviceName',
      projectName: 'tag',
      profiles: 'spaceList',
      buildType: 'packageType',
      mirrorType: 'imageType',
      mirrorLocation: 'image',
      fileLocation: 'volumes',
      groupID: 'groupId',
      relativePathOfParentPOM: 'relativePath',
    }
    let updateProp = function(item) {
      if ('object' === typeof(item)) {
        for (let key in item) {
          if (keyMap.hasOwnProperty(key)) {
            item[keyMap[key]] = item[key];
            delete item[key];
          }
        }
      } else if (Array.isArray(item)) {
        item.forEach(updateProp);
      }
    }
    updateProp(copy);
    return copy;
  }
}