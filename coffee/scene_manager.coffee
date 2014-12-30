ComposeMaterial = require './compose_material'
HatchMaterial = require './hatch_material'

class SceneManager
  mouseXa: -1
  mouseYa: -1
  mouseXb: -1
  mouseYb: -1
  cameraCenter: new THREE.Vector3(-5, 7, 0)
  cameraOrigin: new THREE.Vector3(0, 0, 16)
  cameraRotateA: 0
  cameraRotateB: 0
  axisX: new THREE.Vector3(1, 0, 0)
  axisY: new THREE.Vector3(0, 1, 0)

  objectScene: new THREE.Scene()
  composeScene: new THREE.Scene()

  depthMaterial: new THREE.MeshDepthMaterial()
  normalMaterial: new THREE.MeshNormalMaterial()
  hatchMaterial: new HatchMaterial()
  composeMaterial: new ComposeMaterial()

  renderer: new THREE.WebGLRenderer(antialias: true)

  constructor: (@element) ->
    @width = @element.clientWidth
    @height = @element.clientHeight

    @initTextures()

    @initObjectCamera()
    @initComposeCamera()

    @loadScene()
    @initComposeScene()

    @initRenderer()
    @initMouseEvent()

  initObjectCamera: ->
    @objectCamera = new THREE.PerspectiveCamera(45, @width / @height, 1, 30)
    @objectCamera.position.copy(@cameraCenter).add(@cameraOrigin)

  initComposeCamera: ->
    @composeCamera = new THREE.OrthographicCamera(-@width / 2, @width / 2, @height / 2, -@height / 2, -10, 10)

  initObjectScene: ->
    boxGeometry = new THREE.BoxGeometry(2, 2, 2)
    sphereGeometry = new THREE.SphereGeometry(2, 32, 32)
    
    boxMesh = new THREE.Mesh(boxGeometry)
    sphereMesh = new THREE.Mesh(sphereGeometry)

    boxMesh.position.x = 1
    sphereMesh.position.x = -1

    directLight = new THREE.DirectionalLight(0xffffff, 0.5)
    directLight.position.set(1, 1, 1)

    @objectScene.add(boxMesh)
    @objectScene.add(sphereMesh)
    @objectScene.add(directLight)

  loadScene: ->
    @modelLoader = new THREE.JSONLoader()
    @modelLoader.load './models/room.json', (geo) =>
      sceneMesh = new THREE.Mesh(geo)
      @objectScene.add(sceneMesh)

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
    @hatchTexture = new THREE.WebGLRenderTarget(@width, @height, pars)

    @composeMaterial.uniforms.depthtexture.value = @depthTexture
    @composeMaterial.uniforms.normaltexture.value = @normalTexture
    @composeMaterial.uniforms.hatchtexture.value = @hatchTexture

  initRenderer: ->
    @renderer.setSize(@width, @height)
    @element.appendChild @renderer.domElement

  initMouseEvent: ->
    @trackingMouse = false
    @element.onmousedown  = (e) =>
      @trackingMouse = true
      @mouseXa = e.clientX
      @mouseYa = e.clientY
      @mouseXb = @mouseXa
      @mouseYb = @mouseYa
    @element.onmouseup = (e) =>
      @trackingMouse = false
      @mouseXa = -1
      @mouseYa = -1
    @element.onmousemoveout = @element.onmouseup
    @element.onmousemove = (e) =>
      if @trackingMouse
        @mouseXb = e.clientX
        @mouseYb = e.clientY

  renderDepth: ->
    @objectScene.overrideMaterial = @depthMaterial
    @renderer.setClearColor '#000000'
    @renderer.clearTarget @depthTexture, true, true
    @renderer.render @objectScene, @objectCamera, @depthTexture

  renderNormal: ->
    @objectScene.overrideMaterial = @normalMaterial
    @renderer.setClearColor '#000000'
    @renderer.clearTarget @normalTexture, true, true
    @renderer.render @objectScene, @objectCamera, @normalTexture

  renderHatch: ->
    @objectScene.overrideMaterial = @hatchMaterial
    @renderer.setClearColor '#ffffff'
    @renderer.clearTarget @hatchTexture, true, true
    @renderer.render @objectScene, @objectCamera, @hatchTexture

  compose: ->
    @renderer.render @composeScene, @composeCamera

  animate: ->
    if @mouseXa >= 0 && @mouseYa >= 0
      offsetX = @mouseXb - @mouseXa
      offsetY = @mouseYb - @mouseYa
      @cameraRotateA = - Math.atan(offsetX / 320)
      @cameraRotateB = - Math.atan(offsetY / 320)
    else
      @cameraRotateA *= 0.8
      @cameraRotateB *= 0.8
    @objectCamera.position.copy(@cameraOrigin).applyAxisAngle(@axisY, @cameraRotateA)
    @objectCamera.position.applyAxisAngle(@axisX, @cameraRotateB)
    @objectCamera.position.add(@cameraCenter)
    @objectCamera.lookAt(@cameraCenter)

  render: ->
    @animate()
    @renderDepth()
    @renderNormal()
    @renderHatch()
    @compose()

module.exports = SceneManager
