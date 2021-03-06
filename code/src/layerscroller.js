define(function(require) {
  var Entity = require('../libs/layers/scene/entity');
  var Difficulty  = require('./difficulty');

  return function() {
    Entity.call(this); var self = this;
    var x = 0;
    var scene = null;

    self.id = function() { return 'scroller-thingy'; }

    self.tick = function() {
      x += 3.0 * Difficulty.scale();
      scene.eachLayer(function(layer) {
        layer.transformX(x);
      });   
    };

    var onAddedToScene = function(data) {
      scene = data.scene;
    };

    self.on('addedToScene', onAddedToScene);
  };

});
