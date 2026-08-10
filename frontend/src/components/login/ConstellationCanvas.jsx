import { useEffect, useRef } from 'react';

const CITIES = [
  { name: 'Tunis', x: 520, y: 180, size: 6, importance: 1.0 },
  { name: 'Ariana', x: 515, y: 175, size: 4, importance: 0.8 },
  { name: 'Ben Arous', x: 525, y: 185, size: 4, importance: 0.7 },
  { name: 'La Manouba', x: 510, y: 182, size: 3.5, importance: 0.6 },
  { name: 'Bizerte', x: 510, y: 120, size: 5, importance: 0.8 },
  { name: 'Nabeul', x: 580, y: 200, size: 4.5, importance: 0.7 },
  { name: 'Béja', x: 460, y: 150, size: 3.5, importance: 0.5 },
  { name: 'Jendouba', x: 420, y: 160, size: 3.5, importance: 0.5 },
  { name: 'Le Kef', x: 440, y: 130, size: 3, importance: 0.4 },
  { name: 'Siliana', x: 470, y: 140, size: 3, importance: 0.4 },
  { name: 'Kairouan', x: 540, y: 280, size: 4.5, importance: 0.7 },
  { name: 'Sousse', x: 570, y: 240, size: 5.5, importance: 0.9 },
  { name: 'Monastir', x: 585, y: 260, size: 4.5, importance: 0.7 },
  { name: 'Mahdia', x: 590, y: 290, size: 4, importance: 0.6 },
  { name: 'Sfax', x: 560, y: 340, size: 6, importance: 1.0 },
  { name: 'Gabès', x: 580, y: 420, size: 5, importance: 0.8 },
  { name: 'Gafsa', x: 480, y: 400, size: 4, importance: 0.6 },
  { name: 'Tozeur', x: 420, y: 420, size: 3.5, importance: 0.5 },
  { name: 'Médenine', x: 600, y: 460, size: 4, importance: 0.6 },
  { name: 'Kasserine', x: 460, y: 320, size: 3.5, importance: 0.5 },
  { name: 'Sidi Bouzid', x: 500, y: 350, size: 3, importance: 0.4 },
  { name: 'Kebili', x: 520, y: 450, size: 3, importance: 0.4 },
];

const CONNECTIONS = [
  ['Tunis', 'Ariana'], ['Tunis', 'Ben Arous'], ['Tunis', 'La Manouba'],
  ['Tunis', 'Bizerte'], ['Tunis', 'Nabeul'], ['Tunis', 'Sousse'],
  ['Sousse', 'Monastir'], ['Sousse', 'Kairouan'], ['Sousse', 'Sfax'],
  ['Sfax', 'Gabès'], ['Sfax', 'Gafsa'], ['Gabès', 'Médenine'],
  ['Bizerte', 'Béja'], ['Béja', 'Jendouba'], ['Béja', 'Le Kef'],
  ['Le Kef', 'Siliana'], ['Kairouan', 'Kasserine'], ['Kasserine', 'Gafsa'],
  ['Gafsa', 'Tozeur'], ['Tunis', 'Sfax'], ['Nabeul', 'Sousse'],
];

export default function ConstellationCanvas() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    let time = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      w = canvas.width = parent ? parent.offsetWidth : window.innerWidth / 2;
      h = canvas.height = parent ? parent.offsetHeight : window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    const draw = () => {
      time += 0.008;
      ctx.fillStyle = '#0A0A0F';
      ctx.fillRect(0, 0, w, h);

      const scaleX = w / 1000;
      const scaleY = h / 1000;
      const scale = Math.min(scaleX, scaleY) * 0.85;
      const offsetX = (w - 1000 * scale) / 2;
      const offsetY = (h - 1000 * scale) / 2;

      const getPos = (city) => ({
        x: offsetX + city.x * scale,
        y: offsetY + city.y * scale,
      });

      // Connections
      CONNECTIONS.forEach(([a, b]) => {
        const cityA = CITIES.find(c => c.name === a);
        const cityB = CITIES.find(c => c.name === b);
        if (!cityA || !cityB) return;
        const posA = getPos(cityA);
        const posB = getPos(cityB);

        const midX = (posA.x + posB.x) / 2;
        const midY = (posA.y + posB.y) / 2;
        const distMouse = Math.hypot(mouseRef.current.x - midX, mouseRef.current.y - midY);
        const mouseGlow = Math.max(0, 1 - distMouse / 150);
        const baseOpacity = 0.08 + mouseGlow * 0.25;

        ctx.beginPath();
        ctx.moveTo(posA.x, posA.y);
        ctx.lineTo(posB.x, posB.y);
        ctx.strokeStyle = `rgba(0, 102, 255, ${baseOpacity})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 12]);
        ctx.lineDashOffset = -time * 30;
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Cities
      CITIES.forEach((city) => {
        const pos = getPos(city);
        const distMouse = Math.hypot(mouseRef.current.x - pos.x, mouseRef.current.y - pos.y);
        const isHovered = distMouse < 40;
        const pulse = Math.sin(time * 2 + city.x * 0.01) * 0.3 + 0.7;

        const glowRadius = city.size * (isHovered ? 8 : 4) * scale;
        const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, glowRadius);
        gradient.addColorStop(0, `rgba(0, 102, 255, ${0.3 * pulse + (isHovered ? 0.3 : 0)})`);
        gradient.addColorStop(1, 'rgba(0, 102, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, city.size * scale * (isHovered ? 1.5 : 1), 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? '#FFFFFF' : `rgba(0, 102, 255, ${0.6 + pulse * 0.4})`;
        ctx.fill();

        if (isHovered) {
          ctx.font = '12px "JetBrains Mono", monospace';
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.fillText(city.name.toUpperCase(), pos.x, pos.y - 15);
        }
      });

      // Scan ring from Tunis
      const tunis = getPos(CITIES[0]);
      const scanRadius = (time * 50) % 300;
      const scanOpacity = 1 - (scanRadius / 300);
      ctx.beginPath();
      ctx.arc(tunis.x, tunis.y, scanRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 102, 255, ${scanOpacity * 0.15})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      frameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}
