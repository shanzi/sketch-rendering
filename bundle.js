(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

  ComposeMaterial.prototype.fragmentShader = 'uniform sampler2D depthtexture;\nuniform sampler2D normaltexture;\nuniform sampler2D hatchtexture;\n\nvarying vec2 vUv;\n\nfloat planeDistance(const in vec3 positionA, const in vec3 normalA, \n                    const in vec3 positionB, const in vec3 normalB) {\n  vec3 positionDelta = positionB-positionA;\n  float planeDistanceDelta = max(abs(dot(positionDelta, normalA)), abs(dot(positionDelta, normalB)));\n  return planeDistanceDelta;\n}\n\nvoid main() {\n  float depthCenter = texture2D(depthtexture, vUv).r;\n  float px = 1.0/800.0;\n\n  vec3 leftpos = vec3(vUv.s - px, vUv.t, 1.0 - texture2D(depthtexture, vec2(vUv.s - px, vUv.t)).r);\n  vec3 rightpos = vec3(vUv.s + px, vUv.t, 1.0 - texture2D(depthtexture, vec2(vUv.s + px, vUv.t)).r);\n  vec3 uppos = vec3(vUv.s, vUv.t - px, 1.0 - texture2D(depthtexture, vec2(vUv.s, vUv.t - px)).r);\n  vec3 downpos = vec3(vUv.s, vUv.t + px, 1.0 - texture2D(depthtexture, vec2(vUv.s, vUv.t + px)).r);\n\n  vec3 leftnor = texture2D(normaltexture, vec2(vUv.s - px, vUv.t)).xyz;\n  vec3 rightnor = texture2D(normaltexture, vec2(vUv.s + px, vUv.t)).xyz;\n  vec3 upnor = texture2D(normaltexture, vec2(vUv.s, vUv.t - px)).xyz;\n  vec3 downnor = texture2D(normaltexture, vec2(vUv.s, vUv.t + px)).xyz;\n\n  vec2 planeDist = vec2(\n    planeDistance(leftpos, leftnor, rightpos, rightnor),\n    planeDistance(uppos, upnor, downpos, downnor));\n\n  float planeEdge = 2.5 * length(planeDist);\n  planeEdge = 1.0 - 0.5 * smoothstep(0.0, depthCenter, planeEdge);\n\n  float normEdge = max(length(leftnor - rightnor), length(upnor - downnor));\n  normEdge = 1.0 - 0.5 * smoothstep(0.0, 0.5, normEdge); \n\n  float edge= planeEdge * normEdge;\n  vec4 hatch = texture2D(hatchtexture, vUv);\n  gl_FragColor = vec4(vec3(hatch * edge), 1.0);\n}';

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



},{}],2:[function(require,module,exports){
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

  HatchMaterial.prototype.vertexShader = 'varying vec2 vUv;\n\nvoid main() {\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n  vUv = uv;\n}';

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



},{}],3:[function(require,module,exports){
var SceneManager, element, manager, render;

SceneManager = require('./scene_manager');

element = document.getElementById('container');

manager = new SceneManager(element);

render = function() {
  requestAnimationFrame(render);
  return manager.render();
};

setTimeout(render, 1000);



},{"./scene_manager":4}],4:[function(require,module,exports){
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



},{"./compose_material":1,"./hatch_material":2}]},{},[3]);
