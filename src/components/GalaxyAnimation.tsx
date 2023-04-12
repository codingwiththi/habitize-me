"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface PlanetProps {
  color: THREE.ColorRepresentation;
  radius: number;
  position: { x: number; y: number; z: number };
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
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color("#1a2b4c")); // Definindo a cor de fundo
    updateSize(renderer, ref); // Atualizando o tamanho do renderizador
    ref.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.3;

    // Adicione objetos à cena aqui
    const stars = createStars();
    scene.add(stars);

    // Adding the sun
    const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: "#ffe845" });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    // scene.add(sun);

    const centralOrbit = new THREE.Object3D();
    // centralOrbit.add(sun);

    // Adding spiral galaxies around the sun
    // const spiralGalaxies: SpiralGalaxy[] = [];
    const spiralGalaxies: THREE.Mesh[] = [];
    const smallestGeometry = new THREE.SphereGeometry(5 * 4, 32, 32);
    const smallestMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const smallestSpiralGalaxy = new THREE.Mesh(
      smallestGeometry,
      smallestMaterial
    );
    smallestSpiralGalaxy.position.set(0, (0 - 2) * 5, (0 - 2) * 5);
    spiralGalaxies.push(smallestSpiralGalaxy);
    scene.add(smallestSpiralGalaxy);

    for (let i = 1; i < 6; i++) {
      const geometry = new THREE.SphereGeometry(5 + i * 4, 32, 32);
      const material = new THREE.MeshBasicMaterial({
        color: 0x0085ab,
        wireframe: true,
      });
      const spiralGalaxy = new THREE.Mesh(geometry, material);
      spiralGalaxy.position.x = 0;
      spiralGalaxy.position.y = (i - 2) * 5;
      spiralGalaxy.position.z = (i - 2) * 5;

      spiralGalaxies.push(spiralGalaxy);
      scene.add(spiralGalaxy);
    }

    // Adding planets orbiting the spiral galaxies
    const planets: THREE.Mesh[] = [];

    spiralGalaxies.forEach((spiralGalaxy) => {
      for (let i = 0; i < 1; i++) {
        const planetGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const planetMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          wireframe: false,
        });
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 10;
        planet.position.x = Math.cos(angle) * distance;
        planet.position.y = Math.random() * 3 - 1.5;
        planet.position.z = Math.sin(angle) * distance;
        spiralGalaxy.add(planet);

        const orbit = new THREE.Object3D();
        orbit.position.x = Math.cos(angle) * distance;
        orbit.position.y = Math.random() * 3 - 1.5;
        orbit.position.z = Math.sin(angle) * distance;

        centralOrbit.add(orbit);
        orbit.add(planet);

        planets.push(planet);
      }
    });

    camera.position.z = 30;

    scene.add(centralOrbit);

    const animate = () => {
      requestAnimationFrame(animate);

      // Adicione animações e atualizações aqui
      // Rotating sun and spiral galaxies
      sun.rotation.y += 0.001;
      spiralGalaxies.forEach((spiralGalaxy, index) => {
        spiralGalaxy.rotation.y -= 0.003 + index / 200;
      });

      // Orbiting planets around their respective spiral galaxies
      planets.forEach((planet, index) => {
        const angle = (index + 1) * 0.01;
        const distance = 20 + Math.random() * 10;
        planet.position.x = Math.cos(angle) * distance;
        planet.position.y = Math.random() * 3 - 1.5;
        planet.position.z = Math.sin(angle) * distance;

        const orbit = planet.parent;
        if (orbit && orbit !== centralOrbit) {
          orbit.rotation.y -= 0.003 + index / 200;
        }
      });

      centralOrbit.rotation.y += 0.001;

      // Updating controls
      controls.update();

      // Atualize a posição dos planetas ao longo do caminho central

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
