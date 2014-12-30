SceneManager = require './scene_manager'

element = document.getElementById 'container'
manager = new SceneManager(element)

render = ->
  requestAnimationFrame render
  manager.render()

setTimeout render, 1000
