(function () {
  var LuacheckError, argparse, fs, luacheck, path, subprocess;

  argparse = require("./argparse");

  LuacheckError = require("./Error");

  subprocess = require("child_process");

  fs = require("fs");

  path = require("path");

  luacheck = function (filename, options, callback) {

    var asyncMode;
    if (typeof options === 'function') {
      callback = options;
    }

    if (typeof callback !== 'function') {
      asyncMode = false;
    } else {
      asyncMode = true;
    }

    var args, child, cwd, exec, i, len, line, match, ref, regexp;
    if (options == null) {
      options = {};
    }
    if (typeof filename !== "string") {
      throw new Error("Please pass in a filename");
    }
    if (!options.string) {
      fs.access(filename, fs.constants.F_OK, (err) => {
        if (err) {
          throw new Error("'" + filename + "' does not exist");
        }
      });
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

    var file;
    if (options.string) {
      code_to_check = filename.toString();
      exec = exec + ' - <<< "' + filename.toString() + '"'; // We pipe the string over to the input of luacheck since options.string tells us that filename is actually a string of lua source code.
    } else {
      exec += path.resolve('.', filename);
    }

    args = ["--quiet", "--codes", "--ranges", "--no-color", "--formatter", "plain"].concat(argparse(options));
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

    if (!asyncMode) {
      return luacheck.errors;
    } else {
      callback(luacheck.errors);
    }

  };

  module.exports = luacheck;

}).call(this);
