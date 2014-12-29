ComposeMaterial = require './compose_material'

class SceneManager
  objectScene: new THREE.Scene()
  composeScene: new THREE.Scene()

  depthMaterial: new THREE.MeshDepthMaterial()
  normalMaterial: new THREE.MeshNormalMaterial()
  hatchMaterial: null
  composeMaterial: new ComposeMaterial()

  renderer: new THREE.WebGLRenderer(antialias: true)

  constructor: (@element) ->
    @width = @element.clientWidth
    @height = @element.clientHeight

    @initTextures()

    @initObjectCamera()
    @initComposeCamera()

    @initObjectScene()
    @initComposeScene()

    @initRenderer()

  initObjectCamera: ->
    @objectCamera = new THREE.PerspectiveCamera(45, @width / @height, 1, 30)
    @objectCamera.position.z = 2
    @objectCamera.position.x = 14
    @objectCamera.position.y = 3
    @objectCamera.lookAt(new THREE.Vector3(0, 0, 0))

  initComposeCamera: ->
    @composeCamera = new THREE.OrthographicCamera(-@width / 2, @width / 2, @height / 2, -@height / 2, -10, 10)

  initObjectScene: ->
    boxGeometry = new THREE.BoxGeometry(2, 2, 2)
    sphereGeometry = new THREE.SphereGeometry(2, 32, 32)
    
    boxMesh = new THREE.Mesh(boxGeometry)
    sphereMesh = new THREE.Mesh(sphereGeometry)

    boxMesh.position.x = 1
    sphereMesh.position.x = -1

    @objectScene.add(boxMesh)
    @objectScene.add(sphereMesh)

  initComposeScene: ->
    composePlaneGeometry = new THREE.PlaneBufferGeometry(@width, @height)
    composePlaneMesh = new THREE.Mesh(composePlaneGeometry, @composeMaterial)
    @composeScene.add composePlaneMesh

  initTextures: ->
    pars =
      minFilter: THREE.LinearFilter
      magFilter: THREE.LinearFilter
      format: THREE.RGBFormat
      stencilBuffer: false

    @depthTexture = new THREE.WebGLRenderTarget(@width, @height, pars)
    @normalTexture = new THREE.WebGLRenderTarget(@width, @height, pars)

    @composeMaterial.uniforms.depthtexture.value = @depthTexture
    @composeMaterial.uniforms.normaltexture.value = @normalTexture

  initRenderer: ->
    @renderer.setSize(@width, @height)
    @element.appendChild @renderer.domElement

  renderDepth: ->
    @objectScene.overrideMaterial = @depthMaterial
    @renderer.clearTarget @depthTexture, true, true
    @renderer.render @objectScene, @objectCamera, @depthTexture

  renderNormal: ->
    @objectScene.overrideMaterial = @normalMaterial
    @renderer.clearTarget @normalTexture, true, true
    @renderer.render @objectScene, @objectCamera, @normalTexture

  compose: ->
    @renderer.render @composeScene, @composeCamera

  render: ->
    @renderDepth()
    @renderNormal()
    @compose()

module.exports = SceneManager
