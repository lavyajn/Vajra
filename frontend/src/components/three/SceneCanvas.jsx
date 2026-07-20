// SceneCanvas.jsx — Main R3F Canvas for 3D View
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import useGridStore from '../../store/useGridStore';
import GridTower from './GridTower';
import TransmissionLine from './TransmissionLine';
import Skybox from './Skybox';

export default function SceneCanvas() {
  const nodes = useGridStore((s) => s.nodes);
  const edges = useGridStore((s) => s.edges);

  const getNode = (id) => nodes.find(n => n.id === id);

  return (
    <Canvas
      camera={{ position: [0, 40, 10], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => {
        gl.setClearColor('#000000');
        gl.toneMapping = 1; // ACESFilmic
        gl.toneMappingExposure = 1.1;
      }}
    >
      {/* Single dominant directional light from above-front + low ambient fill */}
      <ambientLight intensity={0.25} color="#b8c4d0" />
      <directionalLight
        position={[5, 25, 10]}
        intensity={1.4}
        castShadow
        color="#e8edf2"
      />
      {/* Secondary fill light from behind */}
      <directionalLight
        position={[-5, 15, -10]}
        intensity={0.3}
        color="#4488cc"
      />

      <Skybox />
      
      {/* Command Center Grid Base */}
      <Grid 
        position={[0, -0.01, 0]} 
        args={[100, 100]} 
        sectionColor="#008866"
        sectionSize={4}
        cellColor="#003322" 
        cellSize={1}
        fadeDistance={80} 
        fadeStrength={1} 
      />

      {/* Controls — locked vertical tilt within comfortable range */}
      <OrbitControls
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.2}
        enablePan
        enableZoom
        enableRotate
        minDistance={10}
        maxDistance={80}
        zoomSpeed={0.8}
        target={[0, 0, 0]}
      />

      {/* Transmission Lines */}
      {edges.map(edge => (
        <TransmissionLine
          key={edge.id}
          edge={edge}
          nodeA={getNode(edge.source)}
          nodeB={getNode(edge.target)}
        />
      ))}

      {/* Grid Towers */}
      {nodes.map(node => (
        <GridTower key={node.id} node={node} />
      ))}
    </Canvas>
  );
}
