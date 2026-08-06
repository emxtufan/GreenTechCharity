import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Language } from '../types';
import { POI_ITEMS } from '../data/siteData';

interface ThreeCanvasProps {
  lang: Language;
  activeUid: string;
  scroll: number;
  introStarted: boolean;
  onSelectPage: (uid: string) => void;
  onHoverPoi: (hover: string | null) => void;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  lang,
  activeUid,
  scroll,
  introStarted,
  onSelectPage,
  onHoverPoi,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Store mutable refs for animation loop
  const stateRef = useRef({
    scroll,
    introStarted,
    activeUid,
    lang,
    pointer: new THREE.Vector2(0, 0),
    pointerTarget: new THREE.Vector2(0, 0),
    pointerStart: new THREE.Vector2(0, 0),
    pointerDelta: new THREE.Vector2(0, 0),
    pointerOffset: new THREE.Vector2(0, 0),
    isDragging: false,
    hoverPoi: null as string | null,
    uElapsed: 0,
  });

  // Keep stateRef updated
  useEffect(() => {
    stateRef.current.scroll = scroll;
    stateRef.current.introStarted = introStarted;
    stateRef.current.activeUid = activeUid;
    stateRef.current.lang = lang;
  }, [scroll, introStarted, activeUid, lang]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let animationFrameId: number;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xefede0); // Warm sand background

    const aspect = container.clientWidth / container.clientHeight;
    const isLandscape = aspect > 1;

    const camera = new THREE.PerspectiveCamera(40, aspect, 1, 2000);
    const spherical = new THREE.Spherical(
      isLandscape ? 700 : 700,
      Math.PI * 0.25,
      -0.5
    );

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(-7, 30, 14.5);
    scene.add(dirLight);

    // 3. GreenCube Architecture Model (Procedural High-Craft 3D Model)
    const buildingGroup = new THREE.Group();

    // Palette
    const forestColor = new THREE.Color(0x1f3a27);
    const lemonColor = new THREE.Color(0xcff851);
    const sandColor = new THREE.Color(0xefede0);
    const woodColor = new THREE.Color(0x8ea27e);

    // Line material for architectural wireframe overlay
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.18,
    });

    // Main terrain / lake platform
    const terrainGeo = new THREE.BoxGeometry(45, 0.4, 45);
    const terrainMat = new THREE.MeshToonMaterial({ color: 0xefede0 });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.position.set(0, -0.2, 0);
    buildingGroup.add(terrainMesh);

    const terrainEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(terrainGeo, 20),
      lineMaterial
    );
    terrainMesh.add(terrainEdges);

    // Lake Water Plane
    const lakeGeo = new THREE.PlaneGeometry(50, 25);
    const lakeMat = new THREE.MeshBasicMaterial({
      color: 0xefede0,
      side: THREE.DoubleSide,
    });
    const lakeMesh = new THREE.Mesh(lakeGeo, lakeMat);
    lakeMesh.rotation.x = -Math.PI / 2;
    lakeMesh.position.set(12, 0.01, 15);
    buildingGroup.add(lakeMesh);

    // Main Architectural Cube
    const cubeMainGeo = new THREE.BoxGeometry(16, 18, 16);
    const cubeMainMat = new THREE.MeshToonMaterial({ color: 0xefede0 });
    const cubeMainMesh = new THREE.Mesh(cubeMainGeo, cubeMainMat);
    cubeMainMesh.position.set(0, 9, 0);
    buildingGroup.add(cubeMainMesh);

    const cubeEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(cubeMainGeo, 15),
      lineMaterial
    );
    cubeMainMesh.add(cubeEdges);

    // Terraces and modular blocks
    const terracePositions = [
      { pos: [3, 16, 3], scale: [11, 4, 11], color: 0xcff851 },
      { pos: [-4, 6, 4], scale: [9, 6, 9], color: 0x1f3a27 },
      { pos: [4, 4, -4], scale: [8, 8, 8], color: 0xefede0 },
      { pos: [-2, 12, -3], scale: [10, 5, 10], color: 0x8ea27e },
    ];

    terracePositions.forEach((item) => {
      const geo = new THREE.BoxGeometry(item.scale[0], item.scale[1], item.scale[2]);
      const mat = new THREE.MeshToonMaterial({ color: item.color });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(item.pos[0], item.pos[1], item.pos[2]);
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo, 15),
        lineMaterial
      );
      mesh.add(edges);
      buildingGroup.add(mesh);
    });

    // Glass window grids
    for (let floor = 1; floor <= 4; floor++) {
      for (let bay = -2; bay <= 2; bay++) {
        if (bay === 0) continue;
        const windowGeo = new THREE.PlaneGeometry(2.2, 2.8);
        const windowMat = new THREE.MeshBasicMaterial({ color: 0x404040, side: THREE.DoubleSide });
        
        // Front facade
        const winFront = new THREE.Mesh(windowGeo, windowMat);
        winFront.position.set(bay * 3, floor * 3.8 + 1, 8.05);
        buildingGroup.add(winFront);

        // Side facade
        const winSide = new THREE.Mesh(windowGeo, windowMat);
        winSide.rotation.y = Math.PI / 2;
        winSide.position.set(8.05, floor * 3.8 + 1, bay * 3);
        buildingGroup.add(winSide);
      }
    }

    // Timber louvers / green facade fins
    for (let i = -7; i <= 7; i += 1.2) {
      const louverGeo = new THREE.BoxGeometry(0.15, 16, 0.4);
      const louverMat = new THREE.MeshToonMaterial({ color: 0x1f3a27 });
      const louver = new THREE.Mesh(louverGeo, louverMat);
      louver.position.set(i, 9, 8.2);
      buildingGroup.add(louver);
    }

    // Surrounding Road
    const roadGeo = new THREE.BoxGeometry(50, 0.05, 6);
    const roadMat = new THREE.MeshToonMaterial({ color: 0xc8c5b8 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.position.set(0, 0.05, -16);
    buildingGroup.add(road);

    // Instanced Cars
    const carCount = 4;
    const carGeo = new THREE.BoxGeometry(2.2, 1.1, 1.2);
    const carMat = new THREE.MeshToonMaterial({ color: 0x1f3a27 });
    const instancedCars = new THREE.InstancedMesh(carGeo, carMat, carCount);
    const dummy = new THREE.Object3D();

    const carPositions = [
      { x: -18, y: 0.6, z: -16 },
      { x: -6, y: 0.6, z: -16 },
      { x: 8, y: 0.6, z: -16 },
      { x: 18, y: 0.6, z: -16 },
    ];

    carPositions.forEach((pos, idx) => {
      dummy.position.set(pos.x, pos.y, pos.z);
      dummy.updateMatrix();
      instancedCars.setMatrixAt(idx, dummy.matrix);
    });
    instancedCars.instanceMatrix.needsUpdate = true;
    buildingGroup.add(instancedCars);

    // Instanced Grass Terrain
    const grassCount = 1500;
    const grassGeo = new THREE.ConeGeometry(0.08, 0.8, 3);
    grassGeo.translate(0, 0.4, 0); // Origin at base
    const grassMat = new THREE.MeshBasicMaterial({ color: 0x4e7039 });
    const instancedGrass = new THREE.InstancedMesh(grassGeo, grassMat, grassCount);

    for (let i = 0; i < grassCount; i++) {
      let x = (Math.random() - 0.5) * 40;
      let z = (Math.random() - 0.5) * 40;
      // Skip building footprint
      if (Math.abs(x) < 9 && Math.abs(z) < 9) {
        x += x > 0 ? 10 : -10;
      }
      const scaleY = 0.5 + Math.random() * 0.8;
      const rotY = Math.random() * Math.PI * 2;

      dummy.position.set(x, 0.2, z);
      dummy.scale.set(1, scaleY, 1);
      dummy.rotation.set(0, rotY, 0);
      dummy.updateMatrix();
      instancedGrass.setMatrixAt(i, dummy.matrix);
    }
    instancedGrass.instanceMatrix.needsUpdate = true;
    buildingGroup.add(instancedGrass);

    // Sky Clouds
    const cloudGroup = new THREE.Group();
    const cloudGeo = new THREE.BoxGeometry(12, 2, 8);
    const cloudMat = new THREE.MeshToonMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
    });
    for (let i = 0; i < 6; i++) {
      const cloud = new THREE.Mesh(cloudGeo, cloudMat);
      cloud.position.set(
        (Math.random() - 0.5) * 80,
        22 + Math.random() * 8,
        (Math.random() - 0.5) * 60
      );
      cloudGroup.add(cloud);
    }
    scene.add(cloudGroup);

    scene.add(buildingGroup);

    // 4. 3D POI Badges (Points of Interest)
    const poiGroup = new THREE.Group();
    scene.add(poiGroup);

    const createPoiBadgeTexture = (text: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#efede0';
        ctx.beginPath();
        ctx.roundRect(4, 4, 248, 56, 16);
        ctx.fill();

        ctx.strokeStyle = '#1f3a27';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#1f3a27';
        ctx.font = '600 24px Garamond, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 128, 33);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const poiMeshes: { mesh: THREE.Mesh; href: string; uid: string }[] = [];
    const poiDataList = POI_ITEMS[lang] || POI_ITEMS.de;

    poiDataList.forEach((poi) => {
      const badgeGeo = new THREE.PlaneGeometry(3.6, 0.9);
      const texture = createPoiBadgeTexture(poi.title);
      const badgeMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(badgeGeo, badgeMat);
      mesh.position.set(poi.position[0], poi.position[1], poi.position[2]);
      mesh.userData = { href: poi.href };

      poiGroup.add(mesh);
      poiMeshes.push({ mesh, href: poi.href, uid: poi.href.replace(/^\/(de|en)\//, '').replace(/\/$/, '') });
    });

    // Raycaster for 3D interactions
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Pointer events on canvas
    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
      const y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

      stateRef.current.pointerTarget.set(x, y);

      if (stateRef.current.isDragging) {
        const dx = e.clientX - stateRef.current.pointerStart.x;
        const dy = e.clientY - stateRef.current.pointerStart.y;
        stateRef.current.pointerOffset.x =
          stateRef.current.pointerOffsetStart.x + dx * 0.002;
        stateRef.current.pointerOffset.y =
          stateRef.current.pointerOffsetStart.y + dy * 0.002;
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      stateRef.current.isDragging = true;
      stateRef.current.pointerStart.set(e.clientX, e.clientY);
      stateRef.current.pointerOffsetStart.copy(stateRef.current.pointerOffset);
    };

    const handlePointerUp = () => {
      stateRef.current.isDragging = false;
    };

    const handleClick = () => {
      if (stateRef.current.hoverPoi) {
        const targetPage = stateRef.current.hoverPoi
          .replace(/^\/(de|en)\//, '')
          .replace(/\/$/, '');
        onSelectPage(targetPage || 'index');
      }
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mouseup', handlePointerUp);
    canvas.addEventListener('click', handleClick);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const asp = w / h;
      camera.aspect = asp;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Clock
    const clock = new THREE.Clock();

    // Animation Loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      const { scroll, introStarted, pointerTarget, pointer, pointerOffset } =
        stateRef.current;

      // Smooth pointer lerp
      pointer.lerp(pointerTarget, 0.05);

      // Camera Spherical Lerp based on scroll
      const startRadius = isLandscape ? 700 : 700;
      const endRadius = isLandscape ? 45 : 75;

      const targetRadius = introStarted
        ? THREE.MathUtils.lerp(startRadius, endRadius, Math.min(scroll * 1.5 + 0.1, 1))
        : startRadius;

      const targetPhi = THREE.MathUtils.lerp(
        Math.PI * 0.25,
        Math.PI * 0.38,
        scroll
      ) + pointer.y * 0.15 + pointerOffset.y * 0.3;

      const targetTheta = THREE.MathUtils.lerp(
        -0.5,
        0.5,
        scroll
      ) - pointer.x * 0.25 - pointerOffset.x * 0.5;

      spherical.radius += (targetRadius - spherical.radius) * 0.05;
      spherical.phi += (targetPhi - spherical.phi) * 0.05;
      spherical.theta += (targetTheta - spherical.theta) * 0.05;

      spherical.makeSafe();
      camera.position.setFromSpherical(spherical);
      camera.lookAt(scene.position);

      // Scale building on intro
      if (introStarted) {
        if (stateRef.current.uElapsed < 1) {
          stateRef.current.uElapsed += delta * 0.8;
        }
        const scaleVal = THREE.MathUtils.clamp(stateRef.current.uElapsed, 0, 1);
        buildingGroup.scale.set(scaleVal, scaleVal, scaleVal);
      } else {
        buildingGroup.scale.set(0.001, 0.001, 0.001);
      }

      // Rotate clouds
      cloudGroup.rotation.y = elapsedTime * 0.02;

      // Animate Cars
      for (let i = 0; i < carCount; i++) {
        const xPos = ((elapsedTime * 8 + i * 12) % 48) - 24;
        dummy.position.set(xPos, 0.6, -16);
        dummy.updateMatrix();
        instancedCars.setMatrixAt(i, dummy.matrix);
      }
      instancedCars.instanceMatrix.needsUpdate = true;

      // Billboard POI Badges
      poiMeshes.forEach(({ mesh }) => {
        mesh.quaternion.copy(camera.quaternion);
      });

      // Raycasting for POIs
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(
        poiMeshes.map((m) => m.mesh)
      );

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const href = hit.userData.href;
        if (stateRef.current.hoverPoi !== href) {
          stateRef.current.hoverPoi = href;
          onHoverPoi(href);
        }
      } else {
        if (stateRef.current.hoverPoi !== null) {
          stateRef.current.hoverPoi = null;
          onHoverPoi(null);
        }
      }

      // Hover animation on POI badges
      poiMeshes.forEach(({ mesh, href }) => {
        const isHovered = stateRef.current.hoverPoi === href;
        const targetScale = isHovered ? 1.2 : 1.0;
        mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), 0.1);
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mouseup', handlePointerUp);
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [lang]);

  return (
    <div className="_8ff6a2" ref={containerRef}>
      <div className="_64c0f3">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
