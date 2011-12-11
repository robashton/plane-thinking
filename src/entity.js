var Entity = function() {
  var self = this;
  var scene = null;
  var eventListeners = {};

  self.setScene = function(nscene) {
    scene = nscene;
    raiseAddedToScene();
  };

  var raiseAddedToScene = function() {
    self.raise('addedToScene', {scene: scene });
  };

  self.raise = function(eventName, data) {
    var container = eventListeners[eventName];
    if(container)
      container.raise(self, data);
    scene.sendEvent(self, eventName, data);
  };

  self.on = function(eventName, callback) {
    eventContainerFor(eventName).add(callback);
  };

  self.off = function(eventName, callback) {
    eventContainerFor(eventName).remove(callback);
  };  

  var eventContainerFor = function(eventName) {
    var container = eventListeners[eventName];
    if(!container) {
      container =  new EventContainer();
      eventListeners[eventName] = container;
    }
    return container;
  };
  
};
