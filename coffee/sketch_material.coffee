class SketchMaterial extends THREE.ShaderMaterial
  depthTexture: null
  normalTexture: null
  attributes: {}
  uniforms: {}
  vertexShader: '''
  '''
  fragmentShader: '''
  '''

  initTextures: (width, height) ->
    @depthTexture = new THREE.WebGLRenderTarget(width, height)
    @normalTexture = new THREE.WebGLRenderTarget(width, height)

  constructor: ->
    super(
      attributes: @attributes
      uniforms: @uniforms
      vertexShader: @vertexShader
      fragmentShader: @fragmentShader
    )

module.exports = SketchMaterial
