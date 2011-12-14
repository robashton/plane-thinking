define(['./texture'], function(Texture) {
  return function() {   
    var self = this;

    self.handles = function(url) {
      return url.indexOf('.png') > 0;
    };
    
    self.get = function(url) {
      return new Texture(url);
    };
  };
});


