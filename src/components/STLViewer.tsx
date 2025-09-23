// src/components/STLViewer.tsx
import React, {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {STLLoader} from 'three/examples/jsm/loaders/STLLoader.js';

type Props = {
  src: string;               // /models/xxx.stl
  color?: string;            // 模型颜色，默认随主题
  bg?: string;               // 画布背景色，默认随主题
  height?: number | string;  // 组件高度，默认 360
};

const STLViewer: React.FC<Props> = ({src, color, bg, height = 360}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // 容器 & 尺寸
    const container = mountRef.current;
    const size = () => ({ w: container.clientWidth || 600, h: (typeof height === 'number' ? height : container.clientHeight) || 360 });

    // 渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size().w, size().h);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 场景 & 主题色
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bg ?? (isDark ? '#0b1020' : '#f6f7fb'));

    // 相机
    const camera = new THREE.PerspectiveCamera(45, size().w / size().h, 0.01, 1000);
    camera.position.set(0.6, 0.6, 0.6);

    // 轨道控制
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = true;

    // 灯光
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9);
    hemi.position.set(0, 1, 0);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(1, 1, 1);
    scene.add(dir);

    // 地面参考（可注释）
    const grid = new THREE.GridHelper(10, 10, isDark ? 0x334155 : 0xcbd5e1, isDark ? 0x1f2937 : 0xe2e8f0);
    grid.material.transparent = true;
    (grid.material as THREE.Material).opacity = 0.35;
    scene.add(grid);

    // 载入 STL
    const loader = new STLLoader();
    let mesh: THREE.Mesh | null = null;
    loader.load(
      src,
      (geom) => {
        // 居中 & 缩放到合适大小
        geom.computeBoundingBox();
        geom.computeVertexNormals();
        const box = geom.boundingBox!;
        const center = new THREE.Vector3();
        box.getCenter(center);
        geom.translate(-center.x, -center.y, -center.z);

        const sizeVec = new THREE.Vector3();
        box.getSize(sizeVec);
        const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z);
        const targetSize = 0.6; // 目标包围盒对角线 ~ 0.6
        const scale = maxDim > 0 ? targetSize / maxDim : 1;

        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(color ?? (isDark ? '#a5b4fc' : '#4f46e5')),
          metalness: 0.1,
          roughness: 0.6,
        });
        mesh = new THREE.Mesh(geom, mat);
        mesh.scale.setScalar(scale);
        scene.add(mesh);

        // 相机对准 & 距离
        controls.target.set(0, 0, 0);
        const dist = Math.max(1.5, maxDim * 2.2);
        camera.position.set(dist, dist, dist);
        camera.lookAt(controls.target);
      },
      undefined,
      (err) => {
        console.error('STL load error:', err);
      }
    );

    // 自适应尺寸
    const onResize = () => {
      const {w, h} = size();
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    // 动画循环
    let raf = 0;
    const tick = () => {
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    // 清理
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      scene.traverse(obj => {
        if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose?.();
        if ((obj as THREE.Mesh).material) {
          const m = (obj as THREE.Mesh).material as THREE.Material | THREE.Material[];
          (Array.isArray(m) ? m : [m]).forEach(mm => mm.dispose?.());
        }
      });
      container.removeChild(renderer.domElement);
    };
  }, [src, color, bg, height]);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        border: '1px solid var(--ifm-color-emphasis-300)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    />
  );
};

export default STLViewer;
