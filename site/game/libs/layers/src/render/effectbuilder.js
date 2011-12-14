define(['./effect'], function(Effect) {
  return function(gl) {
    var self = this;
    var shaders = [];

    self.addVertexShaderFromElementWithId = function(id) {
      var vertexText = document.getElementById(id).innerText;
      var vertexShader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vertexShader, vertexText);
      gl.compileShader(vertexShader);
      shaders.push(vertexShader);
      return self;
    };

    self.addFragmentShaderFromElementWithId = function(id) {
      var fragmentText = document.getElementById(id).innerText;
      var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragmentShader, fragmentText);
      gl.compileShader(fragmentShader);
      shaders.push(fragmentShader);
      return self;
    };

    self.build = function() {
      var builtProgram = buildProgram();
      return new Effect(gl, builtProgram);
    }; 

    var buildProgram = function() {
      var program = gl.createProgram();

      for(var i = 0 ; i < shaders.length; i++)
        gl.attachShader(program, shaders[i]);

      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          throw "Couldn't create program";
      }
      return program;
    };

  };
});


