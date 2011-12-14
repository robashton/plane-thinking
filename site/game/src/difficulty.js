define(function(require) {
  var Difficulty = function(scale) {
    var self = this;
    var original = scale;

    self.reset = function() {
      scale = original;
    };

    self.increase = function(amount) {
      scale += amount;
    };

    self.scale = function(input) { 
      if(!input) return scale;
      var difference = (original - scale);
      difference *= input;
      return original + difference;      
    }    
  };
  return new Difficulty(1.0);
});
