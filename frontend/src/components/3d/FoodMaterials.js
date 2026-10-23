import * as THREE from 'three';

/**
 * Reusable Traditional Food Materials & Procedural Textures
 * High visual fidelity without external bandwidth or paid assets.
 */

// Procedural noise bump texture for food grain
function createNoiseTexture(size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const val = 128 + (Math.random() - 0.5) * 80;
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

// Procedural sesame seed texture for Ariselu
function createSesameTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep caramelized jaggery golden-brown base
  const grad = ctx.createRadialGradient(256, 256, 50, 256, 256, 256);
  grad.addColorStop(0, '#a84c13');
  grad.addColorStop(0.7, '#8f3c09');
  grad.addColorStop(1, '#662804');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Scattered roasted white sesame seeds
  ctx.fillStyle = '#fff9e6';
  for (let i = 0; i < 160; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const angle = Math.random() * Math.PI;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Procedural Teakwood platter grain
function createWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Warm rich mahogany/teakwood radial gradient
  const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 256);
  grad.addColorStop(0, '#5a351d');
  grad.addColorStop(0.4, '#472813');
  grad.addColorStop(0.75, '#3b1f0c');
  grad.addColorStop(1, '#2c1507');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Concentric tree growth rings
  ctx.strokeStyle = 'rgba(20, 8, 3, 0.22)';
  for (let r = 20; r < 256; r += 12 + Math.random() * 8) {
    ctx.lineWidth = 1.5 + Math.random() * 2;
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Procedural parchment label
function createPickleLabelTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Cream parchment
  ctx.fillStyle = '#fffbf2';
  ctx.fillRect(0, 0, 512, 256);

  // Double gold & crimson border
  ctx.strokeStyle = '#c68417';
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, 492, 236);

  ctx.strokeStyle = '#93220e';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(18, 18, 476, 220);

  // Deep crimson header bar
  ctx.fillStyle = '#93220e';
  ctx.fillRect(20, 20, 472, 60);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px serif';
  ctx.textAlign = 'center';
  ctx.fillText('BRAMARAMBIKA', 256, 46);
  ctx.font = '600 12px sans-serif';
  ctx.fillText('TRADITIONAL TELUGU HOME FOODS', 256, 66);

  // Telugu Title
  ctx.fillStyle = '#831b08';
  ctx.font = 'bold 30px serif';
  ctx.fillText('ఆవకాయ పచ్చడి', 256, 126);

  // English Title
  ctx.fillStyle = '#221108';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('ANDHRA AVAKAYA', 256, 156);

  // Trust pill
  ctx.fillStyle = '#23592d';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('100% Traditional Recipe • Cold-Pressed Mustard Oil', 256, 194);

  ctx.fillStyle = '#93220e';
  ctx.font = 'italic 12px serif';
  ctx.fillText('Diviseema Generations', 256, 220);

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
 * PBR Material configurations
 */
export const Materials = {
  // Ultra-realistic clear glass
  glass: {
    color: '#ffffff',
    roughness: 0.04,
    metalness: 0.05,
    transmission: 0.94,
    thickness: 1.0,
    ior: 1.52,
    transparent: true,
    opacity: 0.92,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05
  },

  // Deep spiced cold-pressed mustard oil with fiery red chilli sheen
  pickleOil: {
    color: '#c22802',
    roughness: 0.12,
    metalness: 0.06,
    transmission: 0.76,
    thickness: 1.4,
    ior: 1.48,
    transparent: true,
    opacity: 0.90
  },

  // Pickled cut raw mango chunk coated in Guntur chilli masala
  mangoChunk: {
    color: '#c94206',
    roughness: 0.32,
    metalness: 0.04
  },

  // Fresh green mango skin
  mangoSkin: {
    color: '#49731d',
    roughness: 0.35,
    metalness: 0.04
  },

  // Raw sour mango inner pulp
  mangoFlesh: {
    color: '#faa01b',
    roughness: 0.42,
    metalness: 0.02
  },

  // Guntur dried red chilli
  redChilli: {
    color: '#8c1102',
    roughness: 0.28,
    metalness: 0.12,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2
  },

  // Glossy fresh curry leaves
  curryLeaf: {
    color: '#1a5423',
    roughness: 0.25,
    metalness: 0.05,
    clearcoat: 0.5
  },

  // Traditional golden polished brass (thali, lids, bowls)
  brass: {
    color: '#e2a73d',
    roughness: 0.28,
    metalness: 0.9,
    clearcoat: 0.3
  },

  // Traditional wooden cutting board/pedestal
  wood: {
    color: '#4a2b15',
    roughness: 0.6,
    metalness: 0.02
  },

  // Fried golden savoury snack crust (Chekkalu, Murukku)
  goldenSavoury: {
    color: '#dc942c',
    roughness: 0.45,
    metalness: 0.03
  },

  // Bellam / Jaggery sweet glaze (Ariselu, Gavvalu)
  jaggerySweet: {
    color: '#9e460e',
    roughness: 0.28,
    metalness: 0.05,
    clearcoat: 0.4
  },

  // Ghee roasted Urad dal laddu / Sunnundalu
  sunnundaluLaddu: {
    color: '#b67a36',
    roughness: 0.75,
    metalness: 0.02
  },

  // Ravva laddu semolina cream
  ravvaLaddu: {
    color: '#ecdcba',
    roughness: 0.72,
    metalness: 0.01
  },

  // Mysore pak ghee honeycomb fudge
  mysorePak: {
    color: '#e5ab37',
    roughness: 0.48,
    metalness: 0.03
  },

  // Fresh banana leaf
  bananaLeaf: {
    color: '#347a28',
    roughness: 0.38,
    metalness: 0.04
  },

  // Fine textured Podi / spice powder
  spicePowder: {
    color: '#bf360c',
    roughness: 0.85,
    metalness: 0.0
  }
};
