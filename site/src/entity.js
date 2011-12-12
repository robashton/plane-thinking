var Entity = function() {
  Eventable.call(this); var self = this;
  var scene = null;
  var eventListeners = {};

  self.setScene = function(nscene) {
    scene = nscene;
    raiseAddedToScene();
  };

  self.clearScene = function() {
    scene = null;
    raiseRemovedFromScene();
  };

  var raiseAddedToScene = function() {
    self.raise('addedToScene', {scene: scene });
  };

  var raiseRemovedFromScene = function() {
    self.raise('removedFromScene');
  };

  var onAnyEventRaised = function(data) {
    if(scene)
      scene.raise(data.event, data.data);
  };

  self.onAny(onAnyEventRaised);
};
