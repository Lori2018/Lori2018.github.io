import * as THREE from 'three';
// import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// // Use a sphere as a placeholder for the bunny
const geometry = new THREE.SphereGeometry(0.5, 32, 32);
const material = new THREE.MeshStandardMaterial({ color: 0xffccaa });
const bunny = new THREE.Mesh(geometry, material);
scene.add(bunny);
// const loader = new GLTFLoader();
// let bunny;

// loader.load('/bunny1.glb', (gltf) => {
//   bunny = gltf.scene;
//   bunny.scale.set(0.5, 0.5, 0.5); // adjust scale as needed
//   scene.add(bunny);
// }, undefined, (error) => {
//   console.error('Error loading bunny:', error);
// });


// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

camera.position.set(0, 2, 5);
camera.lookAt(0, 0, 0);

// Track movement direction
let moveDirection = { x: 0, z: 0 };
let hopPhase = 0;

document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowUp':
      moveDirection.z = -1;
      break;
    case 'ArrowDown':
      moveDirection.z = 1;
      break;
    case 'ArrowLeft':
      moveDirection.x = -1;
      break;
    case 'ArrowRight':
      moveDirection.x = 1;
      break;
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'ArrowUp':
    case 'ArrowDown':
      moveDirection.z = 0;
      break;
    case 'ArrowLeft':
    case 'ArrowRight':
      moveDirection.x = 0;
      break;
  }
});

function animate() {
  const speed = 0.05;
  const hopHeight = 0.2;
  const hopSpeed = 0.2;

//   if (!bunny) return; // Ensure bunny is loaded before animating

  if (moveDirection.x !== 0 || moveDirection.z !== 0) {
    // Hop motion
    hopPhase += hopSpeed;
    bunny.position.y = Math.abs(Math.sin(hopPhase)) * hopHeight;

    // Move in direction
    bunny.position.x += moveDirection.x * speed;
    bunny.position.z += moveDirection.z * speed;

    // Rotate to face direction
    const angle = Math.atan2(moveDirection.x, moveDirection.z);
    bunny.rotation.y = angle;
  } else {
    hopPhase = 0;
    bunny.position.y = 0;
  }

  renderer.render(scene, camera);
}
