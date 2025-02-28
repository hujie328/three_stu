<template>
    <!-- 画布容器：使用ref绑定以便在JS中操作 -->
    <canvas ref="canvas" class="snow-canvas"></canvas>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount } from "vue";
  
  /**
   * 雪花粒子类
   * 封装单个雪花的完整生命周期（初始化、运动、渲染）
   */
  class SnowFlake {
    /**
     * 构造函数（关键修改点）
     * @param {number} width - 当前画布宽度
     * @param {number} height - 当前画布高度
     * @param {number} sizeMin - 雪花最小尺寸
     * @param {number} sizeMax - 雪花最大尺寸
     * @param {number} speedMin - 最小下落速度
     * @param {number} speedMax - 最大下落速度
     */
    constructor(width, height, sizeMin, sizeMax, speedMin, speedMax) {
      // 存储可配置参数范围
      this.sizeMin = sizeMin;
      this.sizeMax = sizeMax;
      this.speedMin = speedMin;
      this.speedMax = speedMax;
      
      // 初始化雪花状态
      this.reset(width, height);
    }
  
    /**
     * 重置雪花状态（核心逻辑）
     * @param {number} width - 当前画布宽度
     * @param {number} height - 当前画布高度
     */
    reset(width, height) {
      // X坐标随机分布，Y坐标从顶部外开始
      this.x = Math.random() * width;
      this.y = -10; 
      
      // 在配置范围内生成随机尺寸（修正点：正确计算范围）
      this.size = Math.random() * (this.sizeMax - this.sizeMin) + this.sizeMin;
      
      // 在配置范围内生成随机速度
      this.speed = Math.random() * (this.speedMax - this.speedMin) + this.speedMin;
      
      // 相位偏移量（用于横向飘动计算）
      this.step = Math.random() * 100;
    }
  
    /**
     * 更新雪花位置（运动逻辑）
     * @param {number} width - 当前画布宽度
     * @param {number} height - 当前画布高度
     */
    update(width, height) {
      // 垂直方向匀速下落
      this.y += this.speed;
      
      // 水平方向余弦波动（产生自然飘动效果）
      this.x += Math.cos(this.step += 0.05) * 0.5;
      
      // 超出画布底部时重置
      if (this.y > height) this.reset(width, height);
    }
  
    /**
     * 渲染雪花到画布（含防御性编程）
     * @param {CanvasRenderingContext2D} ctx - 2D渲染上下文
     */
    render(ctx) {
      // 数值校验函数（关键修改点：防止NaN/Infinity）
      const validate = (val, fallback = 0) => 
        Number.isFinite(val) ? val : fallback;
  
      // 获取经过校验的坐标和尺寸
      const x = validate(this.x);
      const y = validate(this.y);
      const size = validate(this.size, 2); // 默认尺寸为2
  
      // 创建径向渐变（中心白->边缘透明）
      const gradient = ctx.createRadialGradient(
        x, y, 0,    // 内圆：中心点，半径0
        x, y, size  // 外圆：同中心，半径=雪花尺寸
      );
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.9)"); // 中心高亮
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");   // 边缘透明
  
      // 绘制圆形路径
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }
  
  // 组件属性定义（可配置参数）
  const props = defineProps({
    maxFlakes: { 
      type: Number, 
      default: 80,     // 默认150片雪花
      validator: (v) => v > 0 // 验证器：必须为正数
    },    
    sizeRange: { 
      type: Array, 
      default: () => [2, 8], // 尺寸范围默认2-8px
      validator: (arr) => arr.length === 2 && arr[0] <= arr[1]
    },
    speedRange: { 
      type: Array, 
      default: () => [1, 3], // 速度范围默认1-3px/帧
      validator: (arr) => arr.length === 2 && arr[0] <= arr[1]
    }
  });
  
  const canvas = ref(null); // 画布DOM引用
  let animationFrame;       // 动画帧ID（用于取消动画）
  
  /**
   * 初始化下雪效果
   */
  function initSnow() {
    const ctx = canvas.value.getContext("2d");
    
    // 设置画布尺寸为文档实际尺寸
    canvas.value.width = document.body.scrollWidth;
    canvas.value.height = document.body.scrollHeight;
  
    // 创建雪花实例数组（关键修改点：正确传递参数）
    const flakes = Array.from({ length: props.maxFlakes }, () => 
      new SnowFlake(
        canvas.value.width,
        canvas.value.height,
        props.sizeRange[0],  // 尺寸最小值
        props.sizeRange[1],  // 尺寸最大值
        props.speedRange[0], // 速度最小值
        props.speedRange[1]  // 速度最大值
      )
    );
  
    /**
     * 动画循环函数
     */
    function animate() {
      // 清空画布（使用透明清除）
      ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
      
      // 更新并渲染每个雪花
      flakes.forEach(flake => {
        flake.update(canvas.value.width, canvas.value.height);
        flake.render(ctx);
      });
  
      // 请求下一帧动画（保持60FPS）
      animationFrame = requestAnimationFrame(animate);
    }
  
    animate(); // 启动动画循环
  }
  
  // 生命周期管理
  onMounted(initSnow); // 挂载时初始化
  onBeforeUnmount(() => {
    // 组件卸载时取消动画（防止内存泄漏）
    cancelAnimationFrame(animationFrame); 
  });
  </script>
  
  <style scoped>
  /* 画布定位样式 */
  .snow-canvas {
    position: fixed;   /* 固定定位：覆盖整个视口 */
    top: 0;
    left: 0;
    pointer-events: none; /* 禁用指针事件：不阻挡交互 */
  }
  </style>