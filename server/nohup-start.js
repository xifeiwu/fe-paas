/**
 * Created by xifei.wu on 2018/2/4.
 */

var path = require('path');
var forever = require('forever-monitor');

let theFile = './start.js';
var child = new(forever.Monitor)(theFile, {
  max: 3,
  silent: true,
  args: [],
  'watch': true, // Value indicating if we should watch files.
  'watchIgnoreDotFiles': null, // Whether to ignore file starting with a '.'
  'watchIgnorePatterns': null, // Ignore patterns to use when watching files.
  'watchDirectory': path.join(__dirname, '../vue/dist'),
  'logFile': './logs/log.log', // Path to log output from forever process (when daemonized)
  'outFile': './logs/out.log', // Path to log output from child stdout
  'errFile': './logs/error.log', // Path to log output from child stderr
  'killTree': true
});

child.on('exit', function() {
  console.log(`${theFile} has exited after 3 restarts`);
  // kill the main thread
  forever.kill(process.pid);
});

child.start();
