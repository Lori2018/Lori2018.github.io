// whimsical bunny world styling upgrade
import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const loader = new GLTFLoader();
let bunny;
loader.load('public/bunny2.glb', (gltf) => {
  bunny = gltf.scene;
  bunny.scale.set(0.3, 0.3, 0.3);
  scene.add(bunny);
  console.log('bunny:', bunny);
  bunny.traverse((child) => {
  if (child.isMesh) {
    child.position.y -= 1; 
  }
});
}, undefined, (error) => {
  console.error('Error loading bunny:', error);
});

// Lighting
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(5, 10, 5);
scene.add(sun);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

camera.position.set(0, 2, 6);
camera.lookAt(0, 1, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 1, 0);
controls.update();

// Background sky
const textureLoader = new THREE.TextureLoader();
textureLoader.load('public/sky.jpg', (texture) => {
  scene.background = texture;
});

// Grass ground
const grassTexture = textureLoader.load('public/grass.jpg');
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(50, 50);
const groundMaterial = new THREE.MeshStandardMaterial({ map: grassTexture });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.35;
scene.add(ground);

// Whimsical clouds
createCloud(-10, 5, -5);
createCloud(5, 6, -10);
createCloud(3, 4.5, -4);


// Cute arched doorways with signs
const doorwayA = createDoorway(5, -2.5);
const doorwayB = createDoorway(0, -2.5);
const doorwayC = createDoorway(-5, -2.5);
addSign(5, 'r/3DPlace');
addSign(0, 'Vote On Life');
addSign(-5, 'Coming Soon!');



let moveDirection = { x: 0, z: 0 };
let hopPhase = 0;
let redirected = false;

document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowUp': moveDirection.z = -1; break;
    case 'ArrowDown': moveDirection.z = 1; break;
    case 'ArrowLeft': moveDirection.x = -1; break;
    case 'ArrowRight': moveDirection.x = 1; break;
  }
});

document.addEventListener('keyup', (event) => {
  if (["ArrowUp", "ArrowDown"].includes(event.key)) moveDirection.z = 0;
  if (["ArrowLeft", "ArrowRight"].includes(event.key)) moveDirection.x = 0;
});

function animate() {
  const speed = 0.05;
  const hopHeight = 0.2;
  const hopSpeed = 0.2;

  controls.update();
  if (!bunny) return;

  if (moveDirection.x !== 0 || moveDirection.z !== 0) {
    hopPhase += hopSpeed;
    bunny.position.y = 0.25 + Math.abs(Math.sin(hopPhase)) * hopHeight;
    bunny.position.x += moveDirection.x * speed;
    bunny.position.z += moveDirection.z * speed;
    bunny.rotation.y = Math.atan2(moveDirection.x, moveDirection.z);
  } else {
    hopPhase = 0;
    bunny.position.y = 0.25;
  }

  if (!redirected) {
    const bunnyBox = new THREE.Box3().setFromObject(bunny);
    if (doorwayA.intersectsBox(bunnyBox)) {
      redirected = true;
      window.location.href = 'https://www.penn.place';
    }
    if (doorwayB.intersectsBox(bunnyBox)) {
      redirected = true;
      window.location.href = 'https://work.pennspark.org/spring24/pistachio/';
    }
  }

  renderer.render(scene, camera);
}

function createDoorway(x, z) {
  const material = new THREE.MeshStandardMaterial({ color: 0xf4b183 });

  // Left and right pillars
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.5, 0.2), material);
  left.position.set(x - 0.7, 0.8, z);

  const right = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.5, 0.2), material);
  right.position.set(x + 0.7, 0.8, z);

  // Create arch from semicircle made of segments
  const archGroup = new THREE.Group();
  const segments = 12;
  const radius = 0.7;
  for (let i = 0; i <= segments; i++) {
    const angle = (Math.PI * i) / segments;
    const segment = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 0.2),
      material
    );
    const archX = x + Math.cos(angle) * radius;
    const archY = 1.6 + Math.sin(angle) * radius;
    segment.position.set(archX, archY, z);
    archGroup.add(segment);
  }

  scene.add(left, right, archGroup);

  // Return bounding box for collision
  return new THREE.Box3().setFromCenterAndSize(
    new THREE.Vector3(x, 0.8, z),
    new THREE.Vector3(1.4, 1.6, 0.5)
  );
}

function createCloud(x, y, z) {
  const cloud = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  for (let i = 0; i < 3; i++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(Math.random() * 0.5 + 0.5, 16, 16), mat);
    puff.position.set(Math.random() * 1 - 0.5, Math.random(), Math.random() * 1 - 0.5);
    cloud.add(puff);
  }
  cloud.position.set(x, y, z);
  scene.add(cloud);
}

function addSign(x, label) {
  // Create canvas
  const canvas = document.createElement('canvas');
  // canvas.width = 512;
  // canvas.height = 256;
  const scale = 4; // Increase for sharper text (e.g. 2x, 4x)
  canvas.width = 256 * 3 * scale;
  canvas.height = 256 * scale;
  const ctx = canvas.getContext('2d');

  // Draw background
  ctx.fillStyle = '#ffffff'; // white background
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw text
  ctx.fillStyle = '#000000'; // black text
  ctx.font = '400px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, canvas.width / 2, canvas.height / 2);

  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  // Create sign mesh with textured material
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 0.4),
    new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
  );

  // Position and add to scene
  sign.position.set(x, 2.7, -2.5);
  scene.add(sign);
}
