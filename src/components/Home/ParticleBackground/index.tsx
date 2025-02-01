import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const backgroundColor = '#1a1a2e';

  const [isContextLost, setIsContextLost] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    rendererRef.current = renderer;

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(backgroundColor, 1);

    const particlesCount = 100;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesPositions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      particlesPositions[i] = (Math.random() - 0.5) * 15;
      particlesPositions[i + 1] = (Math.random() - 0.5) * 15;
      particlesPositions[i + 2] = (Math.random() - 0.5) * 5;
    }

    particlesGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(particlesPositions, 3),
    );
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.05,
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    particlesRef.current = particles;
    scene.add(particles);

    camera.position.z = 8;

    const animate = (time: number) => {
      if (isContextLost) return;

      animationFrameRef.current = requestAnimationFrame(animate);

      if (particlesRef.current) {
        const positions = particlesRef.current.geometry.attributes.position
          .array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += Math.sin(time * 0.001 + i) * 0.01;
          positions[i + 1] += Math.cos(time * 0.002 + i) * 0.01;
          positions[i + 2] += Math.sin(time * 0.001 + i) * 0.01;
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate(0);

    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setIsContextLost(true);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    const handleContextRestored = () => {
      setIsContextLost(false);
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        animate(0);
      }
    };

    window.addEventListener('resize', handleResize);
    canvasRef.current.addEventListener(
      'webglcontextlost',
      handleContextLost,
      false,
    );
    canvasRef.current.addEventListener(
      'webglcontextrestored',
      handleContextRestored,
      false,
    );

    return () => {
      window.removeEventListener('resize', handleResize);
      if (canvasRef.current) {
        canvasRef.current.removeEventListener(
          'webglcontextlost',
          handleContextLost,
        );
        canvasRef.current.removeEventListener(
          'webglcontextrestored',
          handleContextRestored,
        );
      }
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (particlesRef.current) {
        particlesRef.current.geometry.dispose();
        (particlesRef.current.material as THREE.Material).dispose();
      }
    };
  }, [isContextLost]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        backgroundColor: backgroundColor,
      }}
    />
  );
};

export default ParticleBackground;
