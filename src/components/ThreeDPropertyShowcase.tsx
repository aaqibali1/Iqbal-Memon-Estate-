import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ChevronDown, ChevronUp, Compass, Layers, Sun } from 'lucide-react';

type LightingMode = 'daylight' | 'golden' | 'twilight';
type CameraPreset = 'facade' | 'courtyard' | 'aerial' | 'poolside';

interface CameraPose {
  pos: [number, number, number];
  target: [number, number, number];
}

const CAMERA_POSES: Record<CameraPreset, CameraPose> = {
  facade: { pos: [17, 8.5, 18.5], target: [0, 2.8, 0] },
  courtyard: { pos: [-14, 5.2, 13.5], target: [-1.5, 2.2, 1.5] },
  aerial: { pos: [19, 20, 19], target: [0, 1.5, 0] },
  poolside: { pos: [12.5, 3.6, 12.2], target: [1.5, 2.5, -1] },
};

const LIGHTING_PRESETS: Record<
  LightingMode,
  {
    label: string;
    skyHex: number;
    fogHex: number;
    keyHex: number;
    keyIntensity: number;
    keyPos: [number, number, number];
    hemiSky: number;
    hemiGround: number;
    hemiIntensity: number;
    interiorGlow: number;
    exposure: number;
  }
> = {
  daylight: {
    label: 'Daylight',
    skyHex: 0xdce8f4,
    fogHex: 0xdce8f4,
    keyHex: 0xfff4e0,
    keyIntensity: 2.3,
    keyPos: [22, 26, 16],
    hemiSky: 0x9ec5e8,
    hemiGround: 0x8a7d6c,
    hemiIntensity: 0.95,
    interiorGlow: 0.35,
    exposure: 1.08,
  },
  golden: {
    label: 'Golden Hour',
    skyHex: 0x1e2c44,
    fogHex: 0x25324a,
    keyHex: 0xffb974,
    keyIntensity: 2.5,
    keyPos: [26, 11, 14],
    hemiSky: 0x6b8ab8,
    hemiGround: 0x4b3c2d,
    hemiIntensity: 0.72,
    interiorGlow: 1.75,
    exposure: 1.12,
  },
  twilight: {
    label: 'Twilight',
    skyHex: 0x0f172a,
    fogHex: 0x0f172a,
    keyHex: 0x92b4e8,
    keyIntensity: 0.95,
    keyPos: [-16, 18, 12],
    hemiSky: 0x2f4873,
    hemiGround: 0x1b1f29,
    hemiIntensity: 0.55,
    interiorGlow: 2.5,
    exposure: 1.15,
  },
};

// Scratch vectors allocated once outside render loop (zero GC in rAF)
const _camGoalPos = new THREE.Vector3();
const _camGoalTarget = new THREE.Vector3();

function createTravertineTexture(anisotropy: number): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const size = 256;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;
  ctx.fillStyle = '#e7dfd1';
  ctx.fillRect(0, 0, size, size);

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  // Travertine stone course veins & subtle ashlar joints
  for (let i = 0; i < 180; i++) {
    const y = (i * 19) % size;
    const alpha = 0.04 + (i % 5) * 0.015;
    ctx.fillStyle = i % 2 === 0 ? `rgba(176,158,132,${alpha})` : `rgba(255,250,242,${alpha})`;
    ctx.fillRect(0, y, size, 2 + (i % 4));
    bCtx.fillStyle = i % 2 === 0 ? 'rgba(95,95,95,0.22)' : 'rgba(150,150,150,0.18)';
    bCtx.fillRect(0, y, size, 2);
  }
  ctx.strokeStyle = 'rgba(130,118,102,0.24)';
  ctx.lineWidth = 1.5;
  bCtx.strokeStyle = 'rgba(40,40,40,0.45)';
  bCtx.lineWidth = 2;
  for (let row = 0; row < 4; row++) {
    const y = row * 64;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
    bCtx.beginPath();
    bCtx.moveTo(0, y);
    bCtx.lineTo(size, y);
    bCtx.stroke();
    const offset = row % 2 === 0 ? 0 : 64;
    for (let col = 0; col < 2; col++) {
      const x = (col * 128 + offset) % size;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 64);
      ctx.stroke();
      bCtx.beginPath();
      bCtx.moveTo(x, y);
      bCtx.lineTo(x, y + 64);
      bCtx.stroke();
    }
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(3, 2);
  map.anisotropy = anisotropy;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(3, 2);
  bumpMap.anisotropy = anisotropy;

  return { map, bumpMap };
}

function createTeakTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#7e5232';
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 64; i++) {
    ctx.fillStyle = i % 3 === 0 ? 'rgba(56,34,18,0.28)' : 'rgba(166,116,74,0.18)';
    ctx.fillRect(0, i * 2, 128, 1.5);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = anisotropy;
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 22, 128, 128, 126);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.55)');
  grad.addColorStop(0.65, 'rgba(15, 23, 42, 0.24)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildCompositePalmTree(
  trunkMat: THREE.Material,
  frondMat: THREE.Material,
  height = 5.4,
): THREE.Group {
  const palm = new THREE.Group();
  // Tapered multi-segment trunk pivoted flush at y = 0
  const segments = 5;
  const segH = height / segments;
  for (let i = 0; i < segments; i++) {
    const rBot = 0.24 - i * 0.025;
    const rTop = 0.215 - i * 0.025;
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, segH + 0.04, 8), trunkMat);
    seg.position.set(Math.sin(i * 0.25) * 0.14, segH * i + segH * 0.5, 0);
    seg.rotation.z = -0.05;
    seg.castShadow = true;
    palm.add(seg);
  }
  // Crown base + 7 arched sculptural fronds
  const crownY = height - 0.1;
  const crownX = Math.sin((segments - 1) * 0.25) * 0.14;
  const frondGeo = new THREE.ConeGeometry(0.42, 2.6, 5);
  frondGeo.scale(1, 1, 0.16);
  for (let f = 0; f < 7; f++) {
    const angle = (f / 7) * Math.PI * 2;
    const pivot = new THREE.Group();
    pivot.position.set(crownX, crownY, 0);
    pivot.rotation.y = angle;
    const frond = new THREE.Mesh(frondGeo, frondMat);
    frond.position.set(1.15, 0.15, 0);
    frond.rotation.z = -Math.PI * 0.38;
    frond.castShadow = true;
    pivot.add(frond);
    palm.add(pivot);
  }
  return palm;
}

export function ThreeDPropertyShowcase() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [lighting, setLighting] = useState<LightingMode>('golden');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('facade');
  const [explodeLevel, setExplodeLevel] = useState<number>(0);
  const [dockOpen, setDockOpen] = useState<boolean>(true);
  const [webglUnavailable, setWebglUnavailable] = useState<boolean>(false);

  // Refs bridging React controls to the single-mount Three.js scene without re-creating renderer
  const sceneControlRef = useRef<{
    setLightingMode: (m: LightingMode) => void;
    setCameraPreset: (p: CameraPreset) => void;
    setExplode: (v: number) => void;
  } | null>(null);

  useEffect(() => {
    sceneControlRef.current?.setLightingMode(lighting);
  }, [lighting]);

  useEffect(() => {
    sceneControlRef.current?.setCameraPreset(cameraPreset);
  }, [cameraPreset]);

  useEffect(() => {
    sceneControlRef.current?.setExplode(explodeLevel);
  }, [explodeLevel]);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // Detect software WebGL (SwiftShader / llvmpipe / headless) from GPU renderer string
    const probeCanvas = document.createElement('canvas');
    const probeGl = probeCanvas.getContext('webgl2');
    if (!probeGl) {
      setWebglUnavailable(true);
      return;
    }
    const debugExt = probeGl.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = String(
      probeGl.getParameter(debugExt ? debugExt.UNMASKED_RENDERER_WEBGL : probeGl.RENDERER),
    );
    probeGl.getExtension('WEBGL_lose_context')?.loseContext();
    const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererStr);

    const width = container.clientWidth || 960;
    const height = container.clientHeight || 540;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = LIGHTING_PRESETS.golden.exposure;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(LIGHTING_PRESETS.golden.skyHex);
    scene.fog = new THREE.FogExp2(LIGHTING_PRESETS.golden.fogHex, 0.012);

    // Mandatory studio environment reflection on every device
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envRT = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.2, 220);
    camera.position.set(...CAMERA_POSES.facade.pos);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...CAMERA_POSES.facade.target);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.maxPolarAngle = Math.PI * 0.475;
    controls.minDistance = 9;
    controls.maxDistance = 42;
    controls.update();

    // Warm/Cool 3-Point Architectural Lighting Rig
    const hemiLight = new THREE.HemisphereLight(
      LIGHTING_PRESETS.golden.hemiSky,
      LIGHTING_PRESETS.golden.hemiGround,
      LIGHTING_PRESETS.golden.hemiIntensity,
    );
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(
      LIGHTING_PRESETS.golden.keyHex,
      LIGHTING_PRESETS.golden.keyIntensity,
    );
    keyLight.position.set(...LIGHTING_PRESETS.golden.keyPos);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 70;
    const d = 18;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x9ec5f8, 0.65);
    rimLight.position.set(-18, 12, -16);
    scene.add(rimLight);

    // Procedural PBR Textures & Materials (zero external URLs)
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const { map: travertineMap, bumpMap: travertineBump } = createTravertineTexture(maxAniso);
    const teakMap = createTeakTexture(maxAniso);
    const contactShadowTex = createContactShadowTexture();

    const travertineMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: travertineMap,
      bumpMap: travertineBump,
      bumpScale: 0.035,
      roughness: 0.78,
      metalness: 0.04,
    });
    const darkSlateMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.42,
      metalness: 0.28,
    });
    const champagneBronzeMat = new THREE.MeshPhysicalMaterial({
      color: 0xc5a059,
      roughness: 0.22,
      metalness: 0.88,
      clearcoat: 0.4,
    });
    const teakMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: teakMap,
      roughness: 0.64,
      metalness: 0.06,
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xaad2ee,
      roughness: 0.08,
      metalness: 0.15,
      transparent: true,
      opacity: isSoftwareGl ? 0.36 : 0.42,
      depthWrite: false,
      clearcoat: 1.0,
    });
    const interiorGlowMat = new THREE.MeshStandardMaterial({
      color: 0xfff0d4,
      emissive: 0xffc670,
      emissiveIntensity: LIGHTING_PRESETS.golden.interiorGlow,
      roughness: 0.5,
    });
    const poolWaterMat = new THREE.MeshPhysicalMaterial({
      color: 0x158da8,
      roughness: 0.12,
      metalness: 0.1,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.88,
    });
    const lawnMat = new THREE.MeshStandardMaterial({
      color: 0x355e3b,
      roughness: 0.92,
      metalness: 0.0,
    });
    const groundContextMat = new THREE.MeshStandardMaterial({
      color: 0x243044,
      roughness: 0.95,
      metalness: 0.0,
    });
    const pavementMat = new THREE.MeshStandardMaterial({
      color: 0x9aa4b2,
      roughness: 0.85,
      metalness: 0.05,
    });
    const palmTrunkMat = new THREE.MeshStandardMaterial({ color: 0x6b5344, roughness: 0.88 });
    const palmFrondMat = new THREE.MeshStandardMaterial({
      color: 0x2f6b3c,
      roughness: 0.68,
      side: THREE.DoubleSide,
    });

    // Extended Horizon Ground (no floating indoor box!)
    const outerTerrain = new THREE.Mesh(new THREE.CircleGeometry(95, 48), groundContextMat);
    outerTerrain.rotation.x = -Math.PI / 2;
    outerTerrain.position.y = -0.06;
    outerTerrain.receiveShadow = true;
    scene.add(outerTerrain);

    // Soft radial contact shadow directly beneath the bungalow
    const contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 24),
      new THREE.MeshBasicMaterial({
        map: contactShadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.5,
      }),
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.015;
    scene.add(contactShadow);

    // =========================================================================
    // COMPOSITE 12+ PART PROCEDURAL 500 SQ. YDS DHA PHASE 8 DESIGNER BUNGALOW
    // =========================================================================
    const estateGroup = new THREE.Group();
    scene.add(estateGroup);

    // 1. 500 Sq. Yds Plot Site Slab (Paved perimeter + manicured coastal lawn)
    const plotBase = new THREE.Mesh(new THREE.BoxGeometry(16.5, 0.24, 15.0), pavementMat);
    plotBase.position.set(0, 0.12, 0);
    plotBase.receiveShadow = true;
    estateGroup.add(plotBase);

    const lawnBed = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.08, 13.6), lawnMat);
    lawnBed.position.set(0, 0.26, 0);
    lawnBed.receiveShadow = true;
    estateGroup.add(lawnBed);

    // 2. Stepped Travertine Foundation Plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.45, 9.6), travertineMat);
    plinth.position.set(-0.6, 0.48, -1.2);
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    estateGroup.add(plinth);

    // 3. Ground Floor Primary Architectural Volume + Recessed Entry Foyer
    const groundGroup = new THREE.Group();
    estateGroup.add(groundGroup);

    const gfMainWall = new THREE.Mesh(new THREE.BoxGeometry(10.4, 3.3, 8.2), travertineMat);
    gfMainWall.position.set(-0.8, 2.35, -1.4);
    gfMainWall.castShadow = true;
    gfMainWall.receiveShadow = true;
    groundGroup.add(gfMainWall);

    const gfSlateAccent = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.45, 3.2), darkSlateMat);
    gfSlateAccent.position.set(3.2, 2.42, -2.8);
    gfSlateAccent.castShadow = true;
    groundGroup.add(gfSlateAccent);

    // Glowing Interior Lounge Core visible through double-height glazing
    const interiorCore = new THREE.Mesh(new THREE.BoxGeometry(5.6, 6.2, 3.4), interiorGlowMat);
    interiorCore.position.set(-2.3, 3.85, 0.4);
    groundGroup.add(interiorCore);

    // 4. Double-Height Glazed Atrium Curtain Wall + Champagne Bronze Mullions
    const glassFront = new THREE.Mesh(new THREE.BoxGeometry(5.9, 6.45, 0.14), glassMat);
    glassFront.position.set(-2.3, 3.95, 2.75);
    glassFront.renderOrder = 2;
    groundGroup.add(glassFront);

    for (let m = -2; m <= 2; m++) {
      const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.11, 6.5, 0.2), champagneBronzeMat);
      mullion.position.set(-2.3 + m * 1.45, 3.95, 2.78);
      mullion.castShadow = true;
      groundGroup.add(mullion);
    }
    for (const hY of [0.75, 3.95, 7.15]) {
      const transom = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.14, 0.22), champagneBronzeMat);
      transom.position.set(-2.3, hY, 2.78);
      groundGroup.add(transom);
    }

    // 5. Recessed Luxury Entry Door + Sculptural Bronze Canopy
    const entryDoor = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.75, 0.16), teakMat);
    entryDoor.position.set(2.35, 2.1, 2.68);
    groundGroup.add(entryDoor);

    const entryCanopy = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.24, 2.1), darkSlateMat);
    entryCanopy.position.set(2.55, 3.65, 3.35);
    entryCanopy.castShadow = true;
    groundGroup.add(entryCanopy);

    // 6. Upper Floor Cantilevered Master Suite Group (Explodable!)
    const upperFloorGroup = new THREE.Group();
    estateGroup.add(upperFloorGroup);

    const ufCantilever = new THREE.Mesh(new THREE.BoxGeometry(11.8, 3.25, 8.8), travertineMat);
    ufCantilever.position.set(0.2, 5.65, -1.1);
    ufCantilever.castShadow = true;
    ufCantilever.receiveShadow = true;
    upperFloorGroup.add(ufCantilever);

    // Cantilevered Balcony Slab + Glass Balustrade + Bronze Handrail
    const balconySlab = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.34, 2.6), darkSlateMat);
    balconySlab.position.set(2.6, 4.15, 3.2);
    balconySlab.castShadow = true;
    upperFloorGroup.add(balconySlab);

    const balustrade = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.95, 0.08), glassMat);
    balustrade.position.set(2.6, 4.8, 4.42);
    balustrade.renderOrder = 3;
    upperFloorGroup.add(balustrade);

    const handrail = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.08, 0.12), champagneBronzeMat);
    handrail.position.set(2.6, 5.28, 4.42);
    upperFloorGroup.add(handrail);

    // Teak Vertical Architectural Louver Screen (10 slats)
    for (let s = 0; s < 10; s++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.1, 0.28), teakMat);
      slat.position.set(4.15 + s * 0.2, 5.65, 3.32);
      slat.castShadow = true;
      upperFloorGroup.add(slat);
    }

    // 7. Rooftop Architectural Overhang, Pergola & Parapet Group (Explodable!)
    const roofGroup = new THREE.Group();
    estateGroup.add(roofGroup);

    const mainRoofSlab = new THREE.Mesh(new THREE.BoxGeometry(13.2, 0.38, 10.2), darkSlateMat);
    mainRoofSlab.position.set(-0.2, 7.42, -0.7);
    mainRoofSlab.castShadow = true;
    mainRoofSlab.receiveShadow = true;
    roofGroup.add(mainRoofSlab);

    const roofTrim = new THREE.Mesh(new THREE.BoxGeometry(13.35, 0.12, 10.35), champagneBronzeMat);
    roofTrim.position.set(-0.2, 7.64, -0.7);
    roofGroup.add(roofTrim);

    // Rooftop Lounge Pergola Beams
    for (let b = 0; b < 6; b++) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.14, 0.16), teakMat);
      beam.position.set(-3.2, 8.35, -3.2 + b * 0.72);
      beam.castShadow = true;
      roofGroup.add(beam);
    }
    for (const px of [-5.2, -1.2]) {
      for (const pz of [-3.4, 0.6]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.95, 0.18), darkSlateMat);
        post.position.set(px, 7.95, pz);
        roofGroup.add(post);
      }
    }

    // 8. Sunken Turquoise Lap Pool + Travertine Coping + Stepping Stones
    const poolCoping = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.24, 3.8), travertineMat);
    poolCoping.position.set(-2.5, 0.34, 4.95);
    poolCoping.receiveShadow = true;
    estateGroup.add(poolCoping);

    const poolWater = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.14, 3.1), poolWaterMat);
    poolWater.position.set(-2.5, 0.42, 4.95);
    estateGroup.add(poolWater);

    for (let st = 0; st < 4; st++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.1, 0.72), travertineMat);
      step.position.set(2.55, 0.33, 3.6 + st * 0.96);
      step.receiveShadow = true;
      estateGroup.add(step);
    }

    // 9. Low Architectural Boundary Walls + Bronze Gate Pillars
    const lowWallBack = new THREE.Mesh(new THREE.BoxGeometry(16.4, 1.35, 0.26), travertineMat);
    lowWallBack.position.set(0, 0.9, -7.35);
    estateGroup.add(lowWallBack);

    const lowWallLeft = new THREE.Mesh(new THREE.BoxGeometry(0.26, 1.35, 14.8), travertineMat);
    lowWallLeft.position.set(-8.1, 0.9, 0);
    estateGroup.add(lowWallLeft);

    for (const gx of [1.1, 4.4]) {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.85, 0.55), darkSlateMat);
      pillar.position.set(gx, 1.12, 7.25);
      pillar.castShadow = true;
      estateGroup.add(pillar);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.1, 0.62), champagneBronzeMat);
      cap.position.set(gx, 2.08, 7.25);
      estateGroup.add(cap);
    }

    // 10. Composite Multi-Part Coastal Palm Trees (pivoted flush on lawn)
    const palmPositions: Array<[number, number, number, number]> = [
      [-6.8, 0.3, 5.4, 5.8],
      [-6.9, 0.3, -4.6, 4.9],
      [6.9, 0.3, -5.2, 5.3],
      [6.8, 0.3, 5.2, 4.5],
    ];
    for (const [px, py, pz, ph] of palmPositions) {
      const palm = buildCompositePalmTree(palmTrunkMat, palmFrondMat, ph);
      palm.position.set(px, py, pz);
      palm.rotation.y = px * 0.7;
      estateGroup.add(palm);
    }

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // =========================================================================
    // COALESCED ON-DEMAND RENDERING + SOFTWARE-WEBGL FENCE PACING + DAMPING
    // =========================================================================
    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let disposed = false;

    let cameraTransitionActive = false;
    let targetExplode = 0;
    let currentExplode = 0;
    let lastTimestamp = performance.now();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function requestRender() {
      if (disposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame((now) => {
        if (disposed) return;
        const dt = Math.min((now - lastTimestamp) / 1000, 0.1);
        lastTimestamp = now;
        renderDirty = false;

        let needsMoreFrames = false;

        // Smooth camera preset damping (cancelled automatically when user drags)
        if (cameraTransitionActive) {
          if (isSoftwareGl) {
            camera.position.copy(_camGoalPos);
            controls.target.copy(_camGoalTarget);
            cameraTransitionActive = false;
          } else {
            const alpha = 1 - Math.exp(-6.5 * dt);
            camera.position.lerp(_camGoalPos, alpha);
            controls.target.lerp(_camGoalTarget, alpha);
            if (
              camera.position.distanceToSquared(_camGoalPos) < 0.005 &&
              controls.target.distanceToSquared(_camGoalTarget) < 0.005
            ) {
              camera.position.copy(_camGoalPos);
              controls.target.copy(_camGoalTarget);
              cameraTransitionActive = false;
            } else {
              needsMoreFrames = true;
            }
          }
        }

        // Smooth exploded-view separation damping
        if (Math.abs(currentExplode - targetExplode) > 0.002) {
          currentExplode = isSoftwareGl
            ? targetExplode
            : THREE.MathUtils.damp(currentExplode, targetExplode, 7, dt);
          upperFloorGroup.position.y = currentExplode * 2.3;
          roofGroup.position.y = currentExplode * 4.4;
          if (!isSoftwareGl && Math.abs(currentExplode - targetExplode) > 0.002) {
            needsMoreFrames = true;
          }
        }

        controls.update();
        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (renderDirty || needsMoreFrames) {
            requestRender();
          }
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    controls.addEventListener('start', () => {
      cameraTransitionActive = false;
    });
    controls.addEventListener('change', requestRender);

    // Wire imperative bridge for React controls
    sceneControlRef.current = {
      setLightingMode: (mode: LightingMode) => {
        const cfg = LIGHTING_PRESETS[mode];
        scene.background = new THREE.Color(cfg.skyHex);
        scene.fog = new THREE.FogExp2(cfg.fogHex, 0.012);
        keyLight.color.setHex(cfg.keyHex);
        keyLight.intensity = cfg.keyIntensity;
        keyLight.position.set(...cfg.keyPos);
        hemiLight.color.setHex(cfg.hemiSky);
        hemiLight.groundColor.setHex(cfg.hemiGround);
        hemiLight.intensity = cfg.hemiIntensity;
        interiorGlowMat.emissiveIntensity = cfg.interiorGlow;
        renderer.toneMappingExposure = cfg.exposure;
        requestRender();
      },
      setCameraPreset: (preset: CameraPreset) => {
        const pose = CAMERA_POSES[preset];
        _camGoalPos.set(...pose.pos);
        _camGoalTarget.set(...pose.target);
        cameraTransitionActive = true;
        requestRender();
      },
      setExplode: (val: number) => {
        targetExplode = val;
        requestRender();
      },
    };

    const handleResize = () => {
      if (!container || disposed) return;
      const w = container.clientWidth || 960;
      const h = container.clientHeight || 540;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };
    window.addEventListener('resize', handleResize);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglUnavailable(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

    // Draw initial frame
    requestRender();

    return () => {
      disposed = true;
      sceneControlRef.current = null;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      controls.dispose();
      envRT.dispose();
      travertineMap.dispose();
      travertineBump.dispose();
      teakMap.dispose();
      contactShadowTex.dispose();
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <section id="architectural-3d" className="py-16 lg:py-24 bg-[#0F172A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6">
          <div>
            <p className="text-sm font-medium text-[#E2C68B]">
              Interactive 3D Architectural Preview
            </p>
            <h2 className="mt-1 font-display text-3xl sm:text-4xl font-semibold text-white text-balance">
              500 Sq. Yds DHA Phase 8 Concept Bungalow
            </h2>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl">
              Drag to orbit 360&deg;, scroll to zoom, switch coastal lighting from daylight to
              twilight, or slide the architectural cutaway to inspect floor volumes.
            </p>
          </div>
          <p className="text-xs text-slate-400 whitespace-nowrap">
            Drag to Rotate &middot; Scroll to Zoom
          </p>
        </div>

        {/* Full-bleed 3D Viewport Container with Collapsible Bottom Dock (NO backdrop-filter over WebGL!) */}
        <div className="relative w-full h-[500px] sm:h-[580px] rounded-2xl overflow-hidden border border-white/15 bg-[#0B1120]">
          {webglUnavailable ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
              <p className="font-display text-2xl font-semibold text-white">
                Interactive 3D Preview Unavailable
              </p>
              <p className="mt-2 text-sm text-slate-300 max-w-md">
                WebGL is currently disabled in this browser. View high-resolution photographs of our
                500 Sq. Yds DHA Phase 8 bungalows in the listings section above.
              </p>
            </div>
          ) : (
            <div
              ref={canvasMountRef}
              data-testid="threejs-villa-canvas"
              aria-label="Interactive 3D model of a 500 Sq. Yds DHA Phase 8 designer bungalow"
              className="w-full h-full cursor-grab active:cursor-grabbing"
            />
          )}

          {/* Minimal Top-Left Spec Label (Solid rgba, no backdrop-filter) */}
          <div className="pointer-events-none absolute top-4 left-4 bg-[#0F172A]/90 border border-white/15 rounded-lg px-3.5 py-2">
            <p className="text-xs font-semibold text-[#E2C68B]">
              Phase 8 Zone A &middot; 500 Sq. Yds (4,500 Sq. Ft)
            </p>
            <p className="text-[11px] text-slate-300">
              Double-Height Atrium &middot; Lap Pool &middot; Cantilevered Master Suite
            </p>
          </div>

          {/* Unified Collapsible Bottom Control Dock (Solid rgba, <= 15% footprint) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[min(900px,94%)] flex flex-col items-center z-10">
            <button
              type="button"
              onClick={() => setDockOpen((prev) => !prev)}
              aria-expanded={dockOpen}
              className="mb-1.5 inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold text-slate-200 bg-[#0F172A]/95 hover:bg-[#1E293B] border border-white/15 rounded-md transition-colors cursor-pointer"
            >
              {dockOpen ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Hide Controls</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Show 3D Controls</span>
                </>
              )}
            </button>

            {dockOpen && (
              <div className="w-full bg-[#0F172A]/95 border border-white/15 rounded-xl px-4 py-3 shadow-2xl flex flex-wrap items-center justify-between gap-4">
                {/* Camera Presets */}
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#C5A059] shrink-0" aria-hidden="true" />
                  <div className="flex items-center gap-1">
                    {(['facade', 'courtyard', 'poolside', 'aerial'] as const).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setCameraPreset(preset)}
                        aria-pressed={cameraPreset === preset}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors whitespace-nowrap cursor-pointer ${
                          cameraPreset === preset
                            ? 'bg-[#C5A059] text-[#0F172A] font-semibold'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lighting Mode */}
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-[#C5A059] shrink-0" aria-hidden="true" />
                  <div className="flex items-center gap-1">
                    {(['daylight', 'golden', 'twilight'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setLighting(mode)}
                        aria-pressed={lighting === mode}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                          lighting === mode
                            ? 'bg-white text-[#0F172A] font-semibold'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {LIGHTING_PRESETS[mode].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Architectural Floor Cutaway Slider */}
                <div className="flex items-center gap-2.5 min-w-[175px]">
                  <Layers className="w-4 h-4 text-[#C5A059] shrink-0" aria-hidden="true" />
                  <label htmlFor="villa-explode" className="text-xs text-slate-300 whitespace-nowrap">
                    Floors
                  </label>
                  <input
                    id="villa-explode"
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={explodeLevel}
                    onChange={(e) => setExplodeLevel(Number(e.target.value))}
                    className="w-24 accent-[#C5A059] cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
