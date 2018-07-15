(function() {
  var LuacheckError, argparse, fs, luacheck, path, subprocess;

  argparse = require("./argparse");

  LuacheckError = require("./Error");

  subprocess = require("child_process");

  fs = require("fs");

  path = require("path");

  luacheck = function(filename, options, callback) {

    if (typeof options === 'function') {
      callback = options;
    }

    if (typeof callback !== 'function') {
      var asyncMode = false;
    } else {
      var asyncMode = true;
    }

    var args, child, cwd, exec, i, len, line, match, ref, regexp;
    if (options == null) {
      options = {};
    }
    if (typeof filename !== "string") {
      throw new Error("Please pass in a filename");
    }
    if (!fs.existsSync(filename)) {
      throw new Error("'" + filename + "' does not exist");
    }
    luacheck.errors = [];
    exec = "luacheck";
    if (options.exec) {
      exec = path.resolve(options.exec, exec);
    }
    if (process.platform === "win32") {
      exec += ".bat";
    }
    if (options.cwd) {
      cwd = options.cwd;
    } else {
      cwd = path.dirname(filename);
    }
    args = [path.resolve('.', filename), "--quiet", "--codes", "--ranges", "--no-color", "--formatter", "plain"].concat(argparse(options));
    child = subprocess.spawnSync(exec, args, {
      "cwd": cwd,
      "encoding": "utf-8"
    });
    if (child.error) {
      throw child.error;
    }
    regexp = /^(.+)\:(\d+)\:(\d+)\-(\d+)\:\s*\(((E|W)\d+)\)\s*(.+)$/;
    ref = child.stdout.split(/\r?\n/);
    for (i = 0, len = ref.length; i < len; i++) {
      line = ref[i];
      match = regexp.exec(line);
      if (match) {
        luacheck.errors.push(new LuacheckError(match));
      }
    }

    if (!asyncMode){
      return luacheck.errors;
    } else {
      callback(luacheck.errors);
    }
    
  };

  module.exports = luacheck;

}).call(this);
