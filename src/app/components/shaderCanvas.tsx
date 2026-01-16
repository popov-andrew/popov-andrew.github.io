'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';

export interface Uniforms {
    [key: string]: { value: any };
}

export interface ShaderCanvasRef {
    capture: () => string;
}

interface ScreenQuadProps {
    fragmentShader: string;
    customUniforms?: Uniforms;
}


// 1. The ScreenQuad handles the mesh and material logic
const ScreenQuad = ({ fragmentShader, customUniforms }: ScreenQuadProps) => {
    const mesh = useRef<THREE.Mesh>(null);
    const { size, viewport } = useThree();

    // Physics State
    const drag = useRef({
        isDown: false,
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
        rotX: 0.5,
        rotY: 0.5,
        velX: 0,
        velY: 0,
    });

    const lighting = useRef({
        accumilatedTime: 0,
        currentSpeed: 1.0
    });

    // Define standard uniforms
    const defaultUniforms = useMemo(() => ({
        u_time: { value: 0 },
        u_lightTime: { value: 0 },
        u_resolution: { value: new THREE.Vector2() },
        u_mouse: { value: new THREE.Vector2() },
        u_viewRotation: { value: new THREE.Vector2(0.5, 0.5) },
    }), []);

    const uniforms = useMemo(() => {
        return { ...defaultUniforms, ...customUniforms };
    }, [defaultUniforms]); //customs removed intentionally to prevent recreation (maybe add back?)

    useEffect(() => {
        if(mesh.current && customUniforms) {
            const material = mesh.current.material as THREE.ShaderMaterial;
            Object.keys(customUniforms).forEach((key) => {
                if(material.uniforms[key]) {
                    material.uniforms[key] = customUniforms[key];
                }
            });
        }
    }, [customUniforms]);

    // --- INTERACTION HANDLERS ---
  const handlePointerDown = (e: any) => {
    drag.current.isDown = true;
    drag.current.startX = e.clientX;
    drag.current.startY = e.clientY;
    drag.current.endX = e.clientX;
    drag.current.endY = e.clientY;
    // Stop any existing momentum so we can "catch" the rotation
    drag.current.velX = 0;
    drag.current.velY = 0;
  };

  const handlePointerUp = () => {
    drag.current.isDown = false;
  };

  const handlePointerMove = (e: any) => {
    if (!drag.current.isDown) return;

    // Calculate delta
    const deltaX = e.clientX - drag.current.endX;
    const deltaY = e.clientY - drag.current.endY;

    // Update velocity (sensitivity factor: 0.005)
    drag.current.velX = deltaX * 0.005;
    drag.current.velY = deltaY * 0.005;

    // Apply immediate rotation
    drag.current.rotX -= drag.current.velX;
    drag.current.rotY += drag.current.velY;

    // Clamp Vertical Rotation (optional, prevents flipping over the top)
    drag.current.rotY = Math.max(-1.5, Math.min(1.5, drag.current.rotY));

    drag.current.endX = e.clientX;
    drag.current.endY = e.clientY;
  };

  // Physics Loop
  useFrame((state, delta) => {
    const { clock, pointer } = state;
    const dt = delta || 0.016;
    
    // Friction Logic
    if (!drag.current.isDown) {
        // Apply momentum (add velocity to rotation)
        drag.current.rotX -= drag.current.velX;
        drag.current.rotY += drag.current.velY;
        
        // Decay velocity (Friction: 0.95 = slippery, 0.8 = sticky)
        drag.current.velX *= 0.95;
        drag.current.velY *= 0.95;

        // Still clamp vertical rotation during momentum
        drag.current.rotY = Math.max(-1.5, Math.min(1.5, drag.current.rotY));
    }

    // Dynamic Lighting Time
    const velocityMag = Math.sqrt(drag.current.velX ** 2 + drag.current.velY ** 2);
    const isInteracting = drag.current.isDown || velocityMag > 0.001;
    const targetSpeed = isInteracting ? 0.0 : 1.0;

    // Lighting Time Lerp
    lighting.current.currentSpeed += (targetSpeed - lighting.current.currentSpeed) * 0.1;
    lighting.current.accumilatedTime += delta * lighting.current.currentSpeed;

    if (mesh.current) {
        const material = mesh.current.material as THREE.ShaderMaterial;
        material.uniforms.u_time.value = clock.getElapsedTime();
        material.uniforms.u_resolution.value.set(size.width, size.height);
        material.uniforms.u_mouse.value.set(pointer.x, pointer.y);
        material.uniforms.u_viewRotation.value.set(drag.current.rotX, drag.current.rotY);
        material.uniforms.u_lightTime.value = lighting.current.accumilatedTime;
    }
  });

  return (
    <mesh 
        ref={mesh} 
        scale={[viewport.width, viewport.height, 1]}
        // Bind Interaction Events
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
    >
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={basicVertexShader}
        uniforms={uniforms}
        wireframe={false}
      />
    </mesh>
  );
};

// Standard Vertex Shader (just passes UVs)
const basicVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const CaptureHandler = ({ captureRef }: { captureRef: React.MutableRefObject<ShaderCanvasRef | null> }) => {
    const { gl, scene, camera } = useThree();

    useEffect(() => {
        if (captureRef) {
            captureRef.current = {
                capture: () => {
                    gl.render(scene, camera);
                    return gl.domElement.toDataURL('image/png');
                }
            };
        }
        // Cleanup on unmount
        return () => {
            if (captureRef) captureRef.current = null;
        };
    }, [gl, scene, camera, captureRef]);

    return null;
};

export interface ShaderCanvasRef {
    capture: () => string;
}

interface ShaderCanvasProps {
    fragmentShader: string;
    uniforms?: Uniforms; // Optional prop for custom uniforms
    pixelDensity?: number;
    captureRef?: React.MutableRefObject<ShaderCanvasRef | null>; // Optional ref for capturing screenshots
}

export default function ShaderCanvas({ fragmentShader, uniforms, pixelDensity = 2, captureRef }: ShaderCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const preventScroll = (e: TouchEvent) => {
            if (e.cancelable) { e.preventDefault(); }
        };

        container.addEventListener('touchmove', preventScroll, { passive: false }); // { passive: false } applies scroll lock for mobile
        container.addEventListener('touchstart', preventScroll, { passive: false }); // ^ cont.
    
        return () => {
            container.removeEventListener('touchmove', preventScroll);
            container.removeEventListener('touchstart', preventScroll);
        }
    }, []);
  
    return (
    <div 
        ref={containerRef}
        className="w-full h-full cursor-move active:cursor-grabbing"
        style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <Canvas 
        orthographic 
        camera={{ zoom: 1, position: [0, 0, 1] }}
        dpr={pixelDensity}
        gl={{ antialias: false }}    
    >
        <ScreenQuad fragmentShader={fragmentShader} customUniforms={uniforms} />
        {captureRef && <CaptureHandler captureRef={captureRef} />}
      </Canvas>
    </div>
  );
}