import * as THREE from 'three';

/**
 * Reusable Traditional Materials & Procedural Textures
 * High visual fidelity without external bandwidth or paid assets.
 */

// Generate a procedural noise bump canvas for mango / snack roughness
function createNoiseTexture(color1 = '#ffffff', color2 = '#888888', size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color1;
  ctx.fillRect(0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const val = (Math.random() * 0.4 + 0.6) * 255;
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Generate sesame seed pattern
function createSesameTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#b35d1e'; // Ariselu jaggery golden base
  ctx.fillRect(0, 0, 256, 256);

  // Draw tiny white sesame seeds
  ctx.fillStyle = '#fff9e8';
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const angle = Math.random() * Math.PI;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(0, 0, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Generate wooden platform ring grain
function createWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Radial wood grain
  const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 256);
  grad.addColorStop(0, '#5a351d');
  grad.addColorStop(0.3, '#432512');
  grad.addColorStop(0.6, '#532f17');
  grad.addColorStop(0.85, '#391d0d');
  grad.addColorStop(1, '#2c1508');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle concentric wood rings
  ctx.strokeStyle = 'rgba(20, 8, 3, 0.25)';
  for (let r = 25; r < 256; r += 14 + Math.random() * 6) {
    ctx.lineWidth = 1.5 + Math.random() * 2;
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Generate jar label texture with authentic Telugu brand aesthetics
function createPickleLabelTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Parchment cream background with subtle gold border
  ctx.fillStyle = '#fef8ea';
  ctx.fillRect(0, 0, 512, 256);

  ctx.strokeStyle = '#c68417';
  ctx.lineWidth = 5;
  ctx.strokeRect(12, 12, 488, 232);

  ctx.strokeStyle = '#a83218';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, 476, 220);

  // Red header banner
  ctx.fillStyle = '#9b2813';
  ctx.fillRect(20, 20, 472, 56);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px serif';
  ctx.textAlign = 'center';
  ctx.fillText('BRAMARAMBIKA', 256, 46);
  ctx.font = '13px sans-serif';
  ctx.fillText('TRADITIONAL HOME FOODS', 256, 65);

  // Telugu title
  ctx.fillStyle = '#8b200b';
  ctx.font = 'bold 28px serif';
  ctx.fillText('ఆవకాయ పచ్చడి', 256, 122);

  // English title
  ctx.fillStyle = '#222222';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('ANDHRA AVAKAYA', 256, 154);

  // Trust badges
  ctx.fillStyle = '#2b5f36';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('100% Homemade • Cold-Pressed Oil • Diviseema', 256, 192);

  ctx.fillStyle = '#a83218';
  ctx.font = 'italic 12px serif';
  ctx.fillText('Generational Family Recipe', 256, 218);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Cached textures
let noiseTex, sesameTex, woodTex, labelTex;
export function getFoodTextures() {
  if (!noiseTex && typeof document !== 'undefined') {
    noiseTex = createNoiseTexture();
    sesameTex = createSesameTexture();
    woodTex = createWoodTexture();
    labelTex = createPickleLabelTexture();
  }
  return { noiseTex, sesameTex, woodTex, labelTex };
}

/**
 * Shared PBR material definitions
 */
export const Materials = {
  // Ultra-realistic clear glass jar
  glass: {
    color: '#ffffff',
    roughness: 0.05,
    metalness: 0.02,
    transmission: 0.92,
    thickness: 0.8,
    ior: 1.52,
    transparent: true,
    opacity: 0.95
  },

  // Deep spiced cold-pressed mustard oil with red chilli sheen
  pickleOil: {
    color: '#ba2904',
    roughness: 0.12,
    metalness: 0.08,
    transmission: 0.72,
    thickness: 1.2,
    ior: 1.47,
    transparent: true,
    opacity: 0.88
  },

  // Pickled cut raw mango chunk
  mangoChunk: {
    color: '#d46508',
    roughness: 0.55,
    metalness: 0.05
  },

  // Fresh green mango rind/slice
  mangoSkin: {
    color: '#5b8529',
    roughness: 0.4,
    metalness: 0.05
  },

  // Rich yellow interior mango flesh
  mangoFlesh: {
    color: '#f9a825',
    roughness: 0.5,
    metalness: 0.02
  },

  // Authentic Guntur dried red chilli
  redChilli: {
    color: '#8f1503',
    roughness: 0.32,
    metalness: 0.1
  },

  // Aromatic fresh glossy curry leaves
  curryLeaf: {
    color: '#1a5423',
    roughness: 0.35,
    metalness: 0.05
  },

  // Traditional golden brass metal (thali, lids, bowls)
  brass: {
    color: '#dca33c',
    roughness: 0.3,
    metalness: 0.88
  },

  // Traditional wooden cutting board/pedestal
  wood: {
    color: '#4e2f18',
    roughness: 0.65,
    metalness: 0.02
  },

  // Fried golden savoury snack crust (Chekkalu, Murukku)
  goldenSavoury: {
    color: '#d69232',
    roughness: 0.6,
    metalness: 0.02
  },

  // Bellam / Jaggery sweet glaze (Ariselu, Gavvalu)
  jaggerySweet: {
    color: '#a44e13',
    roughness: 0.35,
    metalness: 0.05
  },

  // Ghee roasted Urad dal laddu / Sunnundalu
  sunnundaluLaddu: {
    color: '#ba7f3b',
    roughness: 0.82,
    metalness: 0.01
  },

  // Ravva laddu semolina cream
  ravvaLaddu: {
    color: '#ebd6b3',
    roughness: 0.78,
    metalness: 0.01
  },

  // Mysore pak ghee honeycomb fudge
  mysorePak: {
    color: '#e5ab37',
    roughness: 0.55,
    metalness: 0.03
  },

  // Fresh banana leaf
  bananaLeaf: {
    color: '#347a28',
    roughness: 0.42,
    metalness: 0.04
  },

  // Fine textured Podi / spice powder
  spicePowder: {
    color: '#bf360c',
    roughness: 0.88,
    metalness: 0.0
  }
};
