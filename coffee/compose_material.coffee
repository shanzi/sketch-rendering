class ComposeMaterial extends THREE.ShaderMaterial
  attributes: {}
  uniforms:
    depthtexture:
      type: 't'
      value: null
    normaltexture:
      type: 't'
      value: null

  vertexShader: '''
varying vec2 vUv;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vUv = uv;
}
  '''
  fragmentShader: '''
uniform sampler2D depthtexture;
uniform sampler2D normaltexture;

varying vec2 vUv;

float planeDistance(const in vec3 positionA, const in vec3 normalA, 
                    const in vec3 positionB, const in vec3 normalB) {
  vec3 positionDelta = positionB-positionA;
  float planeDistanceDelta = max(abs(dot(positionDelta, normalA)), abs(dot(positionDelta, normalB)));
  return planeDistanceDelta;
}

void main() {
  float depthCenter = texture2D(depthtexture, vUv).r;
  float px = 1.0/800.0;

  vec3 leftpos = vec3(vUv.s - px, vUv.t, 1.0 - texture2D(depthtexture, vec2(vUv.s - px, vUv.t)).r);
  vec3 rightpos = vec3(vUv.s + px, vUv.t, 1.0 - texture2D(depthtexture, vec2(vUv.s + px, vUv.t)).r);
  vec3 uppos = vec3(vUv.s, vUv.t - px, 1.0 - texture2D(depthtexture, vec2(vUv.s, vUv.t - px)).r);
  vec3 downpos = vec3(vUv.s, vUv.t + px, 1.0 - texture2D(depthtexture, vec2(vUv.s, vUv.t + px)).r);

  vec3 leftnor = texture2D(normaltexture, vec2(vUv.s - px, vUv.t)).xyz;
  vec3 rightnor = texture2D(normaltexture, vec2(vUv.s + px, vUv.t)).xyz;
  vec3 upnor = texture2D(normaltexture, vec2(vUv.s, vUv.t - px)).xyz;
  vec3 downnor = texture2D(normaltexture, vec2(vUv.s, vUv.t + px)).xyz;

  vec2 planeDist = vec2(
    planeDistance(leftpos, leftnor, rightpos, rightnor),
    planeDistance(uppos, upnor, downpos, downnor));

  float planeEdge = 2.5 * length(planeDist);
  planeEdge = 1.0 - 0.5 * smoothstep(0.0, depthCenter, planeEdge);;

  float normEdge = max(length(leftnor - rightnor), length(upnor - downnor));
  normEdge = 1.0 - 0.2 * smoothstep(0.0, 0.2, normEdge); 

  float edge = planeEdge * normEdge;
  gl_FragColor = vec4(vec3(edge), 1.0);
}
  '''
  constructor: ->
    super(
      attributes: @attributes
      uniforms: @uniforms
      vertexShader: @vertexShader
      fragmentShader: @fragmentShader
    )

module.exports = ComposeMaterial
