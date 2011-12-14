define(['./eventcontainer'], function(EventContainer) {
  return function() {
    var self = this;
    var eventListeners = {};
    var allContainer = new EventContainer();

    self.on = function(eventName, callback) {
      eventContainerFor(eventName).add(callback);
    };

    self.off = function(eventName, callback) {
      eventContainerFor(eventName).remove(callback);
    }; 

    self.onAny = function(callback) {
      allContainer.add(callback);
    };

    self.raise = function(eventName, data) {
      var container = eventListeners[eventName];

      if(container)
        container.raise(self, data);

      allContainer.raise(self, {
        event: eventName,
        data: data
      });
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
});

