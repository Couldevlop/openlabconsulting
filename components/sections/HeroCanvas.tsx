'use client';

import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type * as THREE from 'three';

/**
 * HeroCanvas — overlay WebGL léger pour le Hero (CLAUDE.md §2.1, §6.1).
 *
 * Choix techniques :
 * - Three.js + R3F (mandatés §2.1), tree-shaké au strict minimum
 * - Lazy-loaded depuis HeroBackground.tsx (dynamic + ssr:false)
 *   pour préserver le budget First Load JS < 150 kB
 * - Une simple constellation de points orange en rotation très lente
 * - prefers-reduced-motion : frameloop="demand" → rendu unique, pas
 *   d'animation continue
 * - Power preference low-power, antialiasing désactivé, DPR plafonné
 *   à 1.5 pour ménager les mobiles
 */

function Particles({ count = 350 }: { count?: number }): ReactElement {
  const ref = useRef<THREE.Points | null>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Sphère creuse de rayon 4 à 8, biais radial pour la densité aux bords.
      const r = 4 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.04;
    ref.current.rotation.x += delta * 0.01;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#FF5A00"
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export function HeroCanvas(): ReactElement {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent): void =>
      setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <Canvas
      aria-hidden
      data-testid="hero-canvas"
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 8], fov: 50 }}
      frameloop={reducedMotion ? 'demand' : 'always'}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Particles />
    </Canvas>
  );
}
