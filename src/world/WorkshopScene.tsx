import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, Lightformer, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { exhibits, type Exhibit } from "../content/workshop";
import SkillObject from "./SkillObject";

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
      <group position-y={0.38} scale={0.76}>
        <SkillObject item={item} />
      </group>
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

function Studio({ item, active }: { item: Exhibit; active: boolean }) {
  const { camera, size, invalidate } = useThree();
  const turntable = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  useEffect(() => {
    const compact = size.width < 650;
    camera.position.set(
      compact ? 2.45 : 2.1,
      compact ? 3.6 : 3.15,
      compact ? 6.55 : 5.7,
    );
    camera.lookAt(0, compact ? 0.69 : 0.71, 0);
    invalidate();
  }, [camera, size.width, invalidate]);
  useEffect(() => {
    if (active) invalidate();
  }, [active, invalidate]);
  useFrame((_, dt) => {
    if (!active || elapsed.current >= 0.75) return;
    elapsed.current += Math.min(dt, 0.05);
    const turn = 1 - Math.min(elapsed.current / 0.75, 1);
    if (turntable.current) {
      turntable.current.rotation.y = -0.85 * turn ** 3;
    }
    if (turn > 0) invalidate();
  });
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.051} receiveShadow>
        <planeGeometry args={[150, 150]} />
        <meshStandardMaterial color="#d2c9bb" roughness={0.91} />
      </mesh>
      <mesh position-y={0.05} castShadow receiveShadow>
        <cylinderGeometry args={[1.68, 1.76, 0.2, 96]} />
        <meshStandardMaterial
          color="#8b8175"
          metalness={0.15}
          roughness={0.63}
        />
      </mesh>
      <mesh position-y={0.152} castShadow receiveShadow>
        <cylinderGeometry args={[1.67, 1.68, 0.042, 96]} />
        <meshStandardMaterial color="#b9ac99" roughness={0.52} />
      </mesh>
      <group ref={turntable} position-y={0.174} rotation-y={-0.85}>
        <SkillObject item={item} />
      </group>
    </>
  );
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
  active,
  input,
  onNearby,
  onError,
}: {
  selected: string;
  onSelect: (item: Exhibit) => void;
  walking: boolean;
  active: boolean;
  input: React.RefObject<Set<string>>;
  onNearby: (item: Exhibit | null) => void;
  onError: () => void;
}) {
  const item =
    exhibits.find((exhibit) => exhibit.id === selected) ?? exhibits[0];
  return (
    <Canvas
      frameloop={walking ? "always" : "demand"}
      shadows={{ type: THREE.PCFShadowMap }}
      dpr={[1, 1.4]}
      camera={{
        position: [13.6, 12.5, 14.8],
        fov: walking ? 51 : 35,
        near: 0.1,
        far: 100,
      }}
      fallback={<p>3D unavailable. Choose a tool from the list below.</p>}
    >
      <color attach="background" args={[walking ? backdrop : "#d2c9bb"]} />
      <fog
        attach="fog"
        args={walking ? [backdrop, 26, 60] : ["#d2c9bb", 10, 34]}
      />
      <hemisphereLight
        args={
          walking ? ["#dfedff", "#526181", 2.3] : ["#fff8ed", "#827a6f", 1.1]
        }
      />
      <directionalLight
        position={walking ? [-8, 14, 10] : [-3.8, 7, 4.2]}
        color={walking ? "#ffdec1" : "#fff1da"}
        intensity={walking ? 2.4 : 2.2}
        castShadow
        shadow-mapSize={[1536, 1536]}
        shadow-camera-left={walking ? -16 : -4.4}
        shadow-camera-right={walking ? 16 : 4.4}
        shadow-camera-top={walking ? 17 : 4.4}
        shadow-camera-bottom={walking ? -17 : -4.4}
        shadow-normalBias={walking ? 0.023 : 0.009}
        shadow-radius={4}
      />
      <directionalLight
        position={[5, 4, -5]}
        color={walking ? "#83c9ed" : "#e6eeff"}
        intensity={walking ? 0.85 : 0.63}
      />
      {!walking && (
        <Environment resolution={128}>
          <color attach="background" args={["#766d61"]} />
          <Lightformer
            position={[-3, 4, 3]}
            rotation={[0.35, 0.45, 0]}
            scale={[3.7, 2.8, 1]}
            intensity={3.8}
            color="#fff0dc"
          />
          <Lightformer
            position={[3.5, 2.6, -2.7]}
            rotation={[0, -0.86, 0]}
            scale={[2.2, 4, 1]}
            intensity={2.0}
            color="#e8efff"
          />
          <Lightformer
            position={[0, 5, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[3.5, 4.3, 1]}
            intensity={2.9}
          />
        </Environment>
      )}
      {walking ? (
        <>
          <Hall />
          {exhibits.map((exhibit) => (
            <Pedestal
              key={exhibit.id}
              item={exhibit}
              active={exhibit.id === selected}
              onSelect={() => onSelect(exhibit)}
            />
          ))}
          <WalkCamera input={input} onNearby={onNearby} onInspect={onSelect} />
        </>
      ) : (
        <Studio key={item.id} item={item} active={active} />
      )}
      <ContextWatch onError={onError} />
    </Canvas>
  );
}
