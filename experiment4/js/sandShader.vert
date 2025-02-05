#ifdef GL_ES
precision mediump float;
#endif

attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;
varying vec3 vNormal;

void main() {
  vTexCoord = aTexCoord;
  vNormal = normalize(normalMatrix * normal);  // Pass normal to fragment shader
  gl_Position = vec4(aPosition, 1.0);
}
