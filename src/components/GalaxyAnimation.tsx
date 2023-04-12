"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

function getRandomColor(): THREE.Color {
  const letters = "0123456789ABCDEF";
  let color = "0x";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return new THREE.Color(Number(color));
}

function createStars() {
  const geometry = new THREE.BufferGeometry();
  const starVertices = [];
  for (let i = 0; i < 10000; i++) {
    const x = Math.random() * 2000 - 1000;
    const y = Math.random() * 2000 - 1000;
    const z = Math.random() * 2000 - 1000;
    starVertices.push(x, y, z);
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(starVertices, 3)
  );

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.01,
    sizeAttenuation: true,
  });

  const stars = new THREE.Points(geometry, material);
  return stars;
}

function createSun() {
  const geometry = new THREE.SphereGeometry(10, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const sun = new THREE.Mesh(geometry, material);
  return sun;
}

function createRing(innerRadius: number, outerRadius: number) {
  const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);
  const material = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(geometry, material);
  return ring;
}

function createPlanet(radius: number, color: THREE.ColorRepresentation) {
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: color });
  const planet = new THREE.Mesh(geometry, material);
  return planet;
}

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
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color("#1a2b4c"));
    ref.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.3;

    const stars = createStars();
    scene.add(stars);

    const sun = createSun();
    scene.add(sun);

    const numberOfRings = 4;
    const ringRadiusStep = 20;
    const planetRadius = 2;
    const planets: THREE.Mesh[] = []; // Especifique o tipo para evitar avisos

    for (let i = 1; i <= numberOfRings; i++) {
      const innerRadius = i * ringRadiusStep;
      const outerRadius = innerRadius + 1;
      const ring = createRing(innerRadius, outerRadius);
      scene.add(ring);

      const randomColor = getRandomColor();
      const planet = createPlanet(planetRadius, randomColor);
      planet.position.set(innerRadius, 0, 0);
      planets.push(planet);
      scene.add(planet);
    }

    const clock = new THREE.Clock(); // Adicione um relógio para manter o controle do tempo

    const animate = () => {
      requestAnimationFrame(animate);

      controls.update();

      const delta = clock.getDelta(); // Obtenha a diferença de tempo desde o último quadro

      const elapsedTime = clock.getElapsedTime(); // Obtenha o tempo acumulado desde o início da animação
      for (let i = 0; i < planets.length; i++) {
        const planet = planets[i];
        const angle = elapsedTime * (i + 1) * 0.1 * 2 * Math.PI;

        const x = (i + 1) * ringRadiusStep * Math.cos(angle);
        const y = (i + 1) * ringRadiusStep * Math.sin(angle);

        planet.position.set(x, y, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      renderer.dispose();
      // scene.dispose();
    };
  }, []);

  return <div ref={ref}></div>;
};

export default GalaxyAnimation;
