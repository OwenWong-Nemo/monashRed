import * as THREE from '/js/three.module.js';
import { OrbitControls } from '/js/OrbitControls.js';
import { RoundedBoxGeometry } from '/js/RoundedBoxGeometry.js'; 

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0x888888));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7.5);
scene.add(dirLight);

// Material
const wallMaterial = new THREE.MeshStandardMaterial({
  color: 0x87ceeb,
  transparent: true,
  opacity: 0.5,
  side: THREE.DoubleSide,
});

// Dimensions
const width = 6;
const height = 1.5;
const depth = 4;
const thickness = 0.1;
const radius = 0.05;
const segments = 2;

const walls = [];

// Bottom (rounded rectangle laying flat)
const bottom = new THREE.Mesh(
  new RoundedBoxGeometry(width, thickness, depth, segments, radius),
  wallMaterial
);
bottom.position.y = -height / 2;
walls.push(bottom);

// Left wall
const left = new THREE.Mesh(
  new RoundedBoxGeometry(thickness, height, depth, segments, radius),
  wallMaterial
);
left.position.x = -width / 2;
walls.push(left);

// Right wall
const right = new THREE.Mesh(
  new RoundedBoxGeometry(thickness, height, depth, segments, radius),
  wallMaterial
);
right.position.x = width / 2;
walls.push(right);

// Front wall
const front = new THREE.Mesh(
  new RoundedBoxGeometry(width, height, thickness, segments, radius),
  wallMaterial
);
front.position.z = depth / 2;
walls.push(front);

// Back wall
const back = new THREE.Mesh(
  new RoundedBoxGeometry(width, height, thickness, segments, radius),
  wallMaterial
);
back.position.z = -depth / 2;
walls.push(back);

// Add all walls to scene
walls.forEach(wall => scene.add(wall));

// Slit Material
const slitMaterial = new THREE.MeshStandardMaterial({
  color: 0x000000,
  transparent: true,
  opacity: 0.4,
  side: THREE.DoubleSide,
});

// Helper to create one vertical slit
function createVerticalSlit(width, height, depth) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    slitMaterial
  );
}

// Slits to mimic ventilation on LEFT and RIGHT walls
const verticalSlitCount = 8;
const verticalSlitWidth = 0.1;
const verticalSlitHeight = height - 0.4;
const slitDepth = thickness + 0.01;

// Calculate total spacing area
const usableZ = depth - 0.5; // leave a bit of margin on top/bottom
const startZ = -usableZ / 2;
const spacing = usableZ / (verticalSlitCount - 1);

// Add slits to left wall
for (let i = 0; i < verticalSlitCount; i++) {
  const slit = createVerticalSlit(verticalSlitWidth, verticalSlitHeight, slitDepth);
  slit.position.x = -width / 2 - 0.01; // just outside left wall
  slit.position.z = startZ + i * spacing;
  scene.add(slit);
}

// Add slits to right wall
for (let i = 0; i < verticalSlitCount; i++) {
  const slit = createVerticalSlit(verticalSlitWidth, verticalSlitHeight, slitDepth);
  slit.position.x = width / 2 + 0.01; // just outside right wall
  slit.position.z = startZ + i * spacing;
  scene.add(slit);
}

// Mattress dimensions (slightly smaller than interior)
const mattressWidth = width - thickness * 2;
const mattressHeight = 0.5; // thickness of mattress
const mattressDepth = depth - thickness * 2;
const mattressRadius = 0.03;

// Mattress material
const mattressMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.8,
  metalness: 0.1,
});

// Create dented mattress geometry
function createDentedMattress(width, height, depth, segments) {
  // Create a box geometry with more segments for smoother dent
  const geometry = new THREE.BoxGeometry(width, height, depth, segments, segments, segments);
  const vertices = geometry.attributes.position.array;
  
  // Create dent down the middle of the mattress (vertically)
  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const y = vertices[i + 1];
    const z = vertices[i + 2];
    
    // Only modify vertices on the top surface (positive Y)
    if (y > 0) {
      // Calculate distance from center line (Z = 0)
      const distanceFromCenter = Math.abs(z);
      
      // Create linear dent effect - deeper in the middle, gradually shallower towards edges
      const maxDentDepth = 0.2; // Depth of the dent
      const dentWidth = depth * 0.25; 
      
      if (distanceFromCenter < dentWidth) {
        // Create smooth dent using cosine function
        const dentFactor = Math.cos((distanceFromCenter / dentWidth) * Math.PI * 0.5);
        const dentDepth = maxDentDepth * (1 - dentFactor);
        vertices[i + 1] = y - dentDepth; // Reduce Y coordinate to create dent
      }
    }
  }
  
  geometry.attributes.position.needsUpdate = true;
  geometry.computeVertexNormals();
  
  return geometry;
}

// Create mattress with dent
const mattress = new THREE.Mesh(
  createDentedMattress(mattressWidth, mattressHeight, mattressDepth, 32),
  mattressMaterial
);

// Position mattress just above the bottom
mattress.position.y = -height / 2 + mattressHeight / 2 + thickness / 2;
scene.add(mattress);

// Render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
