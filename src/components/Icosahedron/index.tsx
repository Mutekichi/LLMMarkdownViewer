import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

// Constants
const CAMERA_FOV = 75;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 1000;
const ICOSAHEDRON_RADIUS = 1;
const ICOSAHEDRON_DETAIL = 0;
const VERTEX_SIZE = 0.05;
const CAMERA_POSITION_Z = 2;
const INITIAL_ROTATION_SPEED_X = 0.001;
const INITIAL_ROTATION_SPEED_Y = 0.0015;
const ACTIVE_ROTATION_SPEED = 0.8;
const INACTIVE_ROTATION_SPEED = 0.2;
const COLOR_CHANGE_SPEED = 0.00015;
const DEFAULT_COLOR = 0xffffff;

interface IcosahedronProps {
  isActivated: boolean;
  speed?: number;
}

const Icosahedron: React.FC<IcosahedronProps> = ({ isActivated, speed }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const wireframeRef = useRef<THREE.LineSegments | null>(null);
  const vertexPointsRef = useRef<THREE.Points | null>(null);
  const materialRef = useRef<THREE.LineBasicMaterial | null>(null);
  const animationStateRef = useRef({
    rotationSpeed: ACTIVE_ROTATION_SPEED,
    color: new THREE.Color(DEFAULT_COLOR),
    isActivated: isActivated,
  });

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(
      CAMERA_FOV,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      CAMERA_NEAR,
      CAMERA_FAR,
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight,
    );
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(
      ICOSAHEDRON_RADIUS,
      ICOSAHEDRON_DETAIL,
    );

    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: DEFAULT_COLOR });
    materialRef.current = edgesMaterial;
    const wireframe = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    wireframeRef.current = wireframe;

    scene.add(wireframe);

    const vertices = geometry.attributes.position.array;
    const vertexMaterial = new THREE.PointsMaterial({
      color: 0x000000,
      size: VERTEX_SIZE,
    });
    const vertexGeometry = new THREE.BufferGeometry();
    vertexGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3),
    );
    const vertexPoints = new THREE.Points(vertexGeometry, vertexMaterial);
    vertexPointsRef.current = vertexPoints;
    scene.add(vertexPoints);

    camera.position.z = CAMERA_POSITION_Z;

    const animate = (time: number) => {
      requestAnimationFrame(animate);

      if (
        wireframeRef.current &&
        vertexPointsRef.current &&
        materialRef.current
      ) {
        wireframeRef.current.rotation.x +=
          INITIAL_ROTATION_SPEED_X * animationStateRef.current.rotationSpeed;
        wireframeRef.current.rotation.y +=
          INITIAL_ROTATION_SPEED_Y * animationStateRef.current.rotationSpeed;

        vertexPointsRef.current.rotation.x = wireframeRef.current.rotation.x;
        vertexPointsRef.current.rotation.y = wireframeRef.current.rotation.y;

        if (animationStateRef.current.isActivated) {
          const hue = (time * COLOR_CHANGE_SPEED) % 1;
          animationStateRef.current.color.setHSL(hue, 0.5, 0.5);
        } else {
          animationStateRef.current.color.setHex(DEFAULT_COLOR);
        }

        materialRef.current.color.copy(animationStateRef.current.color);
      }

      renderer.render(scene, camera);
    };

    animate(0);

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect =
        mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight,
      );
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    animationStateRef.current.rotationSpeed = isActivated
      ? speed ?? ACTIVE_ROTATION_SPEED
      : INACTIVE_ROTATION_SPEED;
    animationStateRef.current.isActivated = isActivated;
    if (!isActivated) {
      animationStateRef.current.color.setHex(DEFAULT_COLOR);
    }
  }, [isActivated, speed]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default Icosahedron;
