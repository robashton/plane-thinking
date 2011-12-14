define(function() {
  return function(gl, program) {
    var self = this;

    var aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
    var aTextureCoords = gl.getAttribLocation(program, 'aTextureCoords');
    var uProjection = gl.getUniformLocation(program, 'uProjection');
    var uView = gl.getUniformLocation(program, 'uView');
    var uWorld = gl.getUniformLocation(program, 'uWorld');
    var uResolution = gl.getUniformLocation(program, 'uResolution');
    var uColourSampler = gl.getUniformLocation(program, 'uColourSampler');
    var uDepthSampler = gl.getUniformLocation(program, 'uDepthSampler');

    self.begin = function() {
      gl.useProgram(program);
    };  

    self.buffers = function(vertexBuffer, textureBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(aVertexPosition);

      gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
      gl.vertexAttribPointer(aTextureCoords, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(aTextureCoords);
    };

    self.camera = function(camera) {
      gl.uniformMatrix4fv(uProjection, false, camera.projection);
      gl.uniformMatrix4fv(uView, false, camera.view);
      gl.uniformMatrix4fv(uWorld, false, camera.world);
      gl.uniform2f(uResolution, false, camera.resolution);
    };

    self.inputTextures = function(inputColour, depth) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, inputColour);
      gl.uniform1i(uColourSampler, 0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, depth);
      gl.uniform1i(uDepthSampler, 1);
    };

    self.render = function() {
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
  };
});


