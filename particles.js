import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const CONFIG = {
    effect: "scatter",
    effectMode: 1,
    particleSize: 105,
    particleCount: 30000,
    uploadedImage: null,
    uploadedModel: null,
    shape: "pyramid",
    interactionMode: "manual",
    manualControlTarget: "camera"
};
let uploadedImage = CONFIG.uploadedImage;
let uploadedModel = CONFIG.uploadedModel;
let particleSize = CONFIG.particleSize;
const PARTICLE_COUNT = CONFIG.particleCount;
let sceneData = null;
let currentEffect = CONFIG.effect;
let currentShape = CONFIG.shape;
let interactionMode = CONFIG.interactionMode;
let manualControlTarget = CONFIG.manualControlTarget;
let effectIntensity = 1;
let targetEffectIntensity = 1;
let explosionTriggered = false;
let explosionTime = 0;
const cameraControlState = {
    target: null,
    yaw: 0,
    pitch: 0,
    distance: 45,
    minDistance: 20,
    maxDistance: 100,
    isLeftDragging: false,
    isRightDragging: false,
    previousX: 0,
    previousY: 0
};
const mouseState = { isDragging: false, previousX: 0, previousY: 0 };
const vertexShader = "uniform float uTime;uniform float uMorph;uniform float uPointSize;uniform int uEffectMode;uniform float uEffectIntensity;uniform float uExplosionTime;attribute vec3 targetPosition;attribute vec3 targetColor;attribute vec3 color;attribute vec3 randomOffset;varying vec3 vColor;varying float vDistance;vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}float snoise(vec2 v){const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0)) + i.x + vec3(0.0,i1.x,1.0));vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);m=m*m;m=m*m;vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.0*dot(m,g);}void main(){vColor=mix(color,targetColor,uMorph);vec3 pos=mix(position,targetPosition,uMorph);vec3 originalPos=pos;float effectMix=uEffectIntensity;if(uEffectMode==0){float noise=sin(uTime*1.5+position.x*0.3)*cos(uTime*1.5+position.y*0.3);pos+=normalize(pos)*noise*(0.2*(1.0-uMorph));pos.x+=sin(uTime*0.3+position.z)*0.1;pos.y+=cos(uTime*0.3+position.x)*0.1;}else if(uEffectMode==1){vec3 scatterDir=normalize(pos+randomOffset*0.5);float scatterDist=length(pos)*0.5+randomOffset.x*3.0;vec3 scattered=pos+scatterDir*scatterDist*effectMix*2.5;float turb=snoise(pos.xy*0.3+uTime*0.5);scattered+=vec3(turb,turb*0.5,turb*0.3)*effectMix*1.5;pos=mix(originalPos,scattered,effectMix);}else if(uEffectMode==2){float explodeProgress=min(uExplosionTime*2.0,1.0);float returnProgress=max(0.0,(uExplosionTime-0.5)*2.0);vec3 explodeDir=normalize(pos+randomOffset);float explodeDist=(5.0+randomOffset.x*8.0)*sin(explodeProgress*3.14159);vec3 exploded=originalPos+explodeDir*explodeDist*effectMix;float spin=explodeProgress*6.28318*(0.5+randomOffset.y);exploded.x+=cos(spin)*explodeDist*0.3;exploded.z+=sin(spin)*explodeDist*0.3;pos=mix(originalPos,exploded,effectMix*(1.0-returnProgress*0.7));}else if(uEffectMode==3){float angle=atan(pos.z,pos.x);float radius=length(pos.xz);float height=pos.y;float spiralSpeed=uTime*2.0+height*0.3;float newAngle=angle+spiralSpeed*effectMix;float vortexPull=(1.0-abs(height)/20.0)*effectMix;float newRadius=radius*(1.0-vortexPull*0.5)+sin(uTime*3.0+height)*effectMix;float lift=effectMix*5.0*(1.0-radius/20.0);pos.x=cos(newAngle)*newRadius;pos.z=sin(newAngle)*newRadius;pos.y=height+lift*sin(uTime+radius);}else if(uEffectMode==4){float pulsePhase=uTime*2.5;float pulseFactor=1.0+sin(pulsePhase)*0.4*effectMix;float waveFactor=sin(pulsePhase+length(pos)*0.3)*0.3*effectMix;vec3 pulsed=pos*pulseFactor;pulsed+=normalize(pos)*waveFactor*3.0;float colorPulse=sin(pulsePhase*0.5)*0.5+0.5;vColor=mix(vColor,vec3(1.0,0.4,0.8),colorPulse*effectMix*0.3);pos=pulsed;}else if(uEffectMode==5){float waveX=sin(pos.x*0.5+uTime*2.0)*effectMix*3.0;float waveZ=cos(pos.z*0.5+uTime*1.5)*effectMix*2.0;float waveY=sin(pos.x*0.3+pos.z*0.3+uTime*2.5)*effectMix*4.0;waveY+=sin(pos.x*0.8-uTime*1.8)*effectMix*1.5;waveY+=cos(pos.z*0.6+uTime*1.2)*effectMix*1.0;pos.x+=waveX*0.3;pos.y+=waveY;pos.z+=waveZ*0.3;}vec4 mvPosition=modelViewMatrix*vec4(pos,1.0);float dist=length(pos);vDistance=dist;float sizeMultiplier=1.0;if(uEffectMode==2&&effectMix>0.1)sizeMultiplier=1.0+sin(uExplosionTime*10.0)*0.3;if(uEffectMode==4)sizeMultiplier=1.0+sin(uTime*2.5)*0.2*effectMix;gl_PointSize=(uPointSize/-mvPosition.z)*(1.2+sin(uTime*3.0+dist*0.15)*0.5)*sizeMultiplier;gl_Position=projectionMatrix*mvPosition;}";
const fragmentShader = "uniform float uTime;varying vec3 vColor;varying float vDistance;void main(){float dist=distance(gl_PointCoord,vec2(0.5));if(dist>0.5)discard;float strength=pow(1.0-dist*2.0,1.6);vec3 finalColor=vColor*2.0;float alpha=strength*(0.8+sin(vDistance*0.3+uTime)*0.2);gl_FragColor=vec4(finalColor,alpha);}";

const textureDataCache = new Map();
function getTextureData(texture) {
  const image = texture.image;
  if (!image || !image.width || !image.height) return null;
  const cacheKey = image.src || image.id || texture.uuid;
  if (textureDataCache.has(cacheKey)) return textureDataCache.get(cacheKey);
  const canvas = document.createElement('canvas');
  canvas.width = image.width; canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(image, 0, 0);
  const data = ctx.getImageData(0, 0, image.width, image.height);
  textureDataCache.set(cacheKey, data);
  return data;
}

function updateCameraFromState(camera) {
    const cp = Math.cos(cameraControlState.pitch);
    const sp = Math.sin(cameraControlState.pitch);
    const cy = Math.cos(cameraControlState.yaw);
    const sy = Math.sin(cameraControlState.yaw);
    camera.position.set(
        cameraControlState.target.x + cameraControlState.distance * sy * cp,
        cameraControlState.target.y + cameraControlState.distance * sp,
        cameraControlState.target.z + cameraControlState.distance * cy * cp
    );
    camera.lookAt(cameraControlState.target);
}

function initParticleCanvas() {
    const container = document.querySelector("#slide-1 .slide-bg");
    if (!container) return;
    
    // Clear static background if any
    const width = window.innerWidth, height = window.innerHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    camera.position.z = 45;
    cameraControlState.target = new THREE.Vector3(0, 0, 0);
    updateCameraFromState(camera);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    
    // Style the canvas to ensure it fits the background
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);
    
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const targetColors = new Float32Array(PARTICLE_COUNT * 3);
    const randomOffsets = new Float32Array(PARTICLE_COUNT * 3);
    const greenColor = new THREE.Color(0x00ff66);
    const brightWhite = new THREE.Color(0xffffff);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const t = (Math.random() - 0.5) * 5.0;
        const angle = Math.random() * Math.PI * 2;
        const radiusBase = 0.4 + Math.pow(Math.abs(t), 2.4);
        const radius = radiusBase * (0.75 + Math.random() * 0.55);
        let x = radius * Math.cos(angle) * 2.9;
        let z = radius * Math.sin(angle) * 2.9;
        let y = t * 7.5;
        positions[i3] = x; positions[i3 + 1] = y; positions[i3 + 2] = z;
        targetPositions[i3] = x; targetPositions[i3 + 1] = y; targetPositions[i3 + 2] = z;
        randomOffsets[i3] = (Math.random() - 0.5) * 2;
        randomOffsets[i3 + 1] = (Math.random() - 0.5) * 2;
        randomOffsets[i3 + 2] = (Math.random() - 0.5) * 2;
        const color = Math.random() > 0.7 ? greenColor : brightWhite;
        colors[i3] = color.r; colors[i3 + 1] = color.g; colors[i3 + 2] = color.b;
        targetColors[i3] = color.r; targetColors[i3 + 1] = color.g; targetColors[i3 + 2] = color.b;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("targetPosition", new THREE.BufferAttribute(targetPositions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("targetColor", new THREE.BufferAttribute(targetColors, 3));
    geometry.setAttribute("randomOffset", new THREE.BufferAttribute(randomOffsets, 3));
    const material = new THREE.ShaderMaterial({
        vertexShader, fragmentShader, transparent: true,
        uniforms: { uTime: { value: 0 }, uMorph: { value: 0 }, uPointSize: { value: particleSize }, uEffectMode: { value: CONFIG.effectMode }, uEffectIntensity: { value: 1 }, uExplosionTime: { value: 0 } },
        depthWrite: false, blending: THREE.AdditiveBlending
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);
    sceneData = { scene, camera, renderer, points, geometry, material, originalPositions: positions.slice(), targetPositions, originalColors: colors.slice(), targetColors };
    
    if (uploadedModel) processModel(uploadedModel);
    else if (uploadedImage && uploadedImage !== '3d-model-placeholder') processImage(uploadedImage);
    else if (currentShape && currentShape !== "default") generateShape(currentShape);

    let time = 0, morphFactor = 0;
    const effectModes = { "default": 0, "scatter": 1, "explode": 2, "vortex": 3, "pulse": 4, "wave": 5 };
    function animate() {
        requestAnimationFrame(animate);
        
        // Performance optimization: Pause rendering if we scroll away from Slide 1
        if (window.currentSlide !== undefined && window.currentSlide !== 0) return;
        
        time += 0.008;
        if (!sceneData) return;
        const { renderer, scene, camera, points, material } = sceneData;
        if (interactionMode === "manual") {
            if (manualControlTarget === "camera") {
                updateCameraFromState(camera);
            }
        } else {
            let rotationSpeed = 0.0025;
            if (currentEffect === "vortex") rotationSpeed = 0.008 * (0.5 + effectIntensity);
            else if (currentEffect === "explode" && explosionTriggered) rotationSpeed = 0.001;
            points.rotation.y += rotationSpeed;
            points.rotation.z += 0.001;
            points.rotation.x = Math.sin(time * 0.15) * 0.12;
        }
        material.uniforms.uTime.value = time;
        const targetMorph = (uploadedImage || uploadedModel) ? 1.0 : 0.0;
        morphFactor += (targetMorph - morphFactor) * 0.05;
        material.uniforms.uMorph.value = morphFactor;
        effectIntensity += (targetEffectIntensity - effectIntensity) * 0.08;
        material.uniforms.uEffectIntensity.value = effectIntensity;
        material.uniforms.uEffectMode.value = effectModes[currentEffect] || 0;
        if (explosionTriggered) { explosionTime += 0.016; if (explosionTime > 2.0) explosionTime = 0; }
        material.uniforms.uExplosionTime.value = explosionTime;
        renderer.render(scene, camera);
    }
    animate();
    window.addEventListener("resize", function() {
        if (!sceneData) return;
        sceneData.camera.aspect = window.innerWidth / window.innerHeight;
        sceneData.camera.updateProjectionMatrix();
        sceneData.renderer.setSize(window.innerWidth, window.innerHeight);
    });
    renderer.domElement.addEventListener("mousedown", function(e) {
        if (interactionMode === "manual" && manualControlTarget === "camera") {
            if (e.button === 0) cameraControlState.isLeftDragging = true;
            else if (e.button === 2) cameraControlState.isRightDragging = true;
            cameraControlState.previousX = e.clientX;
            cameraControlState.previousY = e.clientY;
        }
    });
    window.addEventListener("mousemove", function(e) {
        if (!sceneData) return;
        
        // Map mouse movement to subtle shape rotation even automatically
        sceneData.points.rotation.y += e.movementX * 0.0005;
        sceneData.points.rotation.x += e.movementY * 0.0005;

        if (interactionMode === "manual" && manualControlTarget === "camera") {
            const deltaX = e.clientX - cameraControlState.previousX;
            const deltaY = e.clientY - cameraControlState.previousY;
            if (cameraControlState.isLeftDragging) {
                cameraControlState.yaw -= deltaX * 0.005;
                cameraControlState.pitch -= deltaY * 0.005;
            }
            cameraControlState.previousX = e.clientX;
            cameraControlState.previousY = e.clientY;
        }
    });
    window.addEventListener("mouseup", function() {
        mouseState.isDragging = false;
        cameraControlState.isLeftDragging = false;
        cameraControlState.isRightDragging = false;
    });
}

function generateShape(shapeName) {
    if (!sceneData) return;
    const { targetPositions, targetColors, geometry } = sceneData;
    const points = [];
    const shapeGreen = new THREE.Color(0x00ff66);
    const shapeWhite = new THREE.Color(0xffffff);
    switch (shapeName) {
        case "pyramid": const pyrHeight = 25; const pyrBase = 20; for (let i = 0; i < PARTICLE_COUNT; i++) { const onBase = Math.random() < 0.3; let x, y, z; if (onBase) { x = (Math.random() - 0.5) * pyrBase; z = (Math.random() - 0.5) * pyrBase; y = -pyrHeight / 2; } else { const t = Math.random(); const baseX = (Math.random() - 0.5) * pyrBase * (1 - t); const baseZ = (Math.random() - 0.5) * pyrBase * (1 - t); x = baseX; y = -pyrHeight / 2 + t * pyrHeight; z = baseZ; } const spread = 2.0; const color = Math.random() > 0.7 ? shapeGreen : shapeWhite; points.push({ pos: [x + (Math.random() - 0.5) * spread, y + (Math.random() - 0.5) * spread, z + (Math.random() - 0.5) * spread], col: [color.r, color.g, color.b] }); } break;
    }
    if (points.length > 0) {
        for (let i = 0; i < PARTICLE_COUNT; i++) { const i3 = i * 3; const point = points[i % points.length]; targetPositions[i3] = point.pos[0]; targetPositions[i3 + 1] = point.pos[1]; targetPositions[i3 + 2] = point.pos[2]; targetColors[i3] = point.col[0]; targetColors[i3 + 1] = point.col[1]; targetColors[i3 + 2] = point.col[2]; }
        geometry.attributes.targetPosition.needsUpdate = true;
        geometry.attributes.targetColor.needsUpdate = true;
        uploadedImage = "shape";
    }
}
initParticleCanvas();
