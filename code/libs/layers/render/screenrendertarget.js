define(function() {
  return function(gl) {
    var self = this;

    self.upload = function() {
       gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };
    self.clear = function() {};
    self.getTexture = function() { throw "Not supported"; }

  };
});



