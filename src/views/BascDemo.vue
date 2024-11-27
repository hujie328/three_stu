<template>
    <div ref="renderBox" class="renber_box"></div>
</template>

<script setup>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { onMounted, ref } from "vue";
const renderBox = ref();

onMounted(() => {
    // 1、创建场景
    const scene = new THREE.Scene();

    // 2、创建相机
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    // 设置相机位置
    camera.position.set(0, 0, 10);
    scene.add(camera);
    // 坐标轴辅助
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    // 添加物体
    // 创建几何体
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    // 根据几何体和材质创建物体
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    // 将几何体添加到场景中
    scene.add(cube);

    // 初始化渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    // 设置渲染的尺寸大小
    renderer.setSize(window.innerWidth, window.innerHeight);
    // console.log(renderer);
    // 将webgl渲染的canvas内容添加到body
    renderBox.value.appendChild(renderer.domElement);

    // 使用渲染器，通过相机将场景渲染进来
    renderer.render(scene, camera);
    const controls = new OrbitControls(camera, renderer.domElement);

    //监听鼠标、键盘事件
    controls.addEventListener("change", function () {
        renderer.render(scene, camera); //执行渲染操作
    });
})
</script>

<style lang="scss" scoped>
.renber_box {
    width: 100%;
    height: 100%;
}
</style>