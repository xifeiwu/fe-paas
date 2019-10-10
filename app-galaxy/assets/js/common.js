// common logic for both net and store

export default class Common {
  getPlatform() {
    var [corp, env] = ['finup', 'production'];
    try {
      // BUILD_ENV is inserted by webpack.DefinePlugin
      if (BUILD_ENV.PLATFORM) {
        [corp, env] = BUILD_ENV.PLATFORM.split(':');
      }
    } catch(err) {
    }
    return {
      corp, env
    }
  }
}