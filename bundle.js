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

  ComposeMaterial.prototype.fragmentShader = 'uniform sampler2D depthtexture;\nuniform sampler2D normaltexture;\nuniform sampler2D hatchtexture;\n\nvarying vec2 vUv;\n\nfloat planeDistance(const in vec3 positionA, const in vec3 normalA, \n                    const in vec3 positionB, const in vec3 normalB) {\n  vec3 positionDelta = positionB-positionA;\n  float planeDistanceDelta = max(abs(dot(positionDelta, normalA)), abs(dot(positionDelta, normalB)));\n  return planeDistanceDelta;\n}\n\nvoid main() {\n  float depthCenter = texture2D(depthtexture, vUv).r;\n  float px = 1.0/800.0;\n\n  vec3 leftpos = vec3(vUv.s - px, vUv.t, 1.0 - texture2D(depthtexture, vec2(vUv.s - px, vUv.t)).r);\n  vec3 rightpos = vec3(vUv.s + px, vUv.t, 1.0 - texture2D(depthtexture, vec2(vUv.s + px, vUv.t)).r);\n  vec3 uppos = vec3(vUv.s, vUv.t - px, 1.0 - texture2D(depthtexture, vec2(vUv.s, vUv.t - px)).r);\n  vec3 downpos = vec3(vUv.s, vUv.t + px, 1.0 - texture2D(depthtexture, vec2(vUv.s, vUv.t + px)).r);\n\n  vec3 leftnor = texture2D(normaltexture, vec2(vUv.s - px, vUv.t)).xyz;\n  vec3 rightnor = texture2D(normaltexture, vec2(vUv.s + px, vUv.t)).xyz;\n  vec3 upnor = texture2D(normaltexture, vec2(vUv.s, vUv.t - px)).xyz;\n  vec3 downnor = texture2D(normaltexture, vec2(vUv.s, vUv.t + px)).xyz;\n\n  vec2 planeDist = vec2(\n    planeDistance(leftpos, leftnor, rightpos, rightnor),\n    planeDistance(uppos, upnor, downpos, downnor));\n\n  float planeEdge = 2.5 * length(planeDist);\n  planeEdge = 1.0 - 0.5 * smoothstep(0.0, depthCenter, planeEdge);;\n\n  float normEdge = max(length(leftnor - rightnor), length(upnor - downnor));\n  normEdge = 1.0 - 0.5 * smoothstep(0.0, 0.2, normEdge); \n\n  float edge= planeEdge * normEdge;\n  vec4 hatch = texture2D(hatchtexture, vUv);\n  gl_FragColor = hatch * edge;\n}';

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

  HatchMaterial.prototype.vertexShader = '\nuniform vec3 directionalLightColor[MAX_DIR_LIGHTS];\nuniform vec3 directionalLightDirection[MAX_DIR_LIGHTS];\n\nvarying vec2 vUv;\nvarying float shading;\n\nvoid main() {\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n\n  vec3 vNormal = normalMatrix * normal; \n\n  shading = 0.0;\n  for(int l = 0; l < MAX_DIR_LIGHTS; l++) {\n    vec3 lightDirection = directionalLightDirection[l];\n    shading += dot(lightDirection, vNormal);\n  }\n  shading = max(shading, 0.0);\n\n  vUv = uv;\n}';

  HatchMaterial.prototype.fragmentShader = 'uniform sampler2D hatch0;\nuniform sampler2D hatch1;\nuniform sampler2D hatch2;\n\nvarying vec2 vUv;\nvarying float shading;\n\nfloat shade(const in float shading, const in vec2 uv) {\n  float shadingFactor;\n  float stepSize = 1.0 / 3.0;\n\n  float alpha = 0.0;\n  float scaleWhite = 0.0;\n  float scaleHatch0 = 0.0;\n  float scaleHatch1 = 0.0;\n  float scaleHatch2 = 0.0;\n\n  if (shading <= stepSize) {\n    alpha = 3.0 * shading;\n    scaleHatch1 = alpha;\n    scaleHatch2 = 1.0 - alpha;\n  }\n  else if (shading > stepSize && shading <= 2.0 * stepSize) {\n    alpha = 3.0 * (shading - stepSize);\n    scaleHatch0 = alpha;\n    scaleHatch1 = 1.0 - alpha;\n  }\n  else if (shading > 2.0 * stepSize) {\n    alpha = 3.0 * (shading - stepSize * 2.0);\n    scaleWhite = alpha;\n    scaleHatch0 = 1.0 - alpha;\n  }\n\n  shadingFactor = scaleWhite + \n    scaleHatch0 * texture2D(hatch0, uv).r +\n    scaleHatch1 * texture2D(hatch1, uv).r +\n    scaleHatch2 * texture2D(hatch2, uv).r;\n\n  return shadingFactor;\n}\n\nvoid main() {\n  //gl_FragColor = vec4(vec3(shading), 1.0);\n  float crossedShading = shade(shading, vUv) * shade(shading, vec2(vUv.t, vUv.s)) * 0.8 + 0.2;\n  gl_FragColor = vec4(vec3(crossedShading), 1.0);\n}';

  function HatchMaterial() {
    var k, uniforms, v, _ref;
    uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib['lights'], {}]);
    _ref = this.uniforms;
    for (k in _ref) {
      v = _ref[k];
      v.value.magFilter = THREE.NearestFilter;
      v.value.minFilter = THREE.NearestFilter;
      v.value.wrapS = THREE.RepeatWrapping;
      v.value.wrapT = THREE.RepeatWrapping;
      uniforms[k] = v;
    }
    this.uniforms = uniforms;
    this.lights = true;
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
  return manager.render();
};

setTimeout(render, 1000);



},{"./scene_manager":"/Users/Chase_Zhang/codes/pages/sketch-rendering/coffee/scene_manager.coffee"}],"/Users/Chase_Zhang/codes/pages/sketch-rendering/coffee/scene_manager.coffee":[function(require,module,exports){
var ComposeMaterial, HatchMaterial, SceneManager;

ComposeMaterial = require('./compose_material');

HatchMaterial = require('./hatch_material');

SceneManager = (function() {
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
    this.initObjectScene();
    this.initComposeScene();
    this.initRenderer();
  }

  SceneManager.prototype.initObjectCamera = function() {
    this.objectCamera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 30);
    this.objectCamera.position.z = 14;
    this.objectCamera.position.x = 7;
    this.objectCamera.position.y = 3;
    return this.objectCamera.lookAt(new THREE.Vector3(0, 0, 0));
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

  SceneManager.prototype.render = function() {
    this.renderDepth();
    this.renderNormal();
    this.renderHatch();
    return this.compose();
  };

  return SceneManager;

})();

module.exports = SceneManager;



},{"./compose_material":"/Users/Chase_Zhang/codes/pages/sketch-rendering/coffee/compose_material.coffee","./hatch_material":"/Users/Chase_Zhang/codes/pages/sketch-rendering/coffee/hatch_material.coffee"}]},{},["/Users/Chase_Zhang/codes/pages/sketch-rendering/coffee/main.coffee"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy5udm0vdjAuMTAuMjkvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL0NoYXNlX1poYW5nL2NvZGVzL3BhZ2VzL3NrZXRjaC1yZW5kZXJpbmcvY29mZmVlL2NvbXBvc2VfbWF0ZXJpYWwuY29mZmVlIiwiL1VzZXJzL0NoYXNlX1poYW5nL2NvZGVzL3BhZ2VzL3NrZXRjaC1yZW5kZXJpbmcvY29mZmVlL2hhdGNoX21hdGVyaWFsLmNvZmZlZSIsIi9Vc2Vycy9DaGFzZV9aaGFuZy9jb2Rlcy9wYWdlcy9za2V0Y2gtcmVuZGVyaW5nL2NvZmZlZS9tYWluLmNvZmZlZSIsIi9Vc2Vycy9DaGFzZV9aaGFuZy9jb2Rlcy9wYWdlcy9za2V0Y2gtcmVuZGVyaW5nL2NvZmZlZS9zY2VuZV9tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsZUFBQTtFQUFBO2lTQUFBOztBQUFBO0FBQ0Usb0NBQUEsQ0FBQTs7QUFBQSw0QkFBQSxVQUFBLEdBQVksRUFBWixDQUFBOztBQUFBLDRCQUNBLFFBQUEsR0FDRTtBQUFBLElBQUEsWUFBQSxFQUNFO0FBQUEsTUFBQSxJQUFBLEVBQU0sR0FBTjtBQUFBLE1BQ0EsS0FBQSxFQUFPLElBRFA7S0FERjtBQUFBLElBR0EsYUFBQSxFQUNFO0FBQUEsTUFBQSxJQUFBLEVBQU0sR0FBTjtBQUFBLE1BQ0EsS0FBQSxFQUFPLElBRFA7S0FKRjtBQUFBLElBTUEsWUFBQSxFQUNFO0FBQUEsTUFBQSxJQUFBLEVBQU0sR0FBTjtBQUFBLE1BQ0EsS0FBQSxFQUFPLElBRFA7S0FQRjtHQUZGLENBQUE7O0FBQUEsNEJBWUEsWUFBQSxHQUFjLDZIQVpkLENBQUE7O0FBQUEsNEJBbUJBLGNBQUEsR0FBZ0IsMnREQW5CaEIsQ0FBQTs7QUE4RGEsRUFBQSx5QkFBQSxH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QWlCLFlBMUdqQixDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNsYXNzIENvbXBvc2VNYXRlcmlhbCBleHRlbmRzIFRIUkVFLlNoYWRlck1hdGVyaWFsXG4gIGF0dHJpYnV0ZXM6IHt9XG4gIHVuaWZvcm1zOlxuICAgIGRlcHRodGV4dHVyZTpcbiAgICAgIHR5cGU6ICd0J1xuICAgICAgdmFsdWU6IG51bGxcbiAgICBub3JtYWx0ZXh0dXJlOlxuICAgICAgdHlwZTogJ3QnXG4gICAgICB2YWx1ZTogbnVsbFxuICAgIGhhdGNodGV4dHVyZTpcbiAgICAgIHR5cGU6ICd0J1xuICAgICAgdmFsdWU6IG51bGxcblxuICB2ZXJ0ZXhTaGFkZXI6ICcnJ1xudmFyeWluZyB2ZWMyIHZVdjtcbnZvaWQgbWFpbigpIHtcbiAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbW9kZWxWaWV3TWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKTtcbiAgdlV2ID0gdXY7XG59XG4gICcnJ1xuICBmcmFnbWVudFNoYWRlcjogJycnXG51bmlmb3JtIHNhbXBsZXIyRCBkZXB0aHRleHR1cmU7XG51bmlmb3JtIHNhbXBsZXIyRCBub3JtYWx0ZXh0dXJlO1xudW5pZm9ybSBzYW1wbGVyMkQgaGF0Y2h0ZXh0dXJlO1xuXG52YXJ5aW5nIHZlYzIgdlV2O1xuXG5mbG9hdCBwbGFuZURpc3RhbmNlKGNvbnN0IGluIHZlYzMgcG9zaXRpb25BLCBjb25zdCBpbiB2ZWMzIG5vcm1hbEEsIFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbiB2ZWMzIHBvc2l0aW9uQiwgY29uc3QgaW4gdmVjMyBub3JtYWxCKSB7XG4gIHZlYzMgcG9zaXRpb25EZWx0YSA9IHBvc2l0aW9uQi1wb3NpdGlvbkE7XG4gIGZsb2F0IHBsYW5lRGlzdGFuY2VEZWx0YSA9IG1heChhYnMoZG90KHBvc2l0aW9uRGVsdGEsIG5vcm1hbEEpKSwgYWJzKGRvdChwb3NpdGlvbkRlbHRhLCBub3JtYWxCKSkpO1xuICByZXR1cm4gcGxhbmVEaXN0YW5jZURlbHRhO1xufVxuXG52b2lkIG1haW4oKSB7XG4gIGZsb2F0IGRlcHRoQ2VudGVyID0gdGV4dHVyZTJEKGRlcHRodGV4dHVyZSwgdlV2KS5yO1xuICBmbG9hdCBweCA9IDEuMC84MDAuMDtcblxuICB2ZWMzIGxlZnRwb3MgPSB2ZWMzKHZVdi5zIC0gcHgsIHZVdi50LCAxLjAgLSB0ZXh0dXJlMkQoZGVwdGh0ZXh0dXJlLCB2ZWMyKHZVdi5zIC0gcHgsIHZVdi50KSkucik7XG4gIHZlYzMgcmlnaHRwb3MgPSB2ZWMzKHZVdi5zICsgcHgsIHZVdi50LCAxLjAgLSB0ZXh0dXJlMkQoZGVwdGh0ZXh0dXJlLCB2ZWMyKHZVdi5zICsgcHgsIHZVdi50KSkucik7XG4gIHZlYzMgdXBwb3MgPSB2ZWMzKHZVdi5zLCB2VXYudCAtIHB4LCAxLjAgLSB0ZXh0dXJlMkQoZGVwdGh0ZXh0dXJlLCB2ZWMyKHZVdi5zLCB2VXYudCAtIHB4KSkucik7XG4gIHZlYzMgZG93bnBvcyA9IHZlYzModlV2LnMsIHZVdi50ICsgcHgsIDEuMCAtIHRleHR1cmUyRChkZXB0aHRleHR1cmUsIHZlYzIodlV2LnMsIHZVdi50ICsgcHgpKS5yKTtcblxuICB2ZWMzIGxlZnRub3IgPSB0ZXh0dXJlMkQobm9ybWFsdGV4dHVyZSwgdmVjMih2VXYucyAtIHB4LCB2VXYudCkpLnh5ejtcbiAgdmVjMyByaWdodG5vciA9IHRleHR1cmUyRChub3JtYWx0ZXh0dXJlLCB2ZWMyKHZVdi5zICsgcHgsIHZVdi50KSkueHl6O1xuICB2ZWMzIHVwbm9yID0gdGV4dHVyZTJEKG5vcm1hbHRleHR1cmUsIHZlYzIodlV2LnMsIHZVdi50IC0gcHgpKS54eXo7XG4gIHZlYzMgZG93bm5vciA9IHRleHR1cmUyRChub3JtYWx0ZXh0dXJlLCB2ZWMyKHZVdi5zLCB2VXYudCArIHB4KSkueHl6O1xuXG4gIHZlYzIgcGxhbmVEaXN0ID0gdmVjMihcbiAgICBwbGFuZURpc3RhbmNlKGxlZnRwb3MsIGxlZnRub3IsIHJpZ2h0cG9zLCByaWdodG5vciksXG4gICAgcGxhbmVEaXN0YW5jZSh1cHBvcywgdXBub3IsIGRvd25wb3MsIGRvd25ub3IpKTtcblxuICBmbG9hdCBwbGFuZUVkZ2UgPSAyLjUgKiBsZW5ndGgocGxhbmVEaXN0KTtcbiAgcGxhbmVFZGdlID0gMS4wIC0gMC41ICogc21vb3Roc3RlcCgwLjAsIGRlcHRoQ2VudGVyLCBwbGFuZUVkZ2UpOztcblxuICBmbG9hdCBub3JtRWRnZSA9IG1heChsZW5ndGgobGVmdG5vciAtIHJpZ2h0bm9yKSwgbGVuZ3RoKHVwbm9yIC0gZG93bm5vcikpO1xuICBub3JtRWRnZSA9IDEuMCAtIDAuNSAqIHNtb290aHN0ZXAoMC4wLCAwLjIsIG5vcm1FZGdlKTsgXG5cbiAgZmxvYXQgZWRnZT0gcGxhbmVFZGdlICogbm9ybUVkZ2U7XG4gIHZlYzQgaGF0Y2ggPSB0ZXh0dXJlMkQoaGF0Y2h0ZXh0dXJlLCB2VXYpO1xuICBnbF9GcmFnQ29sb3IgPSBoYXRjaCAqIGVkZ2U7XG59XG4gICcnJ1xuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlcihcbiAgICAgIGF0dHJpYnV0ZXM6IEBhdHRyaWJ1dGVzXG4gICAgICB1bmlmb3JtczogQHVuaWZvcm1zXG4gICAgICB2ZXJ0ZXhTaGFkZXI6IEB2ZXJ0ZXhTaGFkZXJcbiAgICAgIGZyYWdtZW50U2hhZGVyOiBAZnJhZ21lbnRTaGFkZXJcbiAgICApXG5cbm1vZHVsZS5leHBvcnRzID0gQ29tcG9zZU1hdGVyaWFsXG4iLCJjbGFzcyBIYXRjaE1hdGVyaWFsIGV4dGVuZHMgVEhSRUUuU2hhZGVyTWF0ZXJpYWxcbiAgYXR0cmlidXRlczoge31cbiAgdW5pZm9ybXM6XG4gICAgaGF0Y2gwOlxuICAgICAgdHlwZTogJ3QnXG4gICAgICB2YWx1ZTogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSgndGV4dHVyZXMvaGF0Y2hfMC5qcGcnKVxuICAgIGhhdGNoMTpcbiAgICAgIHR5cGU6ICd0J1xuICAgICAgdmFsdWU6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoJ3RleHR1cmVzL2hhdGNoXzEuanBnJylcbiAgICBoYXRjaDI6XG4gICAgICB0eXBlOiAndCdcbiAgICAgIHZhbHVlOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCd0ZXh0dXJlcy9oYXRjaF8yLmpwZycpXG5cbiAgdmVydGV4U2hhZGVyOiAnJydcblxudW5pZm9ybSB2ZWMzIGRpcmVjdGlvbmFsTGlnaHRDb2xvcltNQVhfRElSX0xJR0hUU107XG51bmlmb3JtIHZlYzMgZGlyZWN0aW9uYWxMaWdodERpcmVjdGlvbltNQVhfRElSX0xJR0hUU107XG5cbnZhcnlpbmcgdmVjMiB2VXY7XG52YXJ5aW5nIGZsb2F0IHNoYWRpbmc7XG5cbnZvaWQgbWFpbigpIHtcbiAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbW9kZWxWaWV3TWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKTtcblxuICB2ZWMzIHZOb3JtYWwgPSBub3JtYWxNYXRyaXggKiBub3JtYWw7IFxuXG4gIHNoYWRpbmcgPSAwLjA7XG4gIGZvcihpbnQgbCA9IDA7IGwgPCBNQVhfRElSX0xJR0hUUzsgbCsrKSB7XG4gICAgdmVjMyBsaWdodERpcmVjdGlvbiA9IGRpcmVjdGlvbmFsTGlnaHREaXJlY3Rpb25bbF07XG4gICAgc2hhZGluZyArPSBkb3QobGlnaHREaXJlY3Rpb24sIHZOb3JtYWwpO1xuICB9XG4gIHNoYWRpbmcgPSBtYXgoc2hhZGluZywgMC4wKTtcblxuICB2VXYgPSB1djtcbn1cbiAgJycnXG4gIGZyYWdtZW50U2hhZGVyOiAnJydcbnVuaWZvcm0gc2FtcGxlcjJEIGhhdGNoMDtcbnVuaWZvcm0gc2FtcGxlcjJEIGhhdGNoMTtcbnVuaWZvcm0gc2FtcGxlcjJEIGhhdGNoMjtcblxudmFyeWluZyB2ZWMyIHZVdjtcbnZhcnlpbmcgZmxvYXQgc2hhZGluZztcblxuZmxvYXQgc2hhZGUoY29uc3QgaW4gZmxvYXQgc2hhZGluZywgY29uc3QgaW4gdmVjMiB1dikge1xuICBmbG9hdCBzaGFkaW5nRmFjdG9yO1xuICBmbG9hdCBzdGVwU2l6ZSA9IDEuMCAvIDMuMDtcblxuICBmbG9hdCBhbHBoYSA9IDAuMDtcbiAgZmxvYXQgc2NhbGVXaGl0ZSA9IDAuMDtcbiAgZmxvYXQgc2NhbGVIYXRjaDAgPSAwLjA7XG4gIGZsb2F0IHNjYWxlSGF0Y2gxID0gMC4wO1xuICBmbG9hdCBzY2FsZUhhdGNoMiA9IDAuMDtcblxuICBpZiAoc2hhZGluZyA8PSBzdGVwU2l6ZSkge1xuICAgIGFscGhhID0gMy4wICogc2hhZGluZztcbiAgICBzY2FsZUhhdGNoMSA9IGFscGhhO1xuICAgIHNjYWxlSGF0Y2gyID0gMS4wIC0gYWxwaGE7XG4gIH1cbiAgZWxzZSBpZiAoc2hhZGluZyA+IHN0ZXBTaXplICYmIHNoYWRpbmcgPD0gMi4wICogc3RlcFNpemUpIHtcbiAgICBhbHBoYSA9IDMuMCAqIChzaGFkaW5nIC0gc3RlcFNpemUpO1xuICAgIHNjYWxlSGF0Y2gwID0gYWxwaGE7XG4gICAgc2NhbGVIYXRjaDEgPSAxLjAgLSBhbHBoYTtcbiAgfVxuICBlbHNlIGlmIChzaGFkaW5nID4gMi4wICogc3RlcFNpemUpIHtcbiAgICBhbHBoYSA9IDMuMCAqIChzaGFkaW5nIC0gc3RlcFNpemUgKiAyLjApO1xuICAgIHNjYWxlV2hpdGUgPSBhbHBoYTtcbiAgICBzY2FsZUhhdGNoMCA9IDEuMCAtIGFscGhhO1xuICB9XG5cbiAgc2hhZGluZ0ZhY3RvciA9IHNjYWxlV2hpdGUgKyBcbiAgICBzY2FsZUhhdGNoMCAqIHRleHR1cmUyRChoYXRjaDAsIHV2KS5yICtcbiAgICBzY2FsZUhhdGNoMSAqIHRleHR1cmUyRChoYXRjaDEsIHV2KS5yICtcbiAgICBzY2FsZUhhdGNoMiAqIHRleHR1cmUyRChoYXRjaDIsIHV2KS5yO1xuXG4gIHJldHVybiBzaGFkaW5nRmFjdG9yO1xufVxuXG52b2lkIG1haW4oKSB7XG4gIC8vZ2xfRnJhZ0NvbG9yID0gdmVjNCh2ZWMzKHNoYWRpbmcpLCAxLjApO1xuICBmbG9hdCBjcm9zc2VkU2hhZGluZyA9IHNoYWRlKHNoYWRpbmcsIHZVdikgKiBzaGFkZShzaGFkaW5nLCB2ZWMyKHZVdi50LCB2VXYucykpICogMC44ICsgMC4yO1xuICBnbF9GcmFnQ29sb3IgPSB2ZWM0KHZlYzMoY3Jvc3NlZFNoYWRpbmcpLCAxLjApO1xufVxuICAnJydcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgdW5pZm9ybXMgPSBUSFJFRS5Vbmlmb3Jtc1V0aWxzLm1lcmdlKFtUSFJFRS5Vbmlmb3Jtc0xpYlsnbGlnaHRzJ10sIHt9XSlcbiAgICBmb3IgaywgdiBvZiBAdW5pZm9ybXNcbiAgICAgIHYudmFsdWUubWFnRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlclxuICAgICAgdi52YWx1ZS5taW5GaWx0ZXIgPSBUSFJFRS5OZWFyZXN0RmlsdGVyXG4gICAgICB2LnZhbHVlLndyYXBTID0gVEhSRUUuUmVwZWF0V3JhcHBpbmdcbiAgICAgIHYudmFsdWUud3JhcFQgPSBUSFJFRS5SZXBlYXRXcmFwcGluZ1xuICAgICAgdW5pZm9ybXNba10gPSB2XG4gICAgQHVuaWZvcm1zID0gdW5pZm9ybXNcbiAgICBAbGlnaHRzID0gdHJ1ZVxuICAgIHN1cGVyKFxuICAgICAgYXR0cmlidXRlczogQGF0dHJpYnV0ZXNcbiAgICAgIHVuaWZvcm1zOiBAdW5pZm9ybXNcbiAgICAgIHZlcnRleFNoYWRlcjogQHZlcnRleFNoYWRlclxuICAgICAgZnJhZ21lbnRTaGFkZXI6IEBmcmFnbWVudFNoYWRlclxuICAgIClcblxubW9kdWxlLmV4cG9ydHMgPSBIYXRjaE1hdGVyaWFsXG4iLCJTY2VuZU1hbmFnZXIgPSByZXF1aXJlICcuL3NjZW5lX21hbmFnZXInXG5cbmVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnY29udGFpbmVyJ1xubWFuYWdlciA9IG5ldyBTY2VuZU1hbmFnZXIoZWxlbWVudClcbnJlbmRlciA9IC0+XG4gIG1hbmFnZXIucmVuZGVyKClcblxuc2V0VGltZW91dCByZW5kZXIsIDEwMDBcbiIsIkNvbXBvc2VNYXRlcmlhbCA9IHJlcXVpcmUgJy4vY29tcG9zZV9tYXRlcmlhbCdcbkhhdGNoTWF0ZXJpYWwgPSByZXF1aXJlICcuL2hhdGNoX21hdGVyaWFsJ1xuXG5jbGFzcyBTY2VuZU1hbmFnZXJcbiAgb2JqZWN0U2NlbmU6IG5ldyBUSFJFRS5TY2VuZSgpXG4gIGNvbXBvc2VTY2VuZTogbmV3IFRIUkVFLlNjZW5lKClcblxuICBkZXB0aE1hdGVyaWFsOiBuZXcgVEhSRUUuTWVzaERlcHRoTWF0ZXJpYWwoKVxuICBub3JtYWxNYXRlcmlhbDogbmV3IFRIUkVFLk1lc2hOb3JtYWxNYXRlcmlhbCgpXG4gIGhhdGNoTWF0ZXJpYWw6IG5ldyBIYXRjaE1hdGVyaWFsKClcbiAgY29tcG9zZU1hdGVyaWFsOiBuZXcgQ29tcG9zZU1hdGVyaWFsKClcblxuICByZW5kZXJlcjogbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoYW50aWFsaWFzOiB0cnVlKVxuXG4gIGNvbnN0cnVjdG9yOiAoQGVsZW1lbnQpIC0+XG4gICAgQHdpZHRoID0gQGVsZW1lbnQuY2xpZW50V2lkdGhcbiAgICBAaGVpZ2h0ID0gQGVsZW1lbnQuY2xpZW50SGVpZ2h0XG5cbiAgICBAaW5pdFRleHR1cmVzKClcblxuICAgIEBpbml0T2JqZWN0Q2FtZXJhKClcbiAgICBAaW5pdENvbXBvc2VDYW1lcmEoKVxuXG4gICAgQGluaXRPYmplY3RTY2VuZSgpXG4gICAgQGluaXRDb21wb3NlU2NlbmUoKVxuXG4gICAgQGluaXRSZW5kZXJlcigpXG5cbiAgaW5pdE9iamVjdENhbWVyYTogLT5cbiAgICBAb2JqZWN0Q2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDQ1LCBAd2lkdGggLyBAaGVpZ2h0LCAxLCAzMClcbiAgICBAb2JqZWN0Q2FtZXJhLnBvc2l0aW9uLnogPSAxNFxuICAgIEBvYmplY3RDYW1lcmEucG9zaXRpb24ueCA9IDdcbiAgICBAb2JqZWN0Q2FtZXJhLnBvc2l0aW9uLnkgPSAzXG4gICAgQG9iamVjdENhbWVyYS5sb29rQXQobmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCkpXG5cbiAgaW5pdENvbXBvc2VDYW1lcmE6IC0+XG4gICAgQGNvbXBvc2VDYW1lcmEgPSBuZXcgVEhSRUUuT3J0aG9ncmFwaGljQ2FtZXJhKC1Ad2lkdGggLyAyLCBAd2lkdGggLyAyLCBAaGVpZ2h0IC8gMiwgLUBoZWlnaHQgLyAyLCAtMTAsIDEwKVxuXG4gIGluaXRPYmplY3RTY2VuZTogLT5cbiAgICBib3hHZW9tZXRyeSA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSgyLCAyLCAyKVxuICAgIHNwaGVyZUdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDIsIDMyLCAzMilcbiAgICBcbiAgICBib3hNZXNoID0gbmV3IFRIUkVFLk1lc2goYm94R2VvbWV0cnkpXG4gICAgc3BoZXJlTWVzaCA9IG5ldyBUSFJFRS5NZXNoKHNwaGVyZUdlb21ldHJ5KVxuXG4gICAgYm94TWVzaC5wb3NpdGlvbi54ID0gMVxuICAgIHNwaGVyZU1lc2gucG9zaXRpb24ueCA9IC0xXG5cbiAgICBkaXJlY3RMaWdodCA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4ZmZmZmZmLCAwLjUpXG4gICAgZGlyZWN0TGlnaHQucG9zaXRpb24uc2V0KDEsIDEsIDEpXG5cbiAgICBAb2JqZWN0U2NlbmUuYWRkKGJveE1lc2gpXG4gICAgQG9iamVjdFNjZW5lLmFkZChzcGhlcmVNZXNoKVxuICAgIEBvYmplY3RTY2VuZS5hZGQoZGlyZWN0TGlnaHQpXG5cbiAgaW5pdENvbXBvc2VTY2VuZTogLT5cbiAgICBjb21wb3NlUGxhbmVHZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUJ1ZmZlckdlb21ldHJ5KEB3aWR0aCwgQGhlaWdodClcbiAgICBjb21wb3NlUGxhbmVNZXNoID0gbmV3IFRIUkVFLk1lc2goY29tcG9zZVBsYW5lR2VvbWV0cnksIEBjb21wb3NlTWF0ZXJpYWwpXG4gICAgQGNvbXBvc2VTY2VuZS5hZGQgY29tcG9zZVBsYW5lTWVzaFxuXG4gIGluaXRUZXh0dXJlczogLT5cbiAgICBwYXJzID1cbiAgICAgIG1pbkZpbHRlcjogVEhSRUUuTGluZWFyRmlsdGVyXG4gICAgICBtYWdGaWx0ZXI6IFRIUkVFLkxpbmVhckZpbHRlclxuICAgICAgZm9ybWF0OiBUSFJFRS5SR0JGb3JtYXRcbiAgICAgIHN0ZW5jaWxCdWZmZXI6IGZhbHNlXG5cbiAgICBAZGVwdGhUZXh0dXJlID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyVGFyZ2V0KEB3aWR0aCwgQGhlaWdodCwgcGFycylcbiAgICBAbm9ybWFsVGV4dHVyZSA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlclRhcmdldChAd2lkdGgsIEBoZWlnaHQsIHBhcnMpXG4gICAgQGhhdGNoVGV4dHVyZSA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlclRhcmdldChAd2lkdGgsIEBoZWlnaHQsIHBhcnMpXG5cbiAgICBAY29tcG9zZU1hdGVyaWFsLnVuaWZvcm1zLmRlcHRodGV4dHVyZS52YWx1ZSA9IEBkZXB0aFRleHR1cmVcbiAgICBAY29tcG9zZU1hdGVyaWFsLnVuaWZvcm1zLm5vcm1hbHRleHR1cmUudmFsdWUgPSBAbm9ybWFsVGV4dHVyZVxuICAgIEBjb21wb3NlTWF0ZXJpYWwudW5pZm9ybXMuaGF0Y2h0ZXh0dXJlLnZhbHVlID0gQGhhdGNoVGV4dHVyZVxuXG4gIGluaXRSZW5kZXJlcjogLT5cbiAgICBAcmVuZGVyZXIuc2V0U2l6ZShAd2lkdGgsIEBoZWlnaHQpXG4gICAgQGVsZW1lbnQuYXBwZW5kQ2hpbGQgQHJlbmRlcmVyLmRvbUVsZW1lbnRcblxuICByZW5kZXJEZXB0aDogLT5cbiAgICBAb2JqZWN0U2NlbmUub3ZlcnJpZGVNYXRlcmlhbCA9IEBkZXB0aE1hdGVyaWFsXG4gICAgQHJlbmRlcmVyLnNldENsZWFyQ29sb3IgJyMwMDAwMDAnXG4gICAgQHJlbmRlcmVyLmNsZWFyVGFyZ2V0IEBkZXB0aFRleHR1cmUsIHRydWUsIHRydWVcbiAgICBAcmVuZGVyZXIucmVuZGVyIEBvYmplY3RTY2VuZSwgQG9iamVjdENhbWVyYSwgQGRlcHRoVGV4dHVyZVxuXG4gIHJlbmRlck5vcm1hbDogLT5cbiAgICBAb2JqZWN0U2NlbmUub3ZlcnJpZGVNYXRlcmlhbCA9IEBub3JtYWxNYXRlcmlhbFxuICAgIEByZW5kZXJlci5zZXRDbGVhckNvbG9yICcjMDAwMDAwJ1xuICAgIEByZW5kZXJlci5jbGVhclRhcmdldCBAbm9ybWFsVGV4dHVyZSwgdHJ1ZSwgdHJ1ZVxuICAgIEByZW5kZXJlci5yZW5kZXIgQG9iamVjdFNjZW5lLCBAb2JqZWN0Q2FtZXJhLCBAbm9ybWFsVGV4dHVyZVxuXG4gIHJlbmRlckhhdGNoOiAtPlxuICAgIEBvYmplY3RTY2VuZS5vdmVycmlkZU1hdGVyaWFsID0gQGhhdGNoTWF0ZXJpYWxcbiAgICBAcmVuZGVyZXIuc2V0Q2xlYXJDb2xvciAnI2ZmZmZmZidcbiAgICBAcmVuZGVyZXIuY2xlYXJUYXJnZXQgQGhhdGNoVGV4dHVyZSwgdHJ1ZSwgdHJ1ZVxuICAgIEByZW5kZXJlci5yZW5kZXIgQG9iamVjdFNjZW5lLCBAb2JqZWN0Q2FtZXJhLCBAaGF0Y2hUZXh0dXJlXG5cbiAgY29tcG9zZTogLT5cbiAgICBAcmVuZGVyZXIucmVuZGVyIEBjb21wb3NlU2NlbmUsIEBjb21wb3NlQ2FtZXJhXG5cbiAgcmVuZGVyOiAtPlxuICAgIEByZW5kZXJEZXB0aCgpXG4gICAgQHJlbmRlck5vcm1hbCgpXG4gICAgQHJlbmRlckhhdGNoKClcbiAgICBAY29tcG9zZSgpXG5cbm1vZHVsZS5leHBvcnRzID0gU2NlbmVNYW5hZ2VyXG4iXX0=
