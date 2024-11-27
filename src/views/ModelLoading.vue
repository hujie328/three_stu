<template>
  <div class="home" ref="homeEl">
    <canvas @click="meshOnClick" id="canvasEl" ref="canvasEl"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// @ is an alias to /src
const canvasEl = ref();
// 声明一个场景
const scene = new THREE.Scene();
// 声明一个相机
const camera = new THREE.PerspectiveCamera(
  90,
  window.innerWidth / window.innerHeight,
  10,
  3000
); // 视野角度,宽高比,相机近端面,相机远端面
// 声明一个渲染器
let renderer = null;
// 汽车集合
let cars = [];

onMounted(() => {

  camera.position.set(0, 600, 600);
  camera.lookAt(0, 0, 0); //坐标原点
  scene.add(camera);

  renderer = new THREE.WebGLRenderer({ canvas: canvasEl.value });
  // 坐标辅助线
  const axesHelper = new THREE.AxesHelper(800);
  scene.add(axesHelper);
  // 环境光
  const ambient = new THREE.AmbientLight(0xffffff);
  scene.add(ambient);
  // 加载器
  const gltfLoader = new GLTFLoader();
  const url = "./assets/cartoon_lowpoly_small_city_free_pack/scene.gltf";
  gltfLoader.load(url, (gltf) => {
    const root = gltf.scene;
    console.log(root);
    root.scale.set(0.5, 0.5, 0.5);
    root.position.set(200, 0, 200);
    scene.add(root);
    renderer.render(scene, camera);
    cars = root.getObjectByName("Cars").children;
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);

  const controls = new OrbitControls(camera, renderer.domElement);

  //监听鼠标、键盘事件
  controls.addEventListener("change", function () {
    renderer.render(scene, camera); //执行渲染操作
  });
});

// 声明一个点
const pointer = new THREE.Vector2();
// 射线的类
const raycaster = new THREE.Raycaster();

const meshOnClick = (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(cars, true);
  if (intersects.length > 0) {
    console.log(intersects[0].object);
    intersects[0].object.material = new THREE.MeshLambertMaterial({
      color: 0x000000,
    });
    renderer.render(scene, camera);
  } else {
  }
};
</script>

<style lang="scss" scoped>
.home {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
