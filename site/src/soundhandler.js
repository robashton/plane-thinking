var SoundHandler = function() {
  var self = this;

  self.handles = function(path) {
    return path.indexOf('.wav') > 0;
  };

  self.get = function(path) {
    return new Sound(path);
  };
};
