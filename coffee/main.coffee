SceneManager = require './scene_manager'

element = document.getElementById 'container'
manager = new SceneManager(element, 'test')
manager.render()
