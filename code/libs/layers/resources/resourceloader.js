define(['../shared/eventable'], function(Eventable) {
  return function(handlers) {
    Eventable.call(this);

    var self = this,
        pendingResourceCount = 0;

    self.get = function(name) {
      var handler = findHandlerForResource(name);
      if(!handler) {
        console.error("Failed to find handler for resource: " + name);
      }
      return loadResourceFromHandler(handler, name);    
    };

    var loadResourceFromHandler = function(handler, name) {
      pendingResourceCount++;
      var resource = handler.get(name);
      resource.on('loaded', onResourceLoaded);
      resource.load();
      return resource;
    };

    var onResourceLoaded = function() {
      pendingResourceCount--;
      if(pendingResourceCount === 0)
        self.raise('all-resources-loaded');
    };

    var findHandlerForResource = function(name) {
      for(var i = 0; i < handlers.length; i++) {
        if(handlers[i].handles(name)) return handlers[i];
      }
      return null;
    };  
  };
});


