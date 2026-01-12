import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Shader material for the flowing mist
const MistShader = ({ githubActivity = 0, mousePosition }) => {
  const meshRef = useRef();
  const [time, setTime] = useState(0);

  // Determine color based on GitHub activity
  // High activity (10+ commits) = warm vibrant colors
  // Low activity (0-5 commits) = cool calm colors
  const getColorScheme = (activity) => {
    if (activity > 10) {
      // Vibrant/Warm - Active developer
      return {
        color1: new THREE.Color('#FF6B6B'), // Warm red
        color2: new THREE.Color('#FFD93D'), // Golden yellow
        color3: new THREE.Color('#FF8E53'), // Orange
      };
    } else if (activity > 5) {
      // Moderate - Balanced colors
      return {
        color1: new THREE.Color('#6BCF7F'), // Fresh green
        color2: new THREE.Color('#4ECDC4'), // Turquoise
        color3: new THREE.Color('#45B7D1'), // Sky blue
      };
    } else {
      // Cool/Calm - Resting phase
      return {
        color1: new THREE.Color('#5F27CD'), // Deep purple
        color2: new THREE.Color('#48DBFB'), // Cool cyan
        color3: new THREE.Color('#0ABDE3'), // Ocean blue
      };
    }
  };

  const colors = useMemo(() => getColorScheme(githubActivity), [githubActivity]);

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_color1: { value: colors.color1 },
      u_color2: { value: colors.color2 },
      u_color3: { value: colors.color3 },
      u_intensity: { value: Math.min(githubActivity / 15, 1.0) },
    }),
    [colors, githubActivity]
  );

  // Vertex shader - simple passthrough
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  // Fragment shader - flowing mist effect
  const fragmentShader = `
    uniform float u_time;
    uniform vec2 u_mouse;
    uniform vec3 u_color1;
    uniform vec3 u_color2;
    uniform vec3 u_color3;
    uniform float u_intensity;
    varying vec2 vUv;

    // Noise function for organic movement
    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 2.0;
      
      for(int i = 0; i < 5; i++) {
        value += amplitude * noise(p * frequency);
        p *= 2.0;
        amplitude *= 0.5;
      }
      
      return value;
    }

    void main() {
      vec2 uv = vUv;
      
      // Create flowing movement
      vec2 flow = vec2(
        fbm(uv * 3.0 + u_time * 0.15),
        fbm(uv * 3.0 - u_time * 0.12 + vec2(5.2, 1.3))
      );
      
      // Add mouse influence
      vec2 mouseInfluence = (u_mouse - 0.5) * 0.3;
      flow += mouseInfluence;
      
      // Multiple layers of mist
      float mist1 = fbm(uv * 2.0 + flow + u_time * 0.1);
      float mist2 = fbm(uv * 1.5 - flow * 0.5 + u_time * 0.08);
      float mist3 = fbm(uv * 3.0 + flow * 1.5 - u_time * 0.12);
      
      // Combine layers
      float combined = (mist1 + mist2 + mist3) / 3.0;
      
      // Color gradient based on mist density
      vec3 color = mix(u_color1, u_color2, combined);
      color = mix(color, u_color3, mist2);
      
      // Adjust intensity based on GitHub activity
      float alpha = combined * 0.15 * (0.3 + u_intensity * 0.7);
      
      // Soft vignette effect
      float vignette = 1.0 - length(uv - 0.5) * 0.8;
      alpha *= vignette;
      
      gl_FragColor = vec4(color, alpha);
    }
  `;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.u_time.value = state.clock.elapsedTime;
      
      if (mousePosition) {
        meshRef.current.material.uniforms.u_mouse.value.set(
          mousePosition.x,
          mousePosition.y
        );
      }
    }
  });

  return (
    <mesh ref={meshRef} scale={[10, 10, 1]}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={true}
        depthWrite={false}
      />
    </mesh>
  );
};

// Main canvas component
const GenerativeBackground = ({ githubActivity = 0 }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: 1 - e.clientY / window.innerHeight, // Invert Y for WebGL
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 -z-20 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ alpha: true, antialias: true }}
      >
        <MistShader githubActivity={githubActivity} mousePosition={mousePosition} />
      </Canvas>
    </div>
  );
};

export default GenerativeBackground;
