var LayerScroller = function(layers) {
  var self = this;
  var x = 0;

  self.tick = function() {
    x -= 3.0;
    
    for(var i = 0; i < layers.length; i++)
      layers[i].transformX(x);
  };
};
