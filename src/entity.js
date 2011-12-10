var Entity = function() {
  var self = this;
  var scene = null;
  var eventListeners = {};

  self.setScene = function(nscene) {
    scene = nscene;
    raiseAddedToScene();
  };

  var raiseAddedToScene = function() {
    raise('addedToScene', {scene: scene });
  };

  var raise = function(eventName, data) {
    var container = eventListeners[eventName];
    if(container)
      container.raise(self, data);
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
