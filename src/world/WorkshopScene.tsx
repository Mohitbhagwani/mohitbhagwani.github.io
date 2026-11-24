import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { exhibits, type Exhibit } from "../content/workshop";

type XYZ = [number, number, number];
const backdrop = "#101c29";

function Solid({
  at,
  size,
  color,
  smooth = false,
}: {
  at: XYZ;
  size: XYZ;
  color: string;
  smooth?: boolean;
}) {
  const material = (
    <meshStandardMaterial color={color} roughness={0.55} metalness={0.18} />
  );
  return smooth ? (
    <RoundedBox
      position={at}
      args={size}
      radius={0.09}
      smoothness={2}
      castShadow
      receiveShadow
    >
      {material}
    </RoundedBox>
  ) : (
    <mesh position={at} castShadow receiveShadow>
      <boxGeometry args={size} />
      {material}
    </mesh>
  );
}

function Tube({
  at,
  radius,
  height,
  color,
}: {
  at: XYZ;
  radius: number;
  height: number;
  color: string;
}) {
  return (
    <mesh position={at} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, height, 32]} />
      <meshStandardMaterial color={color} roughness={0.34} metalness={0.27} />
    </mesh>
  );
}

function LightRing({
  at,
  radius,
  color,
}: {
  at: XYZ;
  radius: number;
  color: string;
}) {
  return (
    <mesh position={at} rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.025, 8, 40]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.55}
      />
    </mesh>
  );
}

function Sculpture({ item }: { item: Exhibit }) {
  const c = item.color;
  switch (item.id) {
    case "java":
      return (
        <>
          <Tube at={[0, 0.45, 0]} radius={0.83} height={0.15} color="#f9dfbd" />
          <mesh position={[0, 0.98, 0]} castShadow>
            <cylinderGeometry args={[0.53, 0.39, 0.91, 32]} />
            <meshStandardMaterial color={c} roughness={0.27} metalness={0.22} />
          </mesh>
          <Tube
            at={[0, 1.445, 0]}
            radius={0.46}
            height={0.025}
            color="#482c29"
          />
          <mesh position={[0.59, 1, 0]} castShadow>
            <torusGeometry args={[0.27, 0.078, 12, 28]} />
            <meshStandardMaterial color={c} />
          </mesh>
          {[-0.18, 0.17].map((x, i) => (
            <mesh
              key={x}
              position={[x, 1.7 + i * 0.08, 0.03]}
              rotation={[0, 0, -0.55 + i * 0.2]}
            >
              <torusGeometry args={[0.19, 0.022, 8, 24, Math.PI * 1.3]} />
              <meshStandardMaterial
                color="#f9dfbd"
                emissive={c}
                emissiveIntensity={0.25}
              />
            </mesh>
          ))}
        </>
      );
    case "go":
      return (
        <>
          {[-1, 1].map((s) => (
            <group
              key={s}
              position={[s * 0.29, 0.99, 0]}
              rotation={[0, 0.31, 0]}
            >
              <mesh castShadow>
                <torusGeometry args={[0.53, 0.135, 16, 40]} />
                <meshStandardMaterial
                  color={s === 1 ? c : "#c1eef4"}
                  roughness={0.27}
                  metalness={0.45}
                />
              </mesh>
            </group>
          ))}
          <Solid
            at={[0, 0.43, 0]}
            size={[1.64, 0.12, 0.8]}
            color="#365e6f"
            smooth
          />
        </>
      );
    case "spring":
      return (
        <>
          <Tube at={[0, 0.5, 0]} radius={0.63} height={0.23} color="#618e70" />
          {[-1, 1].map((s) => (
            <mesh
              key={s}
              position={[s * 0.31, 1.13, 0]}
              rotation={[0.2, 0, -s * 0.68]}
              castShadow
              scale={[0.42, 0.8, 0.22]}
            >
              <sphereGeometry args={[1, 20, 14]} />
              <meshStandardMaterial
                color={s === 1 ? c : "#619d6a"}
                roughness={0.52}
              />
            </mesh>
          ))}
          <Solid
            at={[0, 1.15, 0.21]}
            size={[0.055, 1, 0.045]}
            color="#d7ecc0"
          />
        </>
      );
    case "kafka":
      return (
        <>
          {[-0.64, 0, 0.64].map((x, i) => (
            <group key={x}>
              <Solid
                at={[x, 0.91 + i * 0.16, 0]}
                size={[0.47, 1.04 + i * 0.32, 0.75]}
                color={i === 1 ? c : "#686baf"}
                smooth
              />
              {Array.from({ length: 4 }, (_, row) => (
                <Solid
                  key={row}
                  at={[x, 0.6 + row * 0.205, 0.4]}
                  size={[0.27, 0.045, 0.035]}
                  color="#e7dfff"
                />
              ))}
            </group>
          ))}
        </>
      );
    case "sql":
    case "redis":
      return (
        <>
          {[0, 1, 2].map((i) => (
            <group key={i} position={[0, 0.55 + i * 0.34, 0]}>
              <Tube
                at={[0, 0, 0]}
                radius={0.66}
                height={0.28}
                color={i === 1 ? "#888fa7" : c}
              />
              <LightRing
                at={[0, 0.14, 0]}
                radius={0.54}
                color={i === 1 ? c : "#dce3f2"}
              />
            </group>
          ))}
        </>
      );
    case "docker":
      return (
        <>
          {[
            [-0.49, 0.63, 0],
            [0.48, 0.63, 0],
            [0, 1.12, -0.14],
          ].map(([x, y, z], i) => (
            <group key={i} position={[x, y, z]}>
              <Solid
                at={[0, 0, 0]}
                size={[0.9, 0.43, 0.98]}
                color={i === 2 ? "#b1dbfb" : c}
                smooth
              />
              {[-0.26, -0.09, 0.09, 0.26].map((line) => (
                <Solid
                  key={line}
                  at={[line, 0, 0.5]}
                  size={[0.037, 0.25, 0.025]}
                  color="#536b85"
                />
              ))}
            </group>
          ))}
        </>
      );
    default:
      return (
        <>
          <Tube at={[0, 0.53, 0]} radius={0.65} height={0.16} color="#8d634f" />
          <mesh position={[0, 1.07, 0]} rotation={[0.3, 0.54, 0.1]} castShadow>
            <icosahedronGeometry args={[0.55, 0]} />
            <meshStandardMaterial color={c} metalness={0.43} roughness={0.25} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh
              key={s}
              position={[0, 1.05, 0]}
              rotation={[0.8, s * 0.76, 0.3]}
            >
              <torusGeometry args={[0.73, 0.049, 10, 40]} />
              <meshStandardMaterial
                color={c}
                emissive="#cb8b66"
                emissiveIntensity={0.3}
              />
            </mesh>
          ))}
        </>
      );
  }
}

function Pedestal({
  item,
  active,
  onSelect,
}: {
  item: Exhibit;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <group
      position={item.at}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      <Solid
        at={[0, 0.097, 0]}
        size={[2.6, 0.27, 2.5]}
        color={active ? "#6b6c79" : "#3a4d62"}
        smooth
      />
      <Solid
        at={[0, 0.28, 0]}
        size={[2.23, 0.18, 2.17]}
        color="#617386"
        smooth
      />
      <LightRing
        at={[0, 0.38, 0]}
        radius={1}
        color={active ? "#f7e2aa" : item.color}
      />
      <Sculpture item={item} />
      <Html center position={[0, 0.27, 1.42]} zIndexRange={[8, 1]}>
        <button
          className="workshop-label"
          aria-pressed={active}
          onClick={onSelect}
        >
          {item.name}
        </button>
      </Html>
    </group>
  );
}

function Hall() {
  const inlays = useMemo(() => {
    const data = [];
    for (let z = -15; z < 14; z++)
      for (let x = -8; x <= 8; x++) data.push(x, 0.012, z);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(data, 3),
    );
    return geometry;
  }, []);
  useEffect(() => () => inlays.dispose(), [inlays]);
  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.22, 0]}
        receiveShadow
      >
        <planeGeometry args={[150, 150]} />
        <meshStandardMaterial color="#162232" />
      </mesh>
      <Solid
        at={[0, -0.12, -1.7]}
        size={[14, 0.24, 27]}
        color="#29394b"
        smooth
      />
      <points geometry={inlays}>
        <pointsMaterial
          color="#9ebacc"
          size={0.037}
          opacity={0.65}
          transparent
        />
      </points>
      <Solid at={[0, 0.025, -1.7]} size={[3.5, 0.055, 25.8]} color="#384b60" />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Solid
            at={[s * 1.77, 0.071, -1.7]}
            size={[0.045, 0.043, 25.8]}
            color="#c69370"
          />
          <Solid
            at={[s * 6.3, 0.15, -1.7]}
            size={[0.46, 0.35, 26]}
            color="#587084"
          />
          {[-12, -7, -2, 3, 8].map((z) => (
            <group key={z}>
              <Solid
                at={[s * 6.25, 1.46, z]}
                size={[0.22, 2.9, 0.22]}
                color="#617284"
              />
              <Solid
                at={[s * 6.25, 2.85, z]}
                size={[0.65, 0.13, 0.4]}
                color="#e8c39f"
                smooth
              />
            </group>
          ))}
        </group>
      ))}
      <Solid
        at={[0, 1.58, -13.55]}
        size={[13.4, 3.15, 0.54]}
        color="#31485b"
        smooth
      />
      {Array.from({ length: 11 }, (_, i) => (
        <Solid
          key={i}
          at={[-5.7 + i * 1.14, 1.5, -13.25]}
          size={[0.07, 2.63, 0.05]}
          color="#61818e"
        />
      ))}
      <Solid at={[0, 2.82, -13.21]} size={[12, 0.08, 0.08]} color="#d4a889" />
      {[-8, -3, 2, 7].map((z) => (
        <Solid
          key={z}
          at={[0, 0.063, z]}
          size={[0.09, 0.015, 1.45]}
          color="#9ab4ba"
        />
      ))}
    </>
  );
}

const WASD: Record<string, string> = {
  w: "up",
  a: "left",
  s: "down",
  d: "right",
  ArrowUp: "up",
  ArrowLeft: "left",
  ArrowDown: "down",
  ArrowRight: "right",
};

function WalkCamera({
  input,
  onNearby,
  onInspect,
}: {
  input: React.RefObject<Set<string>>;
  onNearby: (item: Exhibit | null) => void;
  onInspect: (item: Exhibit) => void;
}) {
  const { camera, invalidate, gl } = useThree();
  const current = useRef<Exhibit | null>(null);
  const heading = useRef(0);
  const target = useRef(new THREE.Vector3());
  useEffect(() => {
    camera.position.set(0, 2.2, 10.2);
    camera.lookAt(0, 1.8, -4);
    invalidate();
    const arena = gl.domElement.closest(".workshop-stage");
    const down = (event: KeyboardEvent) => {
      if (!arena?.contains(document.activeElement)) return;
      if (
        event.target instanceof HTMLElement &&
        event.target.closest("input, textarea, select, a, button")
      )
        return;
      if ((event.key === "e" || event.key === "E") && current.current) {
        event.preventDefault();
        onInspect(current.current);
      }
      const action = WASD[event.key] ?? WASD[event.key.toLowerCase()];
      if (action) {
        event.preventDefault();
        input.current.add(action);
        invalidate();
      }
    };
    const up = (event: KeyboardEvent) => {
      const action = WASD[event.key] ?? WASD[event.key.toLowerCase()];
      if (action) input.current.delete(action);
    };
    const clear = () => input.current.clear();
    const keys = input.current;
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      keys.clear();
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, [camera, gl, invalidate, input, onInspect]);
  useFrame((_, dt) => {
    const delta = Math.min(dt, 0.048);
    const keys = input.current;
    const turn = Number(keys.has("right")) - Number(keys.has("left"));
    const advance = Number(keys.has("up")) - Number(keys.has("down"));
    heading.current += turn * delta * 1.85;
    const x = Math.sin(heading.current),
      z = -Math.cos(heading.current);
    camera.position.x = THREE.MathUtils.clamp(
      camera.position.x + x * advance * 6 * delta,
      -2.15,
      2.15,
    );
    camera.position.z = THREE.MathUtils.clamp(
      camera.position.z + z * advance * 6 * delta,
      -11.6,
      11.2,
    );
    target.current.set(
      camera.position.x + x * 8,
      1.35,
      camera.position.z + z * 8,
    );
    camera.lookAt(target.current);
    let next: Exhibit | null = null;
    let radius = 5.1;
    for (const item of exhibits) {
      const dx = item.at[0] - camera.position.x,
        dz = item.at[2] - camera.position.z;
      const distance = Math.hypot(dx, dz);
      if (distance < radius && (dx * x + dz * z) / distance > -0.05) {
        next = item;
        radius = distance;
      }
    }
    if (next !== current.current) {
      current.current = next;
      onNearby(next);
    }
    if (keys.size) invalidate();
  });
  return null;
}

function ContextWatch({ onError }: { onError: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const listener = (event: Event) => {
      event.preventDefault();
      onError();
    };
    canvas.addEventListener("webglcontextlost", listener);
    return () => canvas.removeEventListener("webglcontextlost", listener);
  }, [gl, onError]);
  return null;
}

export default function WorkshopScene({
  selected,
  onSelect,
  walking,
  input,
  onNearby,
  onError,
}: {
  selected: string;
  onSelect: (item: Exhibit) => void;
  walking: boolean;
  input: React.RefObject<Set<string>>;
  onNearby: (item: Exhibit | null) => void;
  onError: () => void;
}) {
  return (
    <Canvas
      frameloop={walking ? "always" : "demand"}
      shadows
      dpr={[1, 1.4]}
      camera={{ position: [13.6, 12.5, 14.8], fov: 51, near: 0.1, far: 100 }}
      fallback={<p>3D unavailable. Choose a tool from the list below.</p>}
      onCreated={({ camera }) => camera.lookAt(0, 0, -2)}
    >
      <color attach="background" args={[backdrop]} />
      <fog attach="fog" args={[backdrop, 26, 60]} />
      <hemisphereLight args={["#dfedff", "#526181", 2.3]} />
      <directionalLight
        position={[-8, 14, 10]}
        color="#ffdec1"
        intensity={2.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={17}
        shadow-camera-bottom={-17}
        shadow-normalBias={0.023}
      />
      <directionalLight
        position={[10, 5, -10]}
        color="#83c9ed"
        intensity={0.85}
      />
      <Hall />
      {exhibits.map((item) => (
        <Pedestal
          key={item.id}
          item={item}
          active={item.id === selected}
          onSelect={() => onSelect(item)}
        />
      ))}
      {walking ? (
        <WalkCamera input={input} onNearby={onNearby} onInspect={onSelect} />
      ) : (
        <OrbitControls
          makeDefault
          target={[0, 0, -2]}
          minDistance={9}
          maxDistance={38}
          minPolarAngle={0.4}
          maxPolarAngle={1.35}
          enablePan={false}
          enableZoom={false}
          enableDamping={false}
        />
      )}
      <ContextWatch onError={onError} />
    </Canvas>
  );
}
