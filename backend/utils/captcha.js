const crypto = require('crypto');

const captchaStore = new Map();

// Clean up expired captchas periodically (5 mins)
setInterval(() => {
  const now = Date.now();
  for (const [id, data] of captchaStore.entries()) {
    if (now - data.createdAt > 5 * 60 * 1000) {
      captchaStore.delete(id);
    }
  }
}, 60 * 1000);

function generateCaptchaSVG(text) {
  const width = 150;
  const height = 50;
  const bg = '#f8fafc';
  
  // Random noise lines
  let lines = '';
  for (let i = 0; i < 4; i++) {
    const x1 = Math.floor(Math.random() * width);
    const y1 = Math.floor(Math.random() * height);
    const x2 = Math.floor(Math.random() * width);
    const y2 = Math.floor(Math.random() * height);
    const color = ['#0d9488', '#0284c7', '#6366f1', '#ec4899'][i % 4];
    lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.5" opacity="0.6"/>`;
  }

  // Letters with slight rotation and scaling
  let textElements = '';
  const charWidth = width / (text.length + 1);
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const x = charWidth * (i + 0.8);
    const y = 33 + (Math.random() * 6 - 3);
    const rotate = Math.floor(Math.random() * 30 - 15);
    const colors = ['#0f766e', '#0369a1', '#4338ca', '#be185d', '#15803d'];
    const color = colors[i % colors.length];
    textElements += `<text x="${x}" y="${y}" transform="rotate(${rotate}, ${x}, ${y})" fill="${color}" font-family="monospace, sans-serif" font-weight="bold" font-size="24">${char}</text>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="${bg}" rx="8" stroke="#cbd5e1" stroke-width="1.5"/>
    ${lines}
    ${textElements}
  </svg>`;

  return svg;
}

function createCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const captchaId = crypto.randomUUID();
  captchaStore.set(captchaId, { code, createdAt: Date.now() });

  const svg = generateCaptchaSVG(code);
  return { captchaId, svg, code };
}

function verifyCaptcha(captchaId, inputCode) {
  if (!captchaId || !inputCode) return false;
  const stored = captchaStore.get(captchaId);
  if (!stored) return false;

  captchaStore.delete(captchaId); // One-time use
  return stored.code.toUpperCase() === inputCode.trim().toUpperCase();
}

module.exports = { createCaptcha, verifyCaptcha };
