var Entity = function() {
  Eventable.call(this); var self = this;
  var scene = null;
  var eventListeners = {};

  self.setScene = function(nscene) {
    scene = nscene;
    raiseAddedToScene();
  };

  var raiseAddedToScene = function() {
    self.raise('addedToScene', {scene: scene });
  };

  var onAnyEventRaised = function(data) {
    scene.raise(data.event, data.data);
  };

  self.onAny(onAnyEventRaised);
};
