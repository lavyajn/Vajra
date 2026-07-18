import { Suspense, useMemo, memo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Pre-load assets
useGLTF.preload('/models/grassland_and_highway.glb');
useGLTF.preload('/models/indian_house_old.glb');
useGLTF.preload('/models/abandoned_building.glb');
useGLTF.preload('/models/platano_tree.glb');
useGLTF.preload('/models/oak_tree.glb');

// Generate random transforms avoiding the center where the grid towers are
function generateCityTransforms(count, minRadius, maxRadius, yOffset = 0, scaleRange = [0.8, 1.2]) {
  const transforms = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = minRadius + Math.random() * (maxRadius - minRadius);
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    
    // Random rotation around Y axis
    const rotationY = Math.random() * Math.PI * 2;
    const scale = scaleRange[0] + Math.random() * (scaleRange[1] - scaleRange[0]);
    
    transforms.push({
      position: [x, yOffset, z],
      rotation: [0, rotationY, 0],
      scale: [scale, scale, scale]
    });
  }
  return transforms;
}

function ScatterModel({ path, count, generateTransforms, scaleFactor = 1 }) {
  const { scene } = useGLTF(path);
  // Ensure we don't re-generate transforms if the function reference changes
  // To be safe against re-renders if parent isn't memoized properly
  const transforms = useMemo(() => generateTransforms(count), [count]); 
  
  const clones = useMemo(() => {
    return transforms.map(() => scene.clone());
  }, [scene, transforms]);

  return (
    <group>
      {transforms.map((transform, i) => (
        <group 
          key={i} 
          position={transform.position} 
          rotation={transform.rotation} 
          scale={transform.scale.map(s => s * scaleFactor)}
        >
          <primitive object={clones[i]} />
        </group>
      ))}
    </group>
  );
}

export default memo(function CityEnvironment() {
  const { scene: grassland } = useGLTF('/models/grassland_and_highway.glb');
  
  const clonedGrassland = useMemo(() => grassland.clone(), [grassland]);

  // We set a very low Y offset to guarantee the towers at Y=0 are fully visible and not swallowed by the terrain
  const GROUND_Y = -4;

  return (
    <Suspense fallback={null}>
      {/* Base Environment */}
      <group position={[0, GROUND_Y, 0]}>
        <primitive object={clonedGrassland} scale={[1.2, 1.2, 1.2]} />
      </group>

      {/* Buildings - Scatter further away (towers are roughly within r < 12) */}
      <ScatterModel 
        path="/models/indian_house_old.glb" 
        count={8} 
        generateTransforms={(c) => generateCityTransforms(c, 15, 35, GROUND_Y, [0.8, 1.3])} 
        scaleFactor={0.5} 
      />

      <ScatterModel 
        path="/models/abandoned_building.glb" 
        count={5} 
        generateTransforms={(c) => generateCityTransforms(c, 18, 40, GROUND_Y, [0.6, 1.1])} 
        scaleFactor={0.3} 
      />

      {/* Trees - Less clustered, wider spread, much smaller scale */}
      <ScatterModel 
        path="/models/platano_tree.glb" 
        count={15} 
        generateTransforms={(c) => generateCityTransforms(c, 15, 45, GROUND_Y, [0.8, 1.4])} 
        scaleFactor={0.015} 
      />

      <ScatterModel 
        path="/models/oak_tree.glb" 
        count={12} 
        generateTransforms={(c) => generateCityTransforms(c, 17, 45, GROUND_Y, [0.8, 1.5])} 
        scaleFactor={0.015} 
      />
    </Suspense>
  );
});
