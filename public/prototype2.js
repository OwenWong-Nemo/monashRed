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

// Handle dimensions
const handleWidth = 1.0;
const handleHeight = 1.0;
const handleDepth = 0.18;

const handleMaterial = new THREE.MeshStandardMaterial({
  color: 0x8b5e3c,
  roughness: 0.5,
  metalness: 0.3,
  transparent: true,
  opacity: 0.6, // try 0.5–0.7 for a see-through effect
});

// Create first handle as a rounded box
const handle1 = new THREE.Mesh(
  new RoundedBoxGeometry(handleWidth, handleHeight, handleDepth, 2, 0.05),
  handleMaterial
);
// Create second handle as a rounded box
const handle2 = new THREE.Mesh(
  new RoundedBoxGeometry(handleWidth, handleHeight, handleDepth, 2, 0.05),
  handleMaterial
);

// Position the handles under the front and back walls, centered horizontally
handle1.position.x = handle2.position.x = 0;
handle1.position.y = handle2.position.y = -height / 2 + handleHeight / 2 - 0.5; // shifted upward
handle1.position.z = depth / 2 + handleDepth / 2 + 0.05;   // front side
handle2.position.z = -depth / 2 - handleDepth / 2 - 0.05;  // back side

scene.add(handle1);
scene.add(handle2);

// Create a visual "hole" using a thin dark box for the front handle
const holeWidth = 0.7;
const holeHeight = 0.2;
const holeDepth = 0.18; // slightly larger than handleDepth

const holeMaterial = new THREE.MeshStandardMaterial({
  color: 0x222222, // dark color to simulate a hole
  roughness: 0.7,
  metalness: 0.1,
});

const hole1 = new THREE.Mesh(
  new THREE.BoxGeometry(holeWidth, holeHeight, holeDepth),
  holeMaterial
);
// Position the holes within the lower part of each handle
const holeYOffset = -0.25; // shift downward within the handle
hole1.position.x = handle1.position.x;
hole1.position.y = handle1.position.y + holeYOffset;
hole1.position.z = handle1.position.z;
scene.add(hole1);

// Create a visual "hole" using a thin dark box for the back handle
const hole2 = new THREE.Mesh(
  new THREE.BoxGeometry(holeWidth, holeHeight, holeDepth),
  holeMaterial
);
hole2.position.x = handle2.position.x;
hole2.position.y = handle2.position.y + holeYOffset;
hole2.position.z = handle2.position.z;
scene.add(hole2);

// Create two seat belt halves that meet at the buckle (no shift)
const halfBeltLength = 6.0 / 2 - 0.1; // slightly shorter to leave a gap for the buckle

const beltMaterial = new THREE.MeshStandardMaterial({
  color: 0x2c2c2c, // dark gray/black for seat belt
  roughness: 0.8,
  metalness: 0.1,
});

// Left half of the seat belt
const seatBeltLeft = new THREE.Mesh(
  new THREE.BoxGeometry(0.6, 0.02, halfBeltLength),
  beltMaterial
);
seatBeltLeft.position.x = 0; // centered
seatBeltLeft.position.y = hole1.position.y; // same height as holes
seatBeltLeft.position.z = 2; // center
scene.add(seatBeltLeft);

// Right half of the seat belt
const seatBeltRight = new THREE.Mesh(
  new THREE.BoxGeometry(0.6, 0.02, halfBeltLength),
  beltMaterial
);
seatBeltRight.position.x = 0; // centered
seatBeltRight.position.y = hole1.position.y; // same height as holes
seatBeltRight.position.z = -2; // center
scene.add(seatBeltRight);

// Buckle dimensions (bigger)
const buckleOuterWidth = 0.8;
const buckleOuterHeight = 0.1;
const buckleOuterDepth = 0.2;
const buckleInnerWidth = 0.14;
const buckleInnerHeight = 0.08;
const buckleInnerDepth = 0.08;

// Buckle materials
const buckleBlackMaterial = new THREE.MeshStandardMaterial({
  color: 0x000000,
  roughness: 0.3,
  metalness: 0.7,
});
const buckleRedMaterial = new THREE.MeshStandardMaterial({
  color: 0xff2222,
  roughness: 0.4,
  metalness: 0.5,
});

// Buckle for seatBeltLeft: hollow black rounded box with red insert
const buckleLeftOuter = new THREE.Mesh(
  new RoundedBoxGeometry(buckleOuterWidth, buckleOuterHeight, buckleOuterDepth, 2, 0.02),
  buckleBlackMaterial
);
const buckleLeftInner = new THREE.Mesh(
  new RoundedBoxGeometry(buckleInnerWidth, buckleInnerHeight, buckleInnerDepth, 2, 0.01),
  buckleRedMaterial
);
// Position the outer buckle at the OPPOSITE end of seatBeltLeft
buckleLeftOuter.position.x = seatBeltLeft.position.x;
buckleLeftOuter.position.y = seatBeltLeft.position.y;
buckleLeftOuter.position.z = seatBeltLeft.position.z - halfBeltLength / 2 - buckleOuterDepth / 2;
// Position the red insert in the center of the black buckle
buckleLeftInner.position.x = buckleLeftOuter.position.x;
buckleLeftInner.position.y = buckleLeftOuter.position.y;
buckleLeftInner.position.z = buckleLeftOuter.position.z;
scene.add(buckleLeftOuter);
scene.add(buckleLeftInner);

// Buckle for seatBeltRight: solid black rounded box
const buckleRight = new THREE.Mesh(
  new RoundedBoxGeometry(buckleOuterWidth, buckleOuterHeight, buckleOuterDepth, 2, 0.02),
  buckleBlackMaterial
);
// Position at the OPPOSITE end of seatBeltRight
buckleRight.position.x = seatBeltRight.position.x;
buckleRight.position.y = seatBeltRight.position.y;
buckleRight.position.z = seatBeltRight.position.z + halfBeltLength / 2 + buckleOuterDepth / 2;
scene.add(buckleRight);

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
