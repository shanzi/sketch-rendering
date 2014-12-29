class HatchMaterial extends THREE.ShaderMaterial
  attributes: {}
  uniforms:
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

uniform vec3 directionalLightColor[MAX_DIR_LIGHTS];
uniform vec3 directionalLightDirection[MAX_DIR_LIGHTS];

varying vec2 vUv;
varying float shading;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

  vec3 vNormal = normalMatrix * normal; 

  shading = 0.0;
  for(int l = 0; l < MAX_DIR_LIGHTS; l++) {
    vec3 lightDirection = directionalLightDirection[l];
    shading += dot(lightDirection, vNormal);
  }
  shading = max(shading, 0.0);

  vUv = uv;
}
  '''
  fragmentShader: '''
uniform sampler2D hatch0;
uniform sampler2D hatch1;
uniform sampler2D hatch2;

varying vec2 vUv;
varying float shading;

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
  //gl_FragColor = vec4(vec3(shading), 1.0);
  float crossedShading = shade(shading, vUv) * shade(shading, vec2(vUv.t, vUv.s)) * 0.8 + 0.2;
  gl_FragColor = vec4(vec3(crossedShading), 1.0);
}
  '''
  constructor: ->
    uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib['lights'], {}])
    for k, v of @uniforms
      v.value.magFilter = THREE.NearestFilter
      v.value.minFilter = THREE.NearestFilter
      v.value.wrapS = THREE.RepeatWrapping
      v.value.wrapT = THREE.RepeatWrapping
      uniforms[k] = v
    @uniforms = uniforms
    @lights = true
    super(
      attributes: @attributes
      uniforms: @uniforms
      vertexShader: @vertexShader
      fragmentShader: @fragmentShader
    )

module.exports = HatchMaterial
