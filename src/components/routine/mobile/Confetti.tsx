import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

const CONFETTI_COLORS = [
  "bg-focus-block",
  "bg-rest-block",
  "bg-personal-block",
  "bg-yellow-400",
  "bg-pink-400",
  "bg-blue-400",
];

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
}

export function Confetti({ trigger, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      // Generate particles
      const newParticles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        delay: Math.random() * 0.5,
        rotation: Math.random() * 360,
      }));
      
      setParticles(newParticles);
      setShow(true);

      // Haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
      }

      // Clean up after animation
      const timeout = setTimeout(() => {
        setShow(false);
        setParticles([]);
        onComplete?.();
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [trigger, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={cn(
            "absolute w-2 h-2 rounded-sm",
            particle.color
          )}
          style={{
            left: `${particle.x}%`,
            top: "-10px",
            transform: `rotate(${particle.rotation}deg)`,
            animation: `confetti-fall 2s ease-out forwards`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
