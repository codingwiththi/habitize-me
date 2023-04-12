"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface PlanetProps {
  color: THREE.ColorRepresentation;
  radius: number;
  position: { x: number; y: number; z: number };
}

function createStars(count: number) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 50;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.01,
    sizeAttenuation: true,
  });

  const stars = new THREE.Points(geometry, material);
  return stars;
}

function createPlanet({ color, radius, position }: PlanetProps) {
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color });
  const planet = new THREE.Mesh(geometry, material);

  const orbit = new THREE.Object3D();
  orbit.position.set(position.x, position.y, position.z);
  orbit.add(planet);

  return orbit;
}

function updateSize(
  renderer: THREE.WebGLRenderer,
  ref: React.RefObject<HTMLDivElement>
) {
  const parent = ref.current?.parentElement;
  if (!parent) return;
  const width = parent.clientWidth;
  const height = parent.clientHeight;
  renderer.setSize(width, height);
}

// ... partes anteriores do código permanecem iguais ...

const GalaxyAnimation: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color("#1a2b4c")); // Definindo a cor de fundo
    updateSize(renderer, ref); // Atualizando o tamanho do renderizador
    ref.current.appendChild(renderer.domElement);
    const planetsGroup = new THREE.Group();
    scene.add(planetsGroup);
    const stars = createStars(5000);
    scene.add(stars);

    const planet1 = createPlanet({
      color: "#ff0000",
      radius: 0.5,
      position: { x: -2, y: 0, z: -5 },
    });
    planetsGroup.add(planet1);

    const planet2 = createPlanet({
      color: "#00ff00",
      radius: 0.4,
      position: { x: 0, y: 2, z: -6 },
    });
    planetsGroup.add(planet2);

    const planet3 = createPlanet({
      color: "#0000ff",
      radius: 0.6,
      position: { x: 2, y: -1, z: -4 },
    });
    planetsGroup.add(planet3);

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);

      // Adicione animações e atualizações aqui

      // Atualize a posição dos planetas ao longo do caminho central
      planet1.position.x += 0.01;
      planet2.position.x -= 0.01;
      planet3.position.x += 0.01;

      // Atualize a rotação das órbitas dos planetas
      planet1.rotation.y += 0.01;
      planet2.rotation.y -= 0.01;
      planet3.rotation.y += 0.01;

      stars.rotation.x += 0.0001;
      stars.rotation.y += 0.0001;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      // Limpeza ao desmontar o componente
      if (ref.current) {
        ref.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (!ref.current) return;

      const renderer = ref.current.querySelector("canvas");
      if (!renderer) return;

      const parent = ref.current.parentElement;
      if (!parent) return;

      const width = parent.clientWidth;
      const height = parent.clientHeight;

      renderer.style.width = `${width}px`;
      renderer.style.height = `${height}px`;
      renderer.width = width;
      renderer.height = height;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [ref]);

  return <div ref={ref} className="w-full h-full"></div>;
};

export default GalaxyAnimation;
