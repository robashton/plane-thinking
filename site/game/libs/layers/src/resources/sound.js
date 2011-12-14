define(['../shared/eventable'], function(Eventable) {
  return  function(url) {
    Eventable.call(this);  

    var self = this;
    
    self.load = function() {
      var audio = new Audio(url);
      audio.loadeddata = onInitialLoadCompleted;
    };

    var onInitialLoadCompleted = function() {
      self.raise('loaded');
    };

    self.play = function(volume) {
      var audio = new Audio(url);
      audio.volume = volume;
      audio.play();
    };  
  };
});

