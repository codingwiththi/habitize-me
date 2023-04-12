"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
// import { MeshStandardMaterial, PointLight } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";

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
  const sun = new THREE.PointLight(0xffd600, 1.5, 450, 2);
  sun.position.set(0, 0, 0);

  const glowGeometry = new THREE.SphereGeometry(10, 32, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffd600,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 1,
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  sun.add(glow);

  return sun;
}

function createRing(innerRadius: number, outerRadius: number) {
  const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);
  const material = new THREE.MeshBasicMaterial({
    color: 0x3a5c99,
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
  const [isDragging, setIsDragging] = useState(false);
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

    const numberOfRings = 5;
    const ringRadiusStep = 20;
    const planetRadius = 4;
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

      const dragControls = new DragControls(
        [planet],
        camera,
        renderer.domElement
      );

      dragControls.addEventListener("drag", (event) => {
        const planetPosition = event.object.position;
        const distance = planetPosition.distanceTo(new THREE.Vector3(0, 0, 0));

        if (distance < innerRadius || distance > outerRadius) {
          // Impede o planeta de sair do seu anel
          planetPosition.setLength(innerRadius + planetRadius);
        } else {
          // Alinha o planeta com o anel
          const angle = Math.atan2(planetPosition.y, planetPosition.x);
          planetPosition.set(
            innerRadius * Math.cos(angle),
            innerRadius * Math.sin(angle),
            0
          );
        }
      });
    }

    const clock = new THREE.Clock(); // Adicione um relógio para manter o controle do tempo

    // Cria os DragControls e adiciona cada planeta como objeto arrastável
    const dragControls = new DragControls(planets, camera, renderer.domElement);

    // Define o movimento do drag and drop
    dragControls.addEventListener("dragstart", function () {
      setIsDragging(true);
      controls.enabled = false;
    });

    dragControls.addEventListener("dragend", function () {
      setIsDragging(false);
      controls.enabled = true;
    });

    const animate = () => {
      requestAnimationFrame(animate);

      controls.update();

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();
      for (let i = 0; i < planets.length; i++) {
        const planet = planets[i];

        if (!isDragging) {
          const angle = elapsedTime * (i + 1) * 0.1 * 2 * Math.PI;

          const x = (i + 1) * ringRadiusStep * Math.cos(angle);
          const y = (i + 1) * ringRadiusStep * Math.sin(angle);

          planet.position.set(x, y, 0);
        }
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
