(function() {
  var LuacheckError,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  module.exports = LuacheckError = (function(superClass) {
    extend(LuacheckError, superClass);

    function LuacheckError(match) {
      this.raw = match[0]; 
      this.file = match[1];
      this.line = match[2]; 
      this.start = match[3];
      this.end = match[4]; 
      this.code = match[5]; 
      this.reason = match[6];
      this.severity = (this.code.toString().contains('W')) ? 'Warning' : 'Error';
      LuacheckError.__super__.constructor.call(this, this.reason, this.file, this.line);
    }

    return LuacheckError;

  })(Error);

}).call(this);
