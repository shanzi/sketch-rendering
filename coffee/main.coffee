SceneManager = require './scene_manager'

element = document.getElementById 'container'
manager = new SceneManager(element)
render = ->
  manager.render()

setTimeout render, 1000
