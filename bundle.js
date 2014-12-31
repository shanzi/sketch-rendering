(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/Chase_Zhang/codes/pages/sketch-rendering/coffee/compose_material.coffee":[function(require,module,exports){
var ComposeMaterial,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ComposeMaterial = (function(_super) {
  __extends(ComposeMaterial, _super);

  ComposeMaterial.prototype.attributes = {};

  ComposeMaterial.prototype.uniforms = {
    depthtexture: {
      type: 't',
      value: null
    },
    normaltexture: {
      type: 't',
      value: null
    },
    hatchtexture: {
      type: 't',
      value: null
    }
  };

  ComposeMaterial.prototype.vertexShader = 'varying vec2 vUv;\nvoid main() {\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n  vUv = uv;\n}';

  ComposeMaterial.prototype.fragmentShader = 'uniform sampler2D depthtexture;\nuniform sampler2D normaltexture;\nuniform sampler2D hatchtexture;\n\nvarying vec2 vUv;\n\nfloat planeDistance(const in vec3 positionA, const in vec3 normalA, \n                    const in vec3 positionB, const in vec3 normalB) {\n  vec3 positionDelta = positionB-positionA;\n  float planeDistanceDelta = max(abs(dot(positionDelta, normalA)), abs(dot(positionDelta, normalB)));\n  return planeDistanceDelta;\n}\n\nvoid main() {\n  float depthCenter = texture2D(depthtexture, vUv).r;\n  float px = 1.0/800.0;\n\n  vec3 leftpos = vec3(vUv.s - px, vUv.t, 1.0 - texture2D(depthtexture, vec2(vUv.s - px, vUv.t)).r);\n  vec3 rightpos = vec3(vUv.s + px, vUv.t, 1.0 - texture2D(depthtexture, vec2(vUv.s + px, vUv.t)).r);\n  vec3 uppos = vec3(vUv.s, vUv.t - px, 1.0 - texture2D(depthtexture, vec2(vUv.s, vUv.t - px)).r);\n  vec3 downpos = vec3(vUv.s, vUv.t + px, 1.0 - texture2D(depthtexture, vec2(vUv.s, vUv.t + px)).r);\n\n  vec3 leftnor = texture2D(normaltexture, vec2(vUv.s - px, vUv.t)).xyz;\n  vec3 rightnor = texture2D(normaltexture, vec2(vUv.s + px, vUv.t)).xyz;\n  vec3 upnor = texture2D(normaltexture, vec2(vUv.s, vUv.t - px)).xyz;\n  vec3 downnor = texture2D(normaltexture, vec2(vUv.s, vUv.t + px)).xyz;\n\n  vec2 planeDist = vec2(\n    planeDistance(leftpos, leftnor, rightpos, rightnor),\n    planeDistance(uppos, upnor, downpos, downnor));\n\n  float planeEdge = 2.5 * length(planeDist);\n  planeEdge = 1.0 - 0.5 * smoothstep(0.0, depthCenter, planeEdge);;\n\n  float normEdge = max(length(leftnor - rightnor), length(upnor - downnor));\n  normEdge = 1.0 - 0.5 * smoothstep(0.0, 0.5, normEdge); \n\n  float edge= planeEdge * normEdge;\n  vec4 hatch = texture2D(hatchtexture, vUv);\n  gl_FragColor = vec4(vec3(hatch * edge), 1.0);\n}';

  function ComposeMaterial() {
    ComposeMaterial.__super__.constructor.call(this, {
      attributes: this.attributes,
      uniforms: this.uniforms,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader
    });
  }

  return ComposeMaterial;

})(THREE.ShaderMaterial);

module.exports = ComposeMaterial;



},{}],"/Users/Chase_Zhang/codes/pages/sketch-rendering/coffee/hatch_material.coffee":[function(require,module,exports){
var HatchMaterial,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

HatchMaterial = (function(_super) {
  __extends(HatchMaterial, _super);

  HatchMaterial.prototype.attributes = {};

  HatchMaterial.prototype.uniforms = {
    bakedshadow: {
      type: 't',
      value: THREE.ImageUtils.loadTexture('textures/room_baked.png')
    },
    hatch0: {
      type: 't',
      value: THREE.ImageUtils.loadTexture('textures/hatch_0.jpg')
    },
    hatch1: {
      type: 't',
      value: THREE.ImageUtils.loadTexture('textures/hatch_1.jpg')
    },
    hatch2: {
      type: 't',
      value: THREE.ImageUtils.loadTexture('textures/hatch_2.jpg')
    }
  };

  HatchMaterial.prototype.vertexShader = 'varying vec2 vUv;\n\nvoid main() {\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n  vec3 vNormal = normalMatrix * normal; \n  vUv = uv;\n}';

  HatchMaterial.prototype.fragmentShader = 'uniform sampler2D bakedshadow;\nuniform sampler2D hatch0;\nuniform sampler2D hatch1;\nuniform sampler2D hatch2;\n\nvarying vec2 vUv;\n\nfloat shade(const in float shading, const in vec2 uv) {\n  float shadingFactor;\n  float stepSize = 1.0 / 3.0;\n\n  float alpha = 0.0;\n  float scaleWhite = 0.0;\n  float scaleHatch0 = 0.0;\n  float scaleHatch1 = 0.0;\n  float scaleHatch2 = 0.0;\n\n  if (shading <= stepSize) {\n    alpha = 3.0 * shading;\n    scaleHatch1 = alpha;\n    scaleHatch2 = 1.0 - alpha;\n  }\n  else if (shading > stepSize && shading <= 2.0 * stepSize) {\n    alpha = 3.0 * (shading - stepSize);\n    scaleHatch0 = alpha;\n    scaleHatch1 = 1.0 - alpha;\n  }\n  else if (shading > 2.0 * stepSize) {\n    alpha = 3.0 * (shading - stepSize * 2.0);\n    scaleWhite = alpha;\n    scaleHatch0 = 1.0 - alpha;\n  }\n\n  shadingFactor = scaleWhite + \n    scaleHatch0 * texture2D(hatch0, uv).r +\n    scaleHatch1 * texture2D(hatch1, uv).r +\n    scaleHatch2 * texture2D(hatch2, uv).r;\n\n  return shadingFactor;\n}\n\nvoid main() {\n  vec2 uv = vUv * 15.0;\n  vec2 uv2 = vUv.yx * 10.0;\n  float shading = texture2D(bakedshadow, vUv).r + 0.1;\n  float crossedShading = shade(shading, uv) * shade(shading, uv2) * 0.6 + 0.4;\n  gl_FragColor = vec4(vec3(crossedShading), 1.0);\n}';

  function HatchMaterial() {
    var k, v, _ref;
    _ref = this.uniforms;
    for (k in _ref) {
      v = _ref[k];
      v.value.magFilter = THREE.NearestFilter;
      v.value.minFilter = THREE.NearestFilter;
      v.value.wrapS = THREE.RepeatWrapping;
      v.value.wrapT = THREE.RepeatWrapping;
    }
    HatchMaterial.__super__.constructor.call(this, {
      attributes: this.attributes,
      uniforms: this.uniforms,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader
    });
  }

  return HatchMaterial;

})(THREE.ShaderMaterial);

module.exports = HatchMaterial;



},{}],"/Users/Chase_Zhang/codes/pages/sketch-rendering/coffee/main.coffee":[function(require,module,exports){
var SceneManager, element, manager, render;

SceneManager = require('./scene_manager');

element = document.getElementById('container');

manager = new SceneManager(element);

render = function() {
  requestAnimationFrame(render);
  return manager.render();
};

setTimeout(render, 1000);



},{"./scene_manager":"/Users/Chase_Zhang/codes/pages/sketch-rendering/coffee/scene_manager.coffee"}],"/Users/Chase_Zhang/codes/pages/sketch-rendering/coffee/scene_manager.coffee":[function(require,module,exports){
var ComposeMaterial, HatchMaterial, SceneManager;

ComposeMaterial = require('./compose_material');

HatchMaterial = require('./hatch_material');

SceneManager = (function() {
  SceneManager.prototype.mouseXa = -1;

  SceneManager.prototype.mouseYa = -1;

  SceneManager.prototype.mouseXb = -1;

  SceneManager.prototype.mouseYb = -1;

  SceneManager.prototype.cameraCenter = new THREE.Vector3(-5, 7, 0);

  SceneManager.prototype.cameraOrigin = new THREE.Vector3(0, 0, 16);

  SceneManager.prototype.cameraRotateA = 0;

  SceneManager.prototype.cameraRotateB = 0;

  SceneManager.prototype.axisX = new THREE.Vector3(1, 0, 0);

  SceneManager.prototype.axisY = new THREE.Vector3(0, 1, 0);

  SceneManager.prototype.objectScene = new THREE.Scene();

  SceneManager.prototype.composeScene = new THREE.Scene();

  SceneManager.prototype.depthMaterial = new THREE.MeshDepthMaterial();

  SceneManager.prototype.normalMaterial = new THREE.MeshNormalMaterial();

  SceneManager.prototype.hatchMaterial = new HatchMaterial();

  SceneManager.prototype.composeMaterial = new ComposeMaterial();

  SceneManager.prototype.renderer = new THREE.WebGLRenderer({
    antialias: true
  });

  function SceneManager(element) {
    this.element = element;
    this.width = this.element.clientWidth;
    this.height = this.element.clientHeight;
    this.initTextures();
    this.initObjectCamera();
    this.initComposeCamera();
    this.loadScene();
    this.initComposeScene();
    this.initRenderer();
    this.initMouseEvent();
  }

  SceneManager.prototype.initObjectCamera = function() {
    this.objectCamera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 30);
    return this.objectCamera.position.copy(this.cameraCenter).add(this.cameraOrigin);
  };

  SceneManager.prototype.initComposeCamera = function() {
    return this.composeCamera = new THREE.OrthographicCamera(-this.width / 2, this.width / 2, this.height / 2, -this.height / 2, -10, 10);
  };

  SceneManager.prototype.initObjectScene = function() {
    var boxGeometry, boxMesh, directLight, sphereGeometry, sphereMesh;
    boxGeometry = new THREE.BoxGeometry(2, 2, 2);
    sphereGeometry = new THREE.SphereGeometry(2, 32, 32);
    boxMesh = new THREE.Mesh(boxGeometry);
    sphereMesh = new THREE.Mesh(sphereGeometry);
    boxMesh.position.x = 1;
    sphereMesh.position.x = -1;
    directLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directLight.position.set(1, 1, 1);
    this.objectScene.add(boxMesh);
    this.objectScene.add(sphereMesh);
    return this.objectScene.add(directLight);
  };

  SceneManager.prototype.loadScene = function() {
    this.modelLoader = new THREE.JSONLoader();
    return this.modelLoader.load('./models/room.json', (function(_this) {
      return function(geo) {
        var sceneMesh;
        sceneMesh = new THREE.Mesh(geo);
        return _this.objectScene.add(sceneMesh);
      };
    })(this));
  };

  SceneManager.prototype.initComposeScene = function() {
    var composePlaneGeometry, composePlaneMesh;
    composePlaneGeometry = new THREE.PlaneBufferGeometry(this.width, this.height);
    composePlaneMesh = new THREE.Mesh(composePlaneGeometry, this.composeMaterial);
    return this.composeScene.add(composePlaneMesh);
  };

  SceneManager.prototype.initTextures = function() {
    var pars;
    pars = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBFormat,
      stencilBuffer: false
    };
    this.depthTexture = new THREE.WebGLRenderTarget(this.width, this.height, pars);
    this.normalTexture = new THREE.WebGLRenderTarget(this.width, this.height, pars);
    this.hatchTexture = new THREE.WebGLRenderTarget(this.width, this.height, pars);
    this.composeMaterial.uniforms.depthtexture.value = this.depthTexture;
    this.composeMaterial.uniforms.normaltexture.value = this.normalTexture;
    return this.composeMaterial.uniforms.hatchtexture.value = this.hatchTexture;
  };

  SceneManager.prototype.initRenderer = function() {
    this.renderer.setSize(this.width, this.height);
    return this.element.appendChild(this.renderer.domElement);
  };

  SceneManager.prototype.initMouseEvent = function() {
    this.trackingMouse = false;
    this.element.onmousedown = (function(_this) {
      return function(e) {
        _this.trackingMouse = true;
        _this.mouseXa = e.clientX;
        _this.mouseYa = e.clientY;
        _this.mouseXb = _this.mouseXa;
        return _this.mouseYb = _this.mouseYa;
      };
    })(this);
    this.element.onmouseup = (function(_this) {
      return function(e) {
        _this.trackingMouse = false;
        _this.mouseXa = -1;
        return _this.mouseYa = -1;
      };
    })(this);
    this.element.onmousemoveout = this.element.onmouseup;
    return this.element.onmousemove = (function(_this) {
      return function(e) {
        if (_this.trackingMouse) {
          _this.mouseXb = e.clientX;
          return _this.mouseYb = e.clientY;
        }
      };
    })(this);
  };

  SceneManager.prototype.renderDepth = function() {
    this.objectScene.overrideMaterial = this.depthMaterial;
    this.renderer.setClearColor('#000000');
    this.renderer.clearTarget(this.depthTexture, true, true);
    return this.renderer.render(this.objectScene, this.objectCamera, this.depthTexture);
  };

  SceneManager.prototype.renderNormal = function() {
    this.objectScene.overrideMaterial = this.normalMaterial;
    this.renderer.setClearColor('#000000');
    this.renderer.clearTarget(this.normalTexture, true, true);
    return this.renderer.render(this.objectScene, this.objectCamera, this.normalTexture);
  };

  SceneManager.prototype.renderHatch = function() {
    this.objectScene.overrideMaterial = this.hatchMaterial;
    this.renderer.setClearColor('#ffffff');
    this.renderer.clearTarget(this.hatchTexture, true, true);
    return this.renderer.render(this.objectScene, this.objectCamera, this.hatchTexture);
  };

  SceneManager.prototype.compose = function() {
    return this.renderer.render(this.composeScene, this.composeCamera);
  };

  SceneManager.prototype.animate = function() {
    var offsetX, offsetY;
    if (this.mouseXa >= 0 && this.mouseYa >= 0) {
      offsetX = this.mouseXb - this.mouseXa;
      offsetY = this.mouseYb - this.mouseYa;
      this.cameraRotateA = -Math.atan(offsetX / 320);
      this.cameraRotateB = -Math.atan(offsetY / 320);
    } else {
      this.cameraRotateA *= 0.8;
      this.cameraRotateB *= 0.8;
    }
    this.objectCamera.position.copy(this.cameraOrigin).applyAxisAngle(this.axisY, this.cameraRotateA);
    this.objectCamera.position.applyAxisAngle(this.axisX, this.cameraRotateB);
    this.objectCamera.position.add(this.cameraCenter);
    return this.objectCamera.lookAt(this.cameraCenter);
  };

  SceneManager.prototype.render = function() {
    this.animate();
    this.renderDepth();
    this.renderNormal();
    this.renderHatch();
    return this.compose();
  };

  return SceneManager;

})();

module.exports = SceneManager;



},{"./compose_material":"/Users/Chase_Zhang/codes/pages/sketch-rendering/coffee/compose_material.coffee","./hatch_material":"/Users/Chase_Zhang/codes/pages/sketch-rendering/coffee/hatch_material.coffee"}]},{},["/Users/Chase_Zhang/codes/pages/sketch-rendering/coffee/main.coffee"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy5udm0vdjAuMTAuMjkvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL0NoYXNlX1poYW5nL2NvZGVzL3BhZ2VzL3NrZXRjaC1yZW5kZXJpbmcvY29mZmVlL2NvbXBvc2VfbWF0ZXJpYWwuY29mZmVlIiwiL1VzZXJzL0NoYXNlX1poYW5nL2NvZGVzL3BhZ2VzL3NrZXRjaC1yZW5kZXJpbmcvY29mZmVlL2hhdGNoX21hdGVyaWFsLmNvZmZlZSIsIi9Vc2Vycy9DaGFzZV9aaGFuZy9jb2Rlcy9wYWdlcy9za2V0Y2gtcmVuZGVyaW5nL2NvZmZlZS9tYWluLmNvZmZlZSIsIi9Vc2Vycy9DaGFzZV9aaGFuZy9jb2Rlcy9wYWdlcy9za2V0Y2gtcmVuZGVyaW5nL2NvZmZlZS9zY2VuZV9tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsZUFBQTtFQUFBO2lTQUFBOztBQUFBO0FBQ0Usb0NBQUEsQ0FBQTs7QUFBQSw0QkFBQSxVQUFBLEdBQVksRUFBWixDQUFBOztBQUFBLDRCQUNBLFFBQUEsR0FDRTtBQUFBLElBQUEsWUFBQSxFQUNFO0FBQUEsTUFBQSxJQUFBLEVBQU0sR0FBTjtBQUFBLE1BQ0EsS0FBQSxFQUFPLElBRFA7S0FERjtBQUFBLElBR0EsYUFBQSxFQUNFO0FBQUEsTUFBQSxJQUFBLEVBQU0sR0FBTjtBQUFBLE1BQ0EsS0FBQSxFQUFPLElBRFA7S0FKRjtBQUFBLElBTUEsWUFBQSxFQUNFO0FBQUEsTUFBQSxJQUFBLEVBQU0sR0FBTjtBQUFBLE1BQ0EsS0FBQSxFQUFPLElBRFA7S0FQRjtHQUZGLENBQUE7O0FBQUEsNEJBWUEsWUFBQSxHQUFjLDZIQVpkLENBQUE7O0FBQUEsNEJBbUJBLGNBQUEsR0FBZ0IsNHVEQW5CaEIsQ0FBQTs7QUE4RGEsRUFBQSx5QkFBQSxH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bmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNsYXNzIENvbXBvc2VNYXRlcmlhbCBleHRlbmRzIFRIUkVFLlNoYWRlck1hdGVyaWFsXG4gIGF0dHJpYnV0ZXM6IHt9XG4gIHVuaWZvcm1zOlxuICAgIGRlcHRodGV4dHVyZTpcbiAgICAgIHR5cGU6ICd0J1xuICAgICAgdmFsdWU6IG51bGxcbiAgICBub3JtYWx0ZXh0dXJlOlxuICAgICAgdHlwZTogJ3QnXG4gICAgICB2YWx1ZTogbnVsbFxuICAgIGhhdGNodGV4dHVyZTpcbiAgICAgIHR5cGU6ICd0J1xuICAgICAgdmFsdWU6IG51bGxcblxuICB2ZXJ0ZXhTaGFkZXI6ICcnJ1xudmFyeWluZyB2ZWMyIHZVdjtcbnZvaWQgbWFpbigpIHtcbiAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbW9kZWxWaWV3TWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKTtcbiAgdlV2ID0gdXY7XG59XG4gICcnJ1xuICBmcmFnbWVudFNoYWRlcjogJycnXG51bmlmb3JtIHNhbXBsZXIyRCBkZXB0aHRleHR1cmU7XG51bmlmb3JtIHNhbXBsZXIyRCBub3JtYWx0ZXh0dXJlO1xudW5pZm9ybSBzYW1wbGVyMkQgaGF0Y2h0ZXh0dXJlO1xuXG52YXJ5aW5nIHZlYzIgdlV2O1xuXG5mbG9hdCBwbGFuZURpc3RhbmNlKGNvbnN0IGluIHZlYzMgcG9zaXRpb25BLCBjb25zdCBpbiB2ZWMzIG5vcm1hbEEsIFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbiB2ZWMzIHBvc2l0aW9uQiwgY29uc3QgaW4gdmVjMyBub3JtYWxCKSB7XG4gIHZlYzMgcG9zaXRpb25EZWx0YSA9IHBvc2l0aW9uQi1wb3NpdGlvbkE7XG4gIGZsb2F0IHBsYW5lRGlzdGFuY2VEZWx0YSA9IG1heChhYnMoZG90KHBvc2l0aW9uRGVsdGEsIG5vcm1hbEEpKSwgYWJzKGRvdChwb3NpdGlvbkRlbHRhLCBub3JtYWxCKSkpO1xuICByZXR1cm4gcGxhbmVEaXN0YW5jZURlbHRhO1xufVxuXG52b2lkIG1haW4oKSB7XG4gIGZsb2F0IGRlcHRoQ2VudGVyID0gdGV4dHVyZTJEKGRlcHRodGV4dHVyZSwgdlV2KS5yO1xuICBmbG9hdCBweCA9IDEuMC84MDAuMDtcblxuICB2ZWMzIGxlZnRwb3MgPSB2ZWMzKHZVdi5zIC0gcHgsIHZVdi50LCAxLjAgLSB0ZXh0dXJlMkQoZGVwdGh0ZXh0dXJlLCB2ZWMyKHZVdi5zIC0gcHgsIHZVdi50KSkucik7XG4gIHZlYzMgcmlnaHRwb3MgPSB2ZWMzKHZVdi5zICsgcHgsIHZVdi50LCAxLjAgLSB0ZXh0dXJlMkQoZGVwdGh0ZXh0dXJlLCB2ZWMyKHZVdi5zICsgcHgsIHZVdi50KSkucik7XG4gIHZlYzMgdXBwb3MgPSB2ZWMzKHZVdi5zLCB2VXYudCAtIHB4LCAxLjAgLSB0ZXh0dXJlMkQoZGVwdGh0ZXh0dXJlLCB2ZWMyKHZVdi5zLCB2VXYudCAtIHB4KSkucik7XG4gIHZlYzMgZG93bnBvcyA9IHZlYzModlV2LnMsIHZVdi50ICsgcHgsIDEuMCAtIHRleHR1cmUyRChkZXB0aHRleHR1cmUsIHZlYzIodlV2LnMsIHZVdi50ICsgcHgpKS5yKTtcblxuICB2ZWMzIGxlZnRub3IgPSB0ZXh0dXJlMkQobm9ybWFsdGV4dHVyZSwgdmVjMih2VXYucyAtIHB4LCB2VXYudCkpLnh5ejtcbiAgdmVjMyByaWdodG5vciA9IHRleHR1cmUyRChub3JtYWx0ZXh0dXJlLCB2ZWMyKHZVdi5zICsgcHgsIHZVdi50KSkueHl6O1xuICB2ZWMzIHVwbm9yID0gdGV4dHVyZTJEKG5vcm1hbHRleHR1cmUsIHZlYzIodlV2LnMsIHZVdi50IC0gcHgpKS54eXo7XG4gIHZlYzMgZG93bm5vciA9IHRleHR1cmUyRChub3JtYWx0ZXh0dXJlLCB2ZWMyKHZVdi5zLCB2VXYudCArIHB4KSkueHl6O1xuXG4gIHZlYzIgcGxhbmVEaXN0ID0gdmVjMihcbiAgICBwbGFuZURpc3RhbmNlKGxlZnRwb3MsIGxlZnRub3IsIHJpZ2h0cG9zLCByaWdodG5vciksXG4gICAgcGxhbmVEaXN0YW5jZSh1cHBvcywgdXBub3IsIGRvd25wb3MsIGRvd25ub3IpKTtcblxuICBmbG9hdCBwbGFuZUVkZ2UgPSAyLjUgKiBsZW5ndGgocGxhbmVEaXN0KTtcbiAgcGxhbmVFZGdlID0gMS4wIC0gMC41ICogc21vb3Roc3RlcCgwLjAsIGRlcHRoQ2VudGVyLCBwbGFuZUVkZ2UpOztcblxuICBmbG9hdCBub3JtRWRnZSA9IG1heChsZW5ndGgobGVmdG5vciAtIHJpZ2h0bm9yKSwgbGVuZ3RoKHVwbm9yIC0gZG93bm5vcikpO1xuICBub3JtRWRnZSA9IDEuMCAtIDAuNSAqIHNtb290aHN0ZXAoMC4wLCAwLjUsIG5vcm1FZGdlKTsgXG5cbiAgZmxvYXQgZWRnZT0gcGxhbmVFZGdlICogbm9ybUVkZ2U7XG4gIHZlYzQgaGF0Y2ggPSB0ZXh0dXJlMkQoaGF0Y2h0ZXh0dXJlLCB2VXYpO1xuICBnbF9GcmFnQ29sb3IgPSB2ZWM0KHZlYzMoaGF0Y2ggKiBlZGdlKSwgMS4wKTtcbn1cbiAgJycnXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyKFxuICAgICAgYXR0cmlidXRlczogQGF0dHJpYnV0ZXNcbiAgICAgIHVuaWZvcm1zOiBAdW5pZm9ybXNcbiAgICAgIHZlcnRleFNoYWRlcjogQHZlcnRleFNoYWRlclxuICAgICAgZnJhZ21lbnRTaGFkZXI6IEBmcmFnbWVudFNoYWRlclxuICAgIClcblxubW9kdWxlLmV4cG9ydHMgPSBDb21wb3NlTWF0ZXJpYWxcbiIsImNsYXNzIEhhdGNoTWF0ZXJpYWwgZXh0ZW5kcyBUSFJFRS5TaGFkZXJNYXRlcmlhbFxuICBhdHRyaWJ1dGVzOiB7fVxuICB1bmlmb3JtczpcbiAgICBiYWtlZHNoYWRvdzpcbiAgICAgIHR5cGU6ICd0J1xuICAgICAgdmFsdWU6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoJ3RleHR1cmVzL3Jvb21fYmFrZWQucG5nJylcbiAgICBoYXRjaDA6XG4gICAgICB0eXBlOiAndCdcbiAgICAgIHZhbHVlOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCd0ZXh0dXJlcy9oYXRjaF8wLmpwZycpXG4gICAgaGF0Y2gxOlxuICAgICAgdHlwZTogJ3QnXG4gICAgICB2YWx1ZTogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSgndGV4dHVyZXMvaGF0Y2hfMS5qcGcnKVxuICAgIGhhdGNoMjpcbiAgICAgIHR5cGU6ICd0J1xuICAgICAgdmFsdWU6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoJ3RleHR1cmVzL2hhdGNoXzIuanBnJylcblxuICB2ZXJ0ZXhTaGFkZXI6ICcnJ1xudmFyeWluZyB2ZWMyIHZVdjtcblxudm9pZCBtYWluKCkge1xuICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApO1xuICB2ZWMzIHZOb3JtYWwgPSBub3JtYWxNYXRyaXggKiBub3JtYWw7IFxuICB2VXYgPSB1djtcbn1cbiAgJycnXG4gIGZyYWdtZW50U2hhZGVyOiAnJydcbnVuaWZvcm0gc2FtcGxlcjJEIGJha2Vkc2hhZG93O1xudW5pZm9ybSBzYW1wbGVyMkQgaGF0Y2gwO1xudW5pZm9ybSBzYW1wbGVyMkQgaGF0Y2gxO1xudW5pZm9ybSBzYW1wbGVyMkQgaGF0Y2gyO1xuXG52YXJ5aW5nIHZlYzIgdlV2O1xuXG5mbG9hdCBzaGFkZShjb25zdCBpbiBmbG9hdCBzaGFkaW5nLCBjb25zdCBpbiB2ZWMyIHV2KSB7XG4gIGZsb2F0IHNoYWRpbmdGYWN0b3I7XG4gIGZsb2F0IHN0ZXBTaXplID0gMS4wIC8gMy4wO1xuXG4gIGZsb2F0IGFscGhhID0gMC4wO1xuICBmbG9hdCBzY2FsZVdoaXRlID0gMC4wO1xuICBmbG9hdCBzY2FsZUhhdGNoMCA9IDAuMDtcbiAgZmxvYXQgc2NhbGVIYXRjaDEgPSAwLjA7XG4gIGZsb2F0IHNjYWxlSGF0Y2gyID0gMC4wO1xuXG4gIGlmIChzaGFkaW5nIDw9IHN0ZXBTaXplKSB7XG4gICAgYWxwaGEgPSAzLjAgKiBzaGFkaW5nO1xuICAgIHNjYWxlSGF0Y2gxID0gYWxwaGE7XG4gICAgc2NhbGVIYXRjaDIgPSAxLjAgLSBhbHBoYTtcbiAgfVxuICBlbHNlIGlmIChzaGFkaW5nID4gc3RlcFNpemUgJiYgc2hhZGluZyA8PSAyLjAgKiBzdGVwU2l6ZSkge1xuICAgIGFscGhhID0gMy4wICogKHNoYWRpbmcgLSBzdGVwU2l6ZSk7XG4gICAgc2NhbGVIYXRjaDAgPSBhbHBoYTtcbiAgICBzY2FsZUhhdGNoMSA9IDEuMCAtIGFscGhhO1xuICB9XG4gIGVsc2UgaWYgKHNoYWRpbmcgPiAyLjAgKiBzdGVwU2l6ZSkge1xuICAgIGFscGhhID0gMy4wICogKHNoYWRpbmcgLSBzdGVwU2l6ZSAqIDIuMCk7XG4gICAgc2NhbGVXaGl0ZSA9IGFscGhhO1xuICAgIHNjYWxlSGF0Y2gwID0gMS4wIC0gYWxwaGE7XG4gIH1cblxuICBzaGFkaW5nRmFjdG9yID0gc2NhbGVXaGl0ZSArIFxuICAgIHNjYWxlSGF0Y2gwICogdGV4dHVyZTJEKGhhdGNoMCwgdXYpLnIgK1xuICAgIHNjYWxlSGF0Y2gxICogdGV4dHVyZTJEKGhhdGNoMSwgdXYpLnIgK1xuICAgIHNjYWxlSGF0Y2gyICogdGV4dHVyZTJEKGhhdGNoMiwgdXYpLnI7XG5cbiAgcmV0dXJuIHNoYWRpbmdGYWN0b3I7XG59XG5cbnZvaWQgbWFpbigpIHtcbiAgdmVjMiB1diA9IHZVdiAqIDE1LjA7XG4gIHZlYzIgdXYyID0gdlV2Lnl4ICogMTAuMDtcbiAgZmxvYXQgc2hhZGluZyA9IHRleHR1cmUyRChiYWtlZHNoYWRvdywgdlV2KS5yICsgMC4xO1xuICBmbG9hdCBjcm9zc2VkU2hhZGluZyA9IHNoYWRlKHNoYWRpbmcsIHV2KSAqIHNoYWRlKHNoYWRpbmcsIHV2MikgKiAwLjYgKyAwLjQ7XG4gIGdsX0ZyYWdDb2xvciA9IHZlYzQodmVjMyhjcm9zc2VkU2hhZGluZyksIDEuMCk7XG59XG4gICcnJ1xuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBmb3IgaywgdiBvZiBAdW5pZm9ybXNcbiAgICAgIHYudmFsdWUubWFnRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlclxuICAgICAgdi52YWx1ZS5taW5GaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyXG4gICAgICB2LnZhbHVlLndyYXBTID0gVEhSRUUuUmVwZWF0V3JhcHBpbmdcbiAgICAgIHYudmFsdWUud3JhcFQgPSBUSFJFRS5SZXBlYXRXcmFwcGluZ1xuICAgIHN1cGVyKFxuICAgICAgYXR0cmlidXRlczogQGF0dHJpYnV0ZXNcbiAgICAgIHVuaWZvcm1zOiBAdW5pZm9ybXNcbiAgICAgIHZlcnRleFNoYWRlcjogQHZlcnRleFNoYWRlclxuICAgICAgZnJhZ21lbnRTaGFkZXI6IEBmcmFnbWVudFNoYWRlclxuICAgIClcblxubW9kdWxlLmV4cG9ydHMgPSBIYXRjaE1hdGVyaWFsXG4iLCJTY2VuZU1hbmFnZXIgPSByZXF1aXJlICcuL3NjZW5lX21hbmFnZXInXG5cbmVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnY29udGFpbmVyJ1xubWFuYWdlciA9IG5ldyBTY2VuZU1hbmFnZXIoZWxlbWVudClcblxucmVuZGVyID0gLT5cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIHJlbmRlclxuICBtYW5hZ2VyLnJlbmRlcigpXG5cbnNldFRpbWVvdXQgcmVuZGVyLCAxMDAwXG4iLCJDb21wb3NlTWF0ZXJpYWwgPSByZXF1aXJlICcuL2NvbXBvc2VfbWF0ZXJpYWwnXG5IYXRjaE1hdGVyaWFsID0gcmVxdWlyZSAnLi9oYXRjaF9tYXRlcmlhbCdcblxuY2xhc3MgU2NlbmVNYW5hZ2VyXG4gIG1vdXNlWGE6IC0xXG4gIG1vdXNlWWE6IC0xXG4gIG1vdXNlWGI6IC0xXG4gIG1vdXNlWWI6IC0xXG4gIGNhbWVyYUNlbnRlcjogbmV3IFRIUkVFLlZlY3RvcjMoLTUsIDcsIDApXG4gIGNhbWVyYU9yaWdpbjogbmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMTYpXG4gIGNhbWVyYVJvdGF0ZUE6IDBcbiAgY2FtZXJhUm90YXRlQjogMFxuICBheGlzWDogbmV3IFRIUkVFLlZlY3RvcjMoMSwgMCwgMClcbiAgYXhpc1k6IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDEsIDApXG5cbiAgb2JqZWN0U2NlbmU6IG5ldyBUSFJFRS5TY2VuZSgpXG4gIGNvbXBvc2VTY2VuZTogbmV3IFRIUkVFLlNjZW5lKClcblxuICBkZXB0aE1hdGVyaWFsOiBuZXcgVEhSRUUuTWVzaERlcHRoTWF0ZXJpYWwoKVxuICBub3JtYWxNYXRlcmlhbDogbmV3IFRIUkVFLk1lc2hOb3JtYWxNYXRlcmlhbCgpXG4gIGhhdGNoTWF0ZXJpYWw6IG5ldyBIYXRjaE1hdGVyaWFsKClcbiAgY29tcG9zZU1hdGVyaWFsOiBuZXcgQ29tcG9zZU1hdGVyaWFsKClcblxuICByZW5kZXJlcjogbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoYW50aWFsaWFzOiB0cnVlKVxuXG4gIGNvbnN0cnVjdG9yOiAoQGVsZW1lbnQpIC0+XG4gICAgQHdpZHRoID0gQGVsZW1lbnQuY2xpZW50V2lkdGhcbiAgICBAaGVpZ2h0ID0gQGVsZW1lbnQuY2xpZW50SGVpZ2h0XG5cbiAgICBAaW5pdFRleHR1cmVzKClcblxuICAgIEBpbml0T2JqZWN0Q2FtZXJhKClcbiAgICBAaW5pdENvbXBvc2VDYW1lcmEoKVxuXG4gICAgQGxvYWRTY2VuZSgpXG4gICAgQGluaXRDb21wb3NlU2NlbmUoKVxuXG4gICAgQGluaXRSZW5kZXJlcigpXG4gICAgQGluaXRNb3VzZUV2ZW50KClcblxuICBpbml0T2JqZWN0Q2FtZXJhOiAtPlxuICAgIEBvYmplY3RDYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNDUsIEB3aWR0aCAvIEBoZWlnaHQsIDEsIDMwKVxuICAgIEBvYmplY3RDYW1lcmEucG9zaXRpb24uY29weShAY2FtZXJhQ2VudGVyKS5hZGQoQGNhbWVyYU9yaWdpbilcblxuICBpbml0Q29tcG9zZUNhbWVyYTogLT5cbiAgICBAY29tcG9zZUNhbWVyYSA9IG5ldyBUSFJFRS5PcnRob2dyYXBoaWNDYW1lcmEoLUB3aWR0aCAvIDIsIEB3aWR0aCAvIDIsIEBoZWlnaHQgLyAyLCAtQGhlaWdodCAvIDIsIC0xMCwgMTApXG5cbiAgaW5pdE9iamVjdFNjZW5lOiAtPlxuICAgIGJveEdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KDIsIDIsIDIpXG4gICAgc3BoZXJlR2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMiwgMzIsIDMyKVxuICAgIFxuICAgIGJveE1lc2ggPSBuZXcgVEhSRUUuTWVzaChib3hHZW9tZXRyeSlcbiAgICBzcGhlcmVNZXNoID0gbmV3IFRIUkVFLk1lc2goc3BoZXJlR2VvbWV0cnkpXG5cbiAgICBib3hNZXNoLnBvc2l0aW9uLnggPSAxXG4gICAgc3BoZXJlTWVzaC5wb3NpdGlvbi54ID0gLTFcblxuICAgIGRpcmVjdExpZ2h0ID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoMHhmZmZmZmYsIDAuNSlcbiAgICBkaXJlY3RMaWdodC5wb3NpdGlvbi5zZXQoMSwgMSwgMSlcblxuICAgIEBvYmplY3RTY2VuZS5hZGQoYm94TWVzaClcbiAgICBAb2JqZWN0U2NlbmUuYWRkKHNwaGVyZU1lc2gpXG4gICAgQG9iamVjdFNjZW5lLmFkZChkaXJlY3RMaWdodClcblxuICBsb2FkU2NlbmU6IC0+XG4gICAgQG1vZGVsTG9hZGVyID0gbmV3IFRIUkVFLkpTT05Mb2FkZXIoKVxuICAgIEBtb2RlbExvYWRlci5sb2FkICcuL21vZGVscy9yb29tLmpzb24nLCAoZ2VvKSA9PlxuICAgICAgc2NlbmVNZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvKVxuICAgICAgQG9iamVjdFNjZW5lLmFkZChzY2VuZU1lc2gpXG5cbiAgaW5pdENvbXBvc2VTY2VuZTogLT5cbiAgICBjb21wb3NlUGxhbmVHZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUJ1ZmZlckdlb21ldHJ5KEB3aWR0aCwgQGhlaWdodClcbiAgICBjb21wb3NlUGxhbmVNZXNoID0gbmV3IFRIUkVFLk1lc2goY29tcG9zZVBsYW5lR2VvbWV0cnksIEBjb21wb3NlTWF0ZXJpYWwpXG4gICAgQGNvbXBvc2VTY2VuZS5hZGQgY29tcG9zZVBsYW5lTWVzaFxuXG4gIGluaXRUZXh0dXJlczogLT5cbiAgICBwYXJzID1cbiAgICAgIG1pbkZpbHRlcjogVEhSRUUuTGluZWFyRmlsdGVyXG4gICAgICBtYWdGaWx0ZXI6IFRIUkVFLkxpbmVhckZpbHRlclxuICAgICAgZm9ybWF0OiBUSFJFRS5SR0JGb3JtYXRcbiAgICAgIHN0ZW5jaWxCdWZmZXI6IGZhbHNlXG5cbiAgICBAZGVwdGhUZXh0dXJlID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyVGFyZ2V0KEB3aWR0aCwgQGhlaWdodCwgcGFycylcbiAgICBAbm9ybWFsVGV4dHVyZSA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlclRhcmdldChAd2lkdGgsIEBoZWlnaHQsIHBhcnMpXG4gICAgQGhhdGNoVGV4dHVyZSA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlclRhcmdldChAd2lkdGgsIEBoZWlnaHQsIHBhcnMpXG5cbiAgICBAY29tcG9zZU1hdGVyaWFsLnVuaWZvcm1zLmRlcHRodGV4dHVyZS52YWx1ZSA9IEBkZXB0aFRleHR1cmVcbiAgICBAY29tcG9zZU1hdGVyaWFsLnVuaWZvcm1zLm5vcm1hbHRleHR1cmUudmFsdWUgPSBAbm9ybWFsVGV4dHVyZVxuICAgIEBjb21wb3NlTWF0ZXJpYWwudW5pZm9ybXMuaGF0Y2h0ZXh0dXJlLnZhbHVlID0gQGhhdGNoVGV4dHVyZVxuXG4gIGluaXRSZW5kZXJlcjogLT5cbiAgICBAcmVuZGVyZXIuc2V0U2l6ZShAd2lkdGgsIEBoZWlnaHQpXG4gICAgQGVsZW1lbnQuYXBwZW5kQ2hpbGQgQHJlbmRlcmVyLmRvbUVsZW1lbnRcblxuICBpbml0TW91c2VFdmVudDogLT5cbiAgICBAdHJhY2tpbmdNb3VzZSA9IGZhbHNlXG4gICAgQGVsZW1lbnQub25tb3VzZWRvd24gID0gKGUpID0+XG4gICAgICBAdHJhY2tpbmdNb3VzZSA9IHRydWVcbiAgICAgIEBtb3VzZVhhID0gZS5jbGllbnRYXG4gICAgICBAbW91c2VZYSA9IGUuY2xpZW50WVxuICAgICAgQG1vdXNlWGIgPSBAbW91c2VYYVxuICAgICAgQG1vdXNlWWIgPSBAbW91c2VZYVxuICAgIEBlbGVtZW50Lm9ubW91c2V1cCA9IChlKSA9PlxuICAgICAgQHRyYWNraW5nTW91c2UgPSBmYWxzZVxuICAgICAgQG1vdXNlWGEgPSAtMVxuICAgICAgQG1vdXNlWWEgPSAtMVxuICAgIEBlbGVtZW50Lm9ubW91c2Vtb3Zlb3V0ID0gQGVsZW1lbnQub25tb3VzZXVwXG4gICAgQGVsZW1lbnQub25tb3VzZW1vdmUgPSAoZSkgPT5cbiAgICAgIGlmIEB0cmFja2luZ01vdXNlXG4gICAgICAgIEBtb3VzZVhiID0gZS5jbGllbnRYXG4gICAgICAgIEBtb3VzZVliID0gZS5jbGllbnRZXG5cbiAgcmVuZGVyRGVwdGg6IC0+XG4gICAgQG9iamVjdFNjZW5lLm92ZXJyaWRlTWF0ZXJpYWwgPSBAZGVwdGhNYXRlcmlhbFxuICAgIEByZW5kZXJlci5zZXRDbGVhckNvbG9yICcjMDAwMDAwJ1xuICAgIEByZW5kZXJlci5jbGVhclRhcmdldCBAZGVwdGhUZXh0dXJlLCB0cnVlLCB0cnVlXG4gICAgQHJlbmRlcmVyLnJlbmRlciBAb2JqZWN0U2NlbmUsIEBvYmplY3RDYW1lcmEsIEBkZXB0aFRleHR1cmVcblxuICByZW5kZXJOb3JtYWw6IC0+XG4gICAgQG9iamVjdFNjZW5lLm92ZXJyaWRlTWF0ZXJpYWwgPSBAbm9ybWFsTWF0ZXJpYWxcbiAgICBAcmVuZGVyZXIuc2V0Q2xlYXJDb2xvciAnIzAwMDAwMCdcbiAgICBAcmVuZGVyZXIuY2xlYXJUYXJnZXQgQG5vcm1hbFRleHR1cmUsIHRydWUsIHRydWVcbiAgICBAcmVuZGVyZXIucmVuZGVyIEBvYmplY3RTY2VuZSwgQG9iamVjdENhbWVyYSwgQG5vcm1hbFRleHR1cmVcblxuICByZW5kZXJIYXRjaDogLT5cbiAgICBAb2JqZWN0U2NlbmUub3ZlcnJpZGVNYXRlcmlhbCA9IEBoYXRjaE1hdGVyaWFsXG4gICAgQHJlbmRlcmVyLnNldENsZWFyQ29sb3IgJyNmZmZmZmYnXG4gICAgQHJlbmRlcmVyLmNsZWFyVGFyZ2V0IEBoYXRjaFRleHR1cmUsIHRydWUsIHRydWVcbiAgICBAcmVuZGVyZXIucmVuZGVyIEBvYmplY3RTY2VuZSwgQG9iamVjdENhbWVyYSwgQGhhdGNoVGV4dHVyZVxuXG4gIGNvbXBvc2U6IC0+XG4gICAgQHJlbmRlcmVyLnJlbmRlciBAY29tcG9zZVNjZW5lLCBAY29tcG9zZUNhbWVyYVxuXG4gIGFuaW1hdGU6IC0+XG4gICAgaWYgQG1vdXNlWGEgPj0gMCAmJiBAbW91c2VZYSA+PSAwXG4gICAgICBvZmZzZXRYID0gQG1vdXNlWGIgLSBAbW91c2VYYVxuICAgICAgb2Zmc2V0WSA9IEBtb3VzZVliIC0gQG1vdXNlWWFcbiAgICAgIEBjYW1lcmFSb3RhdGVBID0gLSBNYXRoLmF0YW4ob2Zmc2V0WCAvIDMyMClcbiAgICAgIEBjYW1lcmFSb3RhdGVCID0gLSBNYXRoLmF0YW4ob2Zmc2V0WSAvIDMyMClcbiAgICBlbHNlXG4gICAgICBAY2FtZXJhUm90YXRlQSAqPSAwLjhcbiAgICAgIEBjYW1lcmFSb3RhdGVCICo9IDAuOFxuICAgIEBvYmplY3RDYW1lcmEucG9zaXRpb24uY29weShAY2FtZXJhT3JpZ2luKS5hcHBseUF4aXNBbmdsZShAYXhpc1ksIEBjYW1lcmFSb3RhdGVBKVxuICAgIEBvYmplY3RDYW1lcmEucG9zaXRpb24uYXBwbHlBeGlzQW5nbGUoQGF4aXNYLCBAY2FtZXJhUm90YXRlQilcbiAgICBAb2JqZWN0Q2FtZXJhLnBvc2l0aW9uLmFkZChAY2FtZXJhQ2VudGVyKVxuICAgIEBvYmplY3RDYW1lcmEubG9va0F0KEBjYW1lcmFDZW50ZXIpXG5cbiAgcmVuZGVyOiAtPlxuICAgIEBhbmltYXRlKClcbiAgICBAcmVuZGVyRGVwdGgoKVxuICAgIEByZW5kZXJOb3JtYWwoKVxuICAgIEByZW5kZXJIYXRjaCgpXG4gICAgQGNvbXBvc2UoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNjZW5lTWFuYWdlclxuIl19
