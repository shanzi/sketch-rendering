class HatchMaterial extends THREE.ShaderMaterial
  attributes: {}
  uniforms:
    bakedshadow:
      type: 't'
      value: THREE.ImageUtils.loadTexture('textures/room_baked.png')
    hatch0:
      type: 't'
      value: THREE.ImageUtils.loadTexture('textures/hatch_0.jpg')
    hatch1:
      type: 't'
      value: THREE.ImageUtils.loadTexture('textures/hatch_1.jpg')
    hatch2:
      type: 't'
      value: THREE.ImageUtils.loadTexture('textures/hatch_2.jpg')

  vertexShader: '''
varying vec2 vUv;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vec3 vNormal = normalMatrix * normal; 
  vUv = uv;
}
  '''
  fragmentShader: '''
uniform sampler2D bakedshadow;
uniform sampler2D hatch0;
uniform sampler2D hatch1;
uniform sampler2D hatch2;

varying vec2 vUv;

float shade(const in float shading, const in vec2 uv) {
  float shadingFactor;
  float stepSize = 1.0 / 3.0;

  float alpha = 0.0;
  float scaleWhite = 0.0;
  float scaleHatch0 = 0.0;
  float scaleHatch1 = 0.0;
  float scaleHatch2 = 0.0;

  if (shading <= stepSize) {
    alpha = 3.0 * shading;
    scaleHatch1 = alpha;
    scaleHatch2 = 1.0 - alpha;
  }
  else if (shading > stepSize && shading <= 2.0 * stepSize) {
    alpha = 3.0 * (shading - stepSize);
    scaleHatch0 = alpha;
    scaleHatch1 = 1.0 - alpha;
  }
  else if (shading > 2.0 * stepSize) {
    alpha = 3.0 * (shading - stepSize * 2.0);
    scaleWhite = alpha;
    scaleHatch0 = 1.0 - alpha;
  }

  shadingFactor = scaleWhite + 
    scaleHatch0 * texture2D(hatch0, uv).r +
    scaleHatch1 * texture2D(hatch1, uv).r +
    scaleHatch2 * texture2D(hatch2, uv).r;

  return shadingFactor;
}

void main() {
  vec2 uv = vUv * 15.0;
  vec2 uv2 = vUv.yx * 10.0;
  float shading = texture2D(bakedshadow, vUv).r + 0.1;
  float crossedShading = shade(shading, uv) * shade(shading, uv2) * 0.6 + 0.4;
  gl_FragColor = vec4(vec3(crossedShading), 1.0);
}
  '''
  constructor: ->
    for k, v of @uniforms
      v.value.magFilter = THREE.NearestFilter
      v.value.minFilter = THREE.NearestFilter
      v.value.wrapS = THREE.RepeatWrapping
      v.value.wrapT = THREE.RepeatWrapping
    super(
      attributes: @attributes
      uniforms: @uniforms
      vertexShader: @vertexShader
      fragmentShader: @fragmentShader
    )

module.exports = HatchMaterial
