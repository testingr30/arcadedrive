
import React, { useEffect, useState } from 'react';

interface Spark {
  id: number;
  x: number;
  y: number;
  color: string;
}

const MouseEffects: React.FC = () => {
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleClick = (e: MouseEvent) => {
      // Theme colors: Primary (Pink), Secondary (Cyan), Accent (Purple)
      const colors = ['hsl(320, 100%, 55%)', 'hsl(190, 100%, 50%)', 'hsl(280, 100%, 60%)'];
      const newSparks: Spark[] = [];
      for (let i = 0; i < 8; i++) {
        newSparks.push({
          id: Date.now() + i,
          x: e.clientX,
          y: e.clientY,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      setSparks((prev) => [...prev, ...newSparks]);

      // Cleanup sparks
      setTimeout(() => {
        setSparks((prev) => prev.filter(s => !newSparks.find(ns => ns.id === s.id)));
      }, 1000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Cursor Glow */}
      <div
        className="absolute rounded-full bg-accent/20 blur-3xl transition-transform duration-75 will-change-transform"
        style={{
          width: '400px',
          height: '400px',
          left: mousePos.x - 200,
          top: mousePos.y - 200,
          pointerEvents: 'none',
        }}
      />

      {/* Click Sparks */}
      {sparks.map((spark, i) => (
        <div
          key={spark.id}
          className="spark absolute h-2 w-2 rounded-full"
          style={{
            left: spark.x,
            top: spark.y,
            backgroundColor: spark.color,
            animation: `spark-explode 0.6s ease-out forwards`,
            transform: `rotate(${i * 45}deg)`,
            '--tx': `${Math.cos(i * 45 * (Math.PI / 180)) * 100}px`,
            '--ty': `${Math.sin(i * 45 * (Math.PI / 180)) * 100}px`,
          } as React.CSSProperties}
        />
      ))}

      <style>{`
        @keyframes spark-explode {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default MouseEffects;
