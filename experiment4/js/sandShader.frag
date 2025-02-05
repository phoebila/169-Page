#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D texture;
uniform vec2 uResolution;
varying vec2 vTexCoord;
varying vec3 vNormal;

void main() {
  // Fetch the color from the texture
  vec4 texColor = texture2D(texture, vTexCoord);

  // Calculate how facing the camera the surface is
  float facingFront = abs(vNormal.z);  // Based on the normal of the surface

  // Mix two shades of sand based on the surface angle
  vec3 sandColor = mix(
    vec3(194.0/255.0, 178.0/255.0, 128.0/255.0),  // Sand base color
    vec3(237.0/255.0, 201.0/255.0, 175.0/255.0),  // Lighter sand color
    facingFront
  );

  // Apply opacity based on how parallel to the camera the surface is
  float opacity = 1.0 - facingFront * 0.5;  // Less opaque when parallel to camera
  vec4 finalColor = vec4(sandColor, texColor.a * opacity);

  gl_FragColor = finalColor;
}
