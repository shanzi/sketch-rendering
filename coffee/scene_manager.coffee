SketchMaterial = require './sketch_material'

class SceneManager
  camera: new THREE.PerspectiveCamera(45, 1, 1, 15)
  renderer: new THREE.WebGLRenderer(antialias: true)
  scene: new THREE.Scene()
  depthMaterial: new THREE.MeshDepthMaterial()
  normalMaterial: new THREE.MeshNormalMaterial()
  sketchMaterial: new SketchMaterial()

  constructor: (element, @scenename) ->
    @renderer.setSize(element.clientWidth, element.clientHeight)
    @sketchMaterial.initTextures(element.clientWidth, element.clientWidth)
    @initCamera(@scenename)
    switch @scenename
      when 'test'
        @initTestScene()
      else
        
    element.appendChild @renderer.domElement

  initCamera: (scenename) ->
    switch scenename
      when 'test'
        @camera.position.z = 10
        @camera.position.x = 3
        @camera.position.y = 3
        @camera.lookAt(new THREE.Vector3(0, 0, 0))
      else
        # TODO: other scene

  initTestScene: ->
    boxGeometry = new THREE.BoxGeometry(2, 2, 2)
    sphereGeometry = new THREE.SphereGeometry(2, 32, 32)
    
    boxMesh = new THREE.Mesh(boxGeometry)
    sphereMesh = new THREE.Mesh(sphereGeometry)

    boxMesh.position.x = 1
    sphereMesh.position.x = -1

    @scene.add(boxMesh)
    @scene.add(sphereMesh)
    @scene.overrideMaterial = @normalMaterial

  render: ->
    @renderer.render(@scene, @camera)

module.exports = SceneManager
