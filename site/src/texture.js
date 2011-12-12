var Texture = function(url) {
  Eventable.call(this);  

  var self = this;
  var image = null;

  self.load = function() {
    image = new Image();
    image.src = url;
    image.loadeddata = onInitialLoadCompleted;
  };

  self.get = function() {
    return image;
  };

  var onInitialLoadCompleted = function() {
    self.raise('loaded');
  };
};
