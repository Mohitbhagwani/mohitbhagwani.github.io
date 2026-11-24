import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { traceNodes, type TraceNodeId } from "../content/trace";

const moduleBody = "#334557";
const board = "#1b2634";
const copper = "#c9845d";
const floor = "#111c29";
const pathPairs: [TraceNodeId, TraceNodeId][] = [
  ["ingress", "vault"],
  ["vault", "core"],
  ["core", "provider"],
  ["provider", "relay"],
  ["relay", "ledger"],
  ["provider", "ledger"],
];
const linkPositions = Object.fromEntries(
  traceNodes.map((node) => [node.id, node.position]),
) as Record<TraceNodeId, [number, number, number]>;

function Block({
  at,
  size,
  color,
  rounded = false,
}: {
  at: [number, number, number];
  size: [number, number, number];
  color: string;
  rounded?: boolean;
}) {
  const material = (
    <meshStandardMaterial color={color} roughness={0.52} metalness={0.23} />
  );
  if (rounded)
    return (
      <RoundedBox
        position={at}
        args={size}
        radius={0.065}
        smoothness={2}
        castShadow
        receiveShadow
      >
        {material}
      </RoundedBox>
    );
  return (
    <mesh position={at} castShadow receiveShadow>
      <boxGeometry args={size} />
      {material}
    </mesh>
  );
}
function Signal({
  at,
  color,
  size = 0.12,
}: {
  at: [number, number, number];
  color: string;
  size?: number;
}) {
  return (
    <mesh position={at}>
      <boxGeometry args={[size, 0.035, size]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.65}
      />
    </mesh>
  );
}
function Module({ id, color }: { id: TraceNodeId; color: string }) {
  switch (id) {
    case "ingress":
      return (
        <>
          <Block
            at={[0, 0.36, 0]}
            size={[2.3, 0.35, 1.8]}
            color={moduleBody}
            rounded
          />
          {[-0.78, 0.78].map((x) => (
            <Block
              key={x}
              at={[x, 0.91, 0]}
              size={[0.39, 1.15, 1.62]}
              color="#526b79"
              rounded
            />
          ))}
          <Block
            at={[0, 1.5, 0]}
            size={[2.13, 0.26, 1.71]}
            color="#7d9ba0"
            rounded
          />
          <Block at={[0, 1.28, 0.86]} size={[1.49, 0.11, 0.08]} color={color} />
          {[-0.55, 0, 0.55].map((x) => (
            <Signal key={x} at={[x, 0.56, 0.65]} color={color} size={0.18} />
          ))}
        </>
      );
    case "vault":
      return (
        <>
          <Block
            at={[0, 0.52, 0]}
            size={[2.25, 0.71, 1.77]}
            color="#435164"
            rounded
          />
          <Block
            at={[0, 0.92, 0]}
            size={[2.11, 0.12, 1.55]}
            color="#707b80"
            rounded
          />
          {[-0.74, 0.74].map((x) => (
            <Block
              key={x}
              at={[x, 1.07, 0]}
              size={[0.2, 0.19, 1.4]}
              color={copper}
              rounded
            />
          ))}
          <Block
            at={[0, 0.52, 0.91]}
            size={[1.37, 0.38, 0.13]}
            color="#203141"
            rounded
          />
          <mesh position={[0, 0.56, 1.01]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.145, 0.145, 0.12, 8]} />
            <meshStandardMaterial
              color={color}
              metalness={0.55}
              roughness={0.32}
            />
          </mesh>
        </>
      );
    case "core":
      return (
        <>
          <Block
            at={[0, 0.36, 0]}
            size={[2.42, 0.36, 2.04]}
            color="#586371"
            rounded
          />
          <Block
            at={[0, 0.63, 0]}
            size={[1.58, 0.25, 1.49]}
            color="#87949a"
            rounded
          />
          <Block
            at={[0, 0.82, 0]}
            size={[1.19, 0.17, 1.08]}
            color={copper}
            rounded
          />
          {[-1, 1].flatMap((side) =>
            Array.from({ length: 7 }, (_, i) => (
              <Block
                key={`${side}:${i}`}
                at={[side * 0.92, 0.56, -0.64 + i * 0.21]}
                size={[0.39, 0.07, 0.09]}
                color="#d3a47b"
              />
            )),
          )}
          <mesh
            position={[0, 1.33, 0]}
            rotation={[0.12, Math.PI / 4, 0.1]}
            castShadow
          >
            <octahedronGeometry args={[0.58]} />
            <meshStandardMaterial
              color={color}
              emissive="#bd784d"
              emissiveIntensity={0.23}
              metalness={0.61}
              roughness={0.3}
            />
          </mesh>
        </>
      );
    case "provider":
      return (
        <>
          {[-0.7, 0, 0.7].map((x, i) => (
            <group key={x}>
              <Block
                at={[x, 0.69 + i * 0.13, 0]}
                size={[0.58, 1.02 + i * 0.25, 1.67]}
                color={i % 2 ? "#697e99" : "#52677f"}
                rounded
              />
              {Array.from({ length: 4 + i }, (_, j) => (
                <Block
                  key={j}
                  at={[x, 0.36 + j * 0.19, 0.848]}
                  size={[0.43, 0.057, 0.045]}
                  color="#263748"
                />
              ))}
              <Block
                at={[x, 1.23 + i * 0.26, 0]}
                size={[0.61, 0.09, 1.69]}
                color={color}
              />
            </group>
          ))}
        </>
      );
    case "relay":
      return (
        <>
          <Block
            at={[0, 0.35, 0]}
            size={[2.3, 0.31, 1.7]}
            color="#526f72"
            rounded
          />
          {[-0.63, 0.63].map((x) => (
            <group key={x}>
              <Block
                at={[x, 0.79, 0]}
                size={[0.53, 0.61, 1.44]}
                color="#6d9891"
                rounded
              />
              <Block
                at={[x, 1.19, 0]}
                size={[0.15, 0.4, 0.15]}
                color="#87999a"
              />
              <Signal at={[x, 1.41, 0]} color={color} size={0.21} />
            </group>
          ))}
          <Block at={[0, 1.07, 0.02]} size={[0.86, 0.08, 0.13]} color={color} />
        </>
      );
    case "ledger":
      return (
        <>
          {[-0.56, 0.56].map((x) => (
            <group key={x}>
              {[0.4, 0.68, 0.96].map((y, i) => (
                <mesh key={y} position={[x, y, 0]} castShadow receiveShadow>
                  <cylinderGeometry args={[0.44, 0.44, 0.25, 24]} />
                  <meshStandardMaterial
                    color={i % 2 ? "#819095" : "#627786"}
                    metalness={0.44}
                    roughness={0.37}
                  />
                </mesh>
              ))}
              <Signal at={[x, 1.105, 0]} color={color} size={0.17} />
            </group>
          ))}
          <Block
            at={[0, 0.27, 0]}
            size={[2.2, 0.2, 1.7]}
            color="#495d70"
            rounded
          />
        </>
      );
  }
}
function TraceLinks({
  from,
  to,
  failed,
  visited,
}: {
  from: TraceNodeId | null;
  to: TraceNodeId | null;
  failed: boolean;
  visited: readonly TraceNodeId[];
}) {
  return (
    <>
      {pathPairs.map(([a, b]) => {
        const start = new THREE.Vector3(...linkPositions[a]),
          end = new THREE.Vector3(...linkPositions[b]);
        const midpoint = start.clone().lerp(end, 0.5);
        const active = from === a && to === b;
        const reached =
          visited.indexOf(a) >= 0 && visited[visited.indexOf(a) + 1] === b;
        let signal = "#648b92";
        if (reached) signal = "#70b5a8";
        if (active) signal = failed ? "#ff826a" : "#81f0d5";
        const distance = start.distanceTo(end);
        return (
          <group
            key={a + b}
            position={[midpoint.x, 0.098, midpoint.z]}
            rotation={[0, -Math.atan2(end.z - start.z, end.x - start.x), 0]}
          >
            <Block
              at={[0, 0, 0]}
              size={[distance, 0.043, 0.35]}
              color="#253747"
            />
            {[-0.11, 0.11].map((z) => (
              <mesh key={z} position={[0, 0.029, z]}>
                <boxGeometry args={[distance, 0.029, 0.037]} />
                <meshStandardMaterial
                  color={signal}
                  emissive={
                    active ? (failed ? "#ff553b" : "#66cfba") : "#1c3339"
                  }
                  emissiveIntensity={active ? 0.75 : reached ? 0.35 : 0.13}
                />
              </mesh>
            ))}
          </group>
        );
      })}
    </>
  );
}
function Packet({
  from,
  to,
  revision,
  failed,
}: {
  from: TraceNodeId | null;
  to: TraceNodeId | null;
  revision: number;
  failed: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const time = useRef(0);
  const { invalidate } = useThree();
  useEffect(() => {
    time.current = 0;
    invalidate();
  }, [revision, invalidate]);
  useFrame((_, delta) => {
    if (!to || !ref.current) return;
    const a = linkPositions[from ?? to],
      b = linkPositions[to];
    time.current = Math.min(1, time.current + Math.min(delta, 0.1) * 2.3);
    const t = THREE.MathUtils.smoothstep(time.current, 0, 1);
    ref.current.position.set(
      THREE.MathUtils.lerp(a[0], b[0], t),
      1.83 + Math.sin(t * Math.PI) * 0.45,
      THREE.MathUtils.lerp(a[2], b[2], t),
    );
    ref.current.rotation.y = t * Math.PI * 2;
    if (time.current < 1) invalidate();
  });
  if (!to) return null;
  return (
    <group ref={ref}>
      <mesh rotation={[0, 0, 0.25]}>
        <octahedronGeometry args={[0.21]} />
        <meshStandardMaterial
          color={failed ? "#ff8f72" : "#b6f9dc"}
          emissive={failed ? "#ff6241" : "#80f6cd"}
          emissiveIntensity={1.2}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.27, 0.29, 28]} />
        <meshBasicMaterial
          color={failed ? "#ff987e" : "#8ff5dc"}
          transparent
          opacity={0.65}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
function Board() {
  const geometry = useMemo(() => {
    const points: number[] = [];
    for (let x = -17; x <= 17; x++) {
      for (let z = -11; z <= 11; z++) points.push(x, 0.005, z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    return g;
  }, []);
  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.57, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color={floor} roughness={1} />
      </mesh>
      <RoundedBox
        args={[20.4, 0.55, 11.8]}
        position={[0, -0.31, 0]}
        radius={0.24}
        smoothness={3}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={board} metalness={0.24} roughness={0.69} />
      </RoundedBox>
      <points geometry={geometry}>
        <pointsMaterial
          color="#6e8897"
          size={0.042}
          opacity={0.45}
          transparent
          depthWrite={false}
        />
      </points>
      {[-1, 1].map((s) => (
        <group key={s}>
          <Block
            at={[0, 0.016, s * 5.32]}
            size={[18.9, 0.039, 0.037]}
            color="#607383"
          />
          <Block
            at={[s * 9.43, 0.016, 0]}
            size={[0.038, 0.039, 10.7]}
            color="#607383"
          />
          {[-4.9, 4.9].map((z) => (
            <mesh key={z} position={[s * 9.05, 0.06, z]}>
              <cylinderGeometry args={[0.19, 0.19, 0.09, 10]} />
              <meshStandardMaterial
                color="#8d9ca6"
                metalness={0.53}
                roughness={0.45}
              />
            </mesh>
          ))}
        </group>
      ))}
      <Block
        at={[-5.15, 0.03, -2.62]}
        size={[4.2, 0.11, 2.67]}
        color="#253647"
        rounded
      />
      {Array.from({ length: 9 }, (_, i) => (
        <Block
          key={i}
          at={[-6.67 + i * 0.38, 0.13, -2.62]}
          size={[0.12, 0.07, 1.5]}
          color={i % 3 === 0 ? copper : "#617483"}
        />
      ))}
    </>
  );
}
function SceneReady({
  onReady,
  onError,
}: {
  onReady: () => void;
  onError: () => void;
}) {
  const { gl, camera } = useThree();
  const width = useThree((state) => state.size.width);
  useEffect(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      camera.zoom = THREE.MathUtils.clamp(width / 23.5, 11, 39);
      camera.updateProjectionMatrix();
    }
  }, [camera, width]);
  useEffect(() => {
    camera.lookAt(0, 0, 0);
    const target = gl.domElement;
    const handler = (event: Event) => {
      event.preventDefault();
      onError();
    };
    target.addEventListener("webglcontextlost", handler);
    onReady();
    return () => target.removeEventListener("webglcontextlost", handler);
  }, [camera, gl, onReady, onError]);
  return null;
}
export default function TraceScene({
  active,
  next,
  revision,
  failed,
  selected,
  visited,
  onSelect,
  onReady,
  onError,
}: {
  active: TraceNodeId | null;
  next: TraceNodeId | null;
  revision: number;
  failed: boolean;
  selected: TraceNodeId | null;
  visited: readonly TraceNodeId[];
  onSelect: (node: TraceNodeId) => void;
  onReady: () => void;
  onError: () => void;
}) {
  return (
    <Canvas
      frameloop="demand"
      shadows
      orthographic
      camera={{ position: [9, 14, 22], zoom: 33, near: 0.1, far: 150 }}
      dpr={[1, 1.35]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      fallback={
        <p>3D is unavailable. Trace controls remain available below.</p>
      }
    >
      <color attach="background" args={[floor]} />
      <hemisphereLight args={["#d1eaff", "#4e526b", 2.8]} />
      <directionalLight
        position={[-12, 20, 8]}
        color="#ffdfc0"
        intensity={2.75}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[9, 4, -7]} color="#89c5eb" intensity={0.8} />
      <Board />
      <TraceLinks from={active} to={next} failed={failed} visited={visited} />
      {traceNodes.map((node, index) => (
        <group key={node.id} position={node.position}>
          <Block
            at={[0, 0.105, 0]}
            size={[3, 0.17, 2.3]}
            color={
              selected === node.id || next === node.id ? "#617e84" : "#3b4d60"
            }
            rounded
          />
          <group
            onClick={(event) => {
              event.stopPropagation();
              onSelect(node.id);
            }}
          >
            <Module id={node.id} color={node.color} />
          </group>
          <Signal at={[-1.26, 0.203, 0.88]} color={node.color} />
          <Html center position={[0, 0.18, 1.64]} zIndexRange={[6, 0]}>
            <button
              className="trace-node"
              aria-pressed={selected === node.id}
              onClick={() => onSelect(node.id)}
            >
              <b>{String(index + 1).padStart(2, "0")}</b>
              {node.short}
            </button>
          </Html>
        </group>
      ))}
      <Packet from={active} to={next} revision={revision} failed={failed} />
      <OrbitControls
        makeDefault
        target={[0, 0, 0]}
        minZoom={9}
        maxZoom={74}
        enablePan={false}
        minPolarAngle={0.38}
        maxPolarAngle={1.18}
        enableDamping={false}
      />
      <SceneReady onReady={onReady} onError={onError} />
    </Canvas>
  );
}
