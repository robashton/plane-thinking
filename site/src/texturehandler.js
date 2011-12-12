var TextureHandler = function() {
  Eventable.call(this);
  
  var self = this;

  self.handles = function(url) {
    return url.indexOf('.png') > 0;
  };
  
  self.get = function(url) {
    return new Texture(url);
  };
};
