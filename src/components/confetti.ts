const COLORS = ['#8b5cf6', '#4f46e5', '#06d6a0', '#ffd32a', '#ff4757', '#4cc9f0', '#f72585', '#2ed573'];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  shape: 'rect' | 'circle';
}

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let particles: Particle[] = [];
let animFrame: number | null = null;

function initCanvas() {
  if (canvas) return;
  canvas = document.createElement('canvas');
  canvas.style.cssText =
    'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  window.addEventListener('resize', () => {
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  });
}

function animate() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles = particles.filter((p) => p.life > 0);

  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.3;
    p.vx *= 0.98;
    p.life -= 1 / (p.maxLife);
    p.rotation += p.rotationSpeed;

    const alpha = Math.max(0, p.life);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;

    if (p.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    }

    ctx.restore();
  }

  if (particles.length > 0) {
    animFrame = requestAnimationFrame(animate);
  } else {
    animFrame = null;
  }
}

export function fireConfetti(x: number, y: number, count = 45) {
  initCanvas();

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 12 + 2;
    const maxLife = 50 + Math.random() * 30;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 7,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 1,
      maxLife,
      size: Math.random() * 10 + 5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.25,
      shape: Math.random() > 0.4 ? 'rect' : 'circle',
    });
  }

  if (animFrame === null) {
    animFrame = requestAnimationFrame(animate);
  }
}
