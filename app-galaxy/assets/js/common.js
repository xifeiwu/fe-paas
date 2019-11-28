// common logic for both net and store

export default class Common {

  getPlatform() {
    var [corp, env] = ['finup', 'production'];
    try {
      const platform = BUILD_ENV.PLATFORM;
      // BUILD_ENV is inserted by webpack.DefinePlugin
      if (platform && (typeof(platform) === 'string' || platform instanceof String)
        && /^(renmai|finup):(local|development|test|production|production_gray)$/.test(platform)) {
        [corp, env] = platform.split(':');
      }
    } catch(err) {
    }
    return {
      corp, env
    }
  }
}