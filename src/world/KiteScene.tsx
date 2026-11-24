import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { rooftops, type Rooftop, type FlightKey } from "../content/kite";

type V3 = [number, number, number];
type Piece = { at: V3; size: V3; color: string; turn?: number };
const sling = new THREE.Vector3(2.9, 6.3, 5.4);
const launch = [4.3, 13.5, 5] as const;
const sand = [
  "#d28362",
  "#edaa79",
  "#e39c73",
  "#ca765c",
  "#f2b78a",
  "#c98e77",
  "#d88379",
  "#dda376",
];
const edge = "#efbd95";
function seed(n: number) {
  const x = Math.sin(n * 32.198 + 18.125) * 45991.358;
  return x - Math.floor(x);
}
function Range({ pieces }: { pieces: Piece[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const item = new THREE.Object3D(),
      color = new THREE.Color();
    pieces.forEach(({ at, size, color: hex, turn }, i) => {
      item.position.set(...at);
      item.scale.set(...size);
      item.rotation.y = turn ?? 0;
      item.updateMatrix();
      mesh.setMatrixAt(i, item.matrix);
      mesh.setColorAt(i, color.set(hex));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [pieces]);
  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, pieces.length]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ffffff" roughness={0.84} />
    </instancedMesh>
  );
}
function City() {
  const pieces = useMemo<Piece[]>(() => {
    const all: Piece[] = [];
    const box = (
      x: number,
      y: number,
      z: number,
      w: number,
      h: number,
      d: number,
      c: string,
      turn?: number,
    ) => all.push({ at: [x, y, z], size: [w, h, d], color: c, turn });
    for (let row = 0; row < 18; row++)
      for (let col = 0; col < 17; col++) {
        const i = row * 17 + col + 1;
        if (seed(i + 84) < 0.11 || (col === 8 && row % 3 !== 0)) continue;
        const x = (col - 8) * 7.3 + (seed(i + 18) - 0.5) * 1.3,
          z = 12 - row * 7.25 + (seed(i + 77) - 0.5) * 1.5;
        if (Math.hypot(x - 4, z - 5) < 9) continue;
        if (rooftops.some((r) => Math.hypot(x - r.at[0], z - r.at[2]) < 5.9))
          continue;
        const w = 3.4 + seed(i + 27) * 2.5,
          d = 3.4 + seed(i + 7) * 2.7,
          h = 2.7 + seed(i + 44) * 5.05;
        const c = sand[Math.floor(seed(i) * sand.length)];
        box(x, h / 2, z, w, h, d, c);
        box(x, h - 0.02, z, w + 0.29, 0.22, d + 0.29, edge);
        for (const sign of [-1, 1]) {
          box(x, h + 0.27, z + sign * d * 0.48, w, 0.55, 0.18, c);
          box(x + sign * w * 0.49, h + 0.27, z, 0.17, 0.55, d, c);
        }
        const windowColor = seed(i + 220) > 0.69 ? "#a55f54" : "#69485e";
        for (let level = 1; level < (h > 5.4 ? 3 : 2); level++) {
          for (const o of [-0.24, 0, 0.24]) {
            box(
              x + w * o,
              (h * level) / 3,
              z + d / 2 + 0.018,
              0.46,
              0.7,
              0.05,
              windowColor,
            );
            box(
              x + w * o,
              (h * level) / 3 - 0.41,
              z + d / 2 + 0.09,
              0.65,
              0.1,
              0.2,
              edge,
            );
          }
        }
        if (seed(i + 113) > 0.56) {
          box(
            x + w * 0.19,
            h + 0.8,
            z - d * 0.13,
            w * 0.48,
            1.6,
            d * 0.45,
            sand[(i + 1) % sand.length],
          );
          box(
            x + w * 0.19,
            h + 1.62,
            z - d * 0.13,
            w * 0.52,
            0.16,
            d * 0.49,
            edge,
          );
        }
        if (seed(i + 13) > 0.65) {
          box(x - 0.75, h + 0.51, z + 0.5, 1.1, 1.02, 0.83, "#6b8592");
          box(x - 0.75, h + 1.04, z + 0.5, 1.17, 0.1, 0.9, "#94a4a7");
        }
      }
    box(3, 2.85, 5.5, 10.4, 5.7, 9.8, "#cb866a");
    box(3, 5.75, 5.5, 10.63, 0.24, 10.06, "#f5be9a");
    for (const d of [-1, 1]) {
      box(3, 6.15, 5.5 + d * 4.9, 10.4, 0.65, 0.22, "#dd977a");
      box(3 + d * 5.18, 6.15, 5.5, 0.22, 0.65, 9.8, "#dd977a");
      for (let j = 0; j < 11; j++)
        box(3 + j * 0.93 - 4.65, 6.59, 5.5 + d * 4.9, 0.37, 0.32, 0.31, edge);
    }
    box(2.9, 5.99, 5.4, 0.85, 0.4, 0.81, "#694f5e");
    box(2.9, 6.26, 5.4, 1.08, 0.18, 1.08, "#b98c7c");
    return all;
  }, []);
  return (
    <>
      <Range pieces={pieces} />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.04, -44]}
        receiveShadow
      >
        <planeGeometry args={[680, 680]} />
        <meshStandardMaterial color="#be917c" roughness={1} />
      </mesh>
    </>
  );
}
const skyVert = `varying vec3 direction; void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const skyFrag = `
varying vec3 direction;
float hash(vec2 uv){return fract(sin(dot(uv,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
void main(){
  vec3 v=normalize(direction);float h=max(0.,v.y);
  vec3 col=mix(vec3(.96,.54,.40),vec3(.29,.38,.58),smoothstep(0.,.65,h));
  vec3 sun=normalize(vec3(-.29,.145,-.96));float ray=max(0.,dot(v,sun));
  col+=vec3(.35,.19,.08)*pow(ray,21.);
  float solar=smoothstep(.99735,.99785,ray);
  col=mix(col,vec3(1.,.88,.65),solar);
  vec2 uv=(v.xz/(.45+h))*6.;
  float n=noise(uv*vec2(2.,3.))+noise(uv*vec2(3.5,7.))*.45;
  float clouds=smoothstep(.87,1.18,n)*(1.-smoothstep(.25,.61,h))*smoothstep(.052,.2,h);
  col=mix(col,vec3(.70,.40,.48)+pow(ray,4.)*.19,clouds*.56);
  gl_FragColor=vec4(col,1.);
  #include <colorspace_fragment>
}
`;
function Atmosphere() {
  const hills = useMemo(() => {
    const geo = new THREE.PlaneGeometry(320, 90, 36, 13);
    geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position;
    const colors: number[] = [];
    const c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        z = p.getZ(i);
      const roll = Math.sin(x * 0.043 + z * 0.067) * Math.cos(z * 0.067);
      const height = Math.max(0, roll * 20 + 7 + Math.sin(x * 0.095) * 4);
      p.setY(i, height * (1 - Math.abs(z) / 58) - 2);
      c.set("#826d86").lerp(
        new THREE.Color("#bf9292"),
        Math.min(1, height / 27),
      );
      colors.push(c.r, c.g, c.b);
    }
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);
  useEffect(() => () => hills.dispose(), [hills]);
  return (
    <>
      <mesh>
        <sphereGeometry args={[245, 32, 24]} />
        <shaderMaterial
          side={THREE.BackSide}
          vertexShader={skyVert}
          fragmentShader={skyFrag}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[1, -1, -128]} geometry={hills}>
        <meshStandardMaterial vertexColors roughness={1} flatShading />
      </mesh>
    </>
  );
}

function RoofLandmark({ roof, seen }: { roof: Rooftop; seen: boolean }) {
  const [x, y, z] = roof.at;
  const pieces = useMemo<Piece[]>(() => {
    const p: Piece[] = [];
    const box = (at: V3, size: V3, color: string) =>
      p.push({ at, size, color });
    const h = y - 5.9;
    box([x, h / 2, z], [6.7, h, 6.7], "#c57768");
    box([x, h + 0.05, z], [7, 0.28, 7], "#f5c09a");
    for (const side of [-1, 1]) {
      box([x + side * 3.4, h + 0.34, z], [0.21, 0.59, 6.8], "#e9ac91");
      box([x, h + 0.34, z + side * 3.4], [6.8, 0.59, 0.21], "#e9ac91");
      for (let i = 0; i < 6; i++)
        box(
          [x - 2.76 + i * 1.1, h + 0.77, z + side * 3.4],
          [0.42, 0.26, 0.38],
          "#f2c3a0",
        );
    }
    for (const a of [-1, 1])
      for (const b of [-1, 1]) {
        box(
          [x + a * 2.28, h + 1.08, z + b * 2.15],
          [0.31, 2.1, 0.31],
          "#eeb393",
        );
        box(
          [x + a * 2.28, h + 2.18, z + b * 2.15],
          [0.73, 0.22, 0.73],
          roof.color,
        );
      }
    if (roof.id === "skills") {
      for (const [t, tall] of [
        [-1, 1.1],
        [0, 1.58],
        [1, 1.2],
      ] as const) {
        box([x + t * 1.08, h + tall / 2, z], [0.79, tall, 1.7], "#556e7d");
        box([x + t * 1.08, h + tall + 0.09, z], [0.87, 0.15, 1.78], roof.color);
      }
    } else if (roof.id === "work") {
      box([x, h + 1.46, z - 1.08], [4.04, 1.97, 0.28], "#9c5f6f");
      box([x, h + 1.51, z - 0.92], [3.67, 1.54, 0.06], "#ffcfaa");
      box([x, h + 0.31, z + 1.45], [3.0, 0.42, 0.54], "#785575");
    } else {
      box([x, h + 1.06, z], [3.65, 2.04, 2.85], "#9c6484");
      box([x, h + 2.12, z], [4.08, 0.22, 3.33], roof.color);
    }
    return p;
  }, [x, y, z, roof]);
  return (
    <>
      <Range pieces={pieces} />
      <group position={[x, y, z]}>
        <mesh rotation={[0, 0.24, 0]}>
          <torusGeometry args={[2.52, 0.105, 10, 54]} />
          <meshStandardMaterial
            color={roof.color}
            emissive={roof.color}
            emissiveIntensity={seen ? 0.42 : 1.25}
            roughness={0.34}
          />
        </mesh>
        <mesh rotation={[0, 0.24, 0]}>
          <ringGeometry args={[2.55, 2.8, 54]} />
          <meshBasicMaterial
            color={roof.color}
            side={THREE.DoubleSide}
            transparent
            opacity={0.14}
            depthWrite={false}
          />
        </mesh>
        <Html center position={[0, 3, 0]} zIndexRange={[8, 1]}>
          <span className="kite-waypoint" style={{ borderColor: roof.color }}>
            {seen ? "✓ " : ""}
            {roof.name}
          </span>
        </Html>
      </group>
    </>
  );
}

function KiteModel() {
  const cloth = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const a = [0, 1.35, 0],
      b = [-1.01, 0.09, 0],
      c = [0, -1.2, 0],
      d = [1.01, 0.09, 0],
      m = [0, 0.1, 0.16];
    const positions = [
      ...a,
      ...b,
      ...m,
      ...b,
      ...c,
      ...m,
      ...c,
      ...d,
      ...m,
      ...d,
      ...a,
      ...m,
    ];
    const colors: number[] = [];
    for (const hex of ["#fff0d8", "#ffaf72", "#5cccc7", "#194d65"]) {
      const color = new THREE.Color(hex);
      for (let i = 0; i < 3; i++) colors.push(color.r, color.g, color.b);
    }
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => () => cloth.dispose(), [cloth]);
  const ribbon = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    ribbon.current?.children.forEach((part, i) => {
      part.position.x =
        Math.sin(clock.elapsedTime * 4 - i * 0.65) * (0.08 + i * 0.045);
      part.rotation.z = Math.sin(clock.elapsedTime * 4 - i * 0.65) * 0.5;
    });
  });
  return (
    <>
      <mesh geometry={cloth} castShadow>
        <meshStandardMaterial
          vertexColors
          side={THREE.DoubleSide}
          roughness={0.7}
        />
      </mesh>
      <mesh position={[0, 0.1, -0.028]}>
        <boxGeometry args={[0.034, 2.5, 0.035]} />
        <meshStandardMaterial color="#f6ce9c" />
      </mesh>
      <mesh position={[0, 0.09, 0.019]}>
        <boxGeometry args={[1.93, 0.033, 0.034]} />
        <meshStandardMaterial color="#ffdbb2" />
      </mesh>
      <group ref={ribbon}>
        {Array.from({ length: 9 }, (_, i) => (
          <mesh key={i} position={[0, -1.19 - i * 0.23, 0.035 + i * 0.015]}>
            <planeGeometry args={[i % 3 === 0 ? 0.24 : 0.09, 0.28]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? "#fbc685" : "#dc8bb3"}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}

function FlightRig({
  flying,
  flight,
  keys,
  onDiscover,
  onTelemetry,
}: {
  flying: boolean;
  flight: number;
  keys: RefObject<Set<FlightKey>>;
  onDiscover: (roof: Rooftop) => void;
  onTelemetry: (value: {
    distance: number;
    altitude: number;
    gust: boolean;
  }) => void;
}) {
  const handle = useRef<THREE.Group>(null);
  const thread = useRef<THREE.Line<
    THREE.BufferGeometry,
    THREE.LineBasicMaterial
  > | null>(null);
  const frame = useRef(0),
    nextRead = useRef(0);
  const pos = useRef(new THREE.Vector3(...launch));
  const velocity = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector3(1, 8, -4));
  const look = useRef(target.current.clone());
  const camPoint = useRef(new THREE.Vector3());
  const found = useRef(new Set<string>());
  const boost = useRef(0);
  const { camera, invalidate, scene } = useThree();
  useEffect(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(60), 3),
    );
    const line = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({
        color: "#f8d8b0",
        transparent: true,
        opacity: 0.57,
      }),
    );
    line.frustumCulled = false;
    scene.add(line);
    thread.current = line;
    return () => {
      scene.remove(line);
      geometry.dispose();
      line.material.dispose();
      thread.current = null;
    };
  }, [scene]);
  useEffect(() => {
    pos.current.set(...launch);
    velocity.current.set(0, 0, 0);
    boost.current = 0;
    nextRead.current = 0;
    if (!flight) camera.position.set(22, 17.5, 32);
    invalidate();
  }, [flight, camera, invalidate]);

  useFrame(({ clock }, delta) => {
    if (!handle.current) return;
    const dt = Math.min(delta, 0.05),
      t = clock.elapsedTime,
      key = keys.current;
    frame.current += dt;
    if (flying) {
      const move = Number(key.has("right")) - Number(key.has("left"));
      const lift = Number(key.has("rise")) - Number(key.has("dive"));
      if (key.delete("gust") && boost.current <= 0) boost.current = 1.65;
      boost.current = Math.max(-0.9, boost.current - dt);
      const glow = boost.current > 0;
      const wind = Math.sin(pos.current.z * 0.07 + t * 0.59) * 0.73;
      velocity.current.x = THREE.MathUtils.damp(
        velocity.current.x,
        move * 9.9 + wind,
        3.5,
        dt,
      );
      velocity.current.y = THREE.MathUtils.damp(
        velocity.current.y,
        lift * 6.5 + Math.sin(t * 1.05) * 0.37,
        3.4,
        dt,
      );
      velocity.current.z = THREE.MathUtils.damp(
        velocity.current.z,
        glow ? -11.8 : -6.3,
        1.9,
        dt,
      );
      pos.current.addScaledVector(velocity.current, dt);
      pos.current.x = THREE.MathUtils.clamp(pos.current.x, -31, 31);
      pos.current.y = THREE.MathUtils.clamp(pos.current.y, 8.5, 22);
      if (pos.current.z < -91) {
        pos.current.set(...launch);
        velocity.current.z = -3;
        camera.position.set(13, 18, 19);
      }
      camPoint.current.set(
        pos.current.x + 7.7,
        pos.current.y + 3.05,
        pos.current.z + 15.5,
      );
      target.current.set(
        pos.current.x - 0.95,
        pos.current.y - 2.05,
        pos.current.z - 5.6,
      );
      camera.position.lerp(camPoint.current, 1 - Math.exp(-dt * 2.2));
      for (const roof of rooftops) {
        if (found.current.has(roof.id)) continue;
        const [x, y, z] = roof.at;
        if (
          Math.abs(pos.current.z - z) < 3.1 &&
          Math.hypot(pos.current.x - x, pos.current.y - y) < 3.9
        ) {
          found.current.add(roof.id);
          onDiscover(roof);
        }
      }
      if (frame.current >= nextRead.current) {
        nextRead.current = frame.current + 0.16;
        onTelemetry({
          distance: Math.max(0, Math.round(launch[2] - pos.current.z)),
          altitude: Math.round(pos.current.y),
          gust: glow,
        });
      }
    } else if (!flight) {
      target.current.set(1, 8, -4);
      camera.position.set(22, 17.5, 32);
    }
    const kite = handle.current;
    kite.scale.setScalar(flight ? 1 : 1.22);
    kite.position.set(
      pos.current.x + 0.09 * Math.sin(t * 1.9),
      pos.current.y + 0.16 * Math.sin(t * 2),
      pos.current.z,
    );
    kite.rotation.set(
      -0.15 + velocity.current.y * 0.023,
      0.33 + Math.sin(t * 1.9) * 0.12,
      -velocity.current.x * 0.065 + Math.sin(t * 2.5) * 0.09,
    );
    look.current.lerp(target.current, 1 - Math.exp(-dt * 3.1));
    camera.lookAt(look.current);
    const points = thread.current?.geometry.getAttribute("position");
    if (points) {
      const far = Math.hypot(
        kite.position.x - sling.x,
        kite.position.z - sling.z,
      );
      for (let i = 0; i < points.count; i++) {
        const u = i / (points.count - 1);
        points.setXYZ(
          i,
          THREE.MathUtils.lerp(sling.x, kite.position.x, u) +
            Math.sin(u * Math.PI + t * 1.3) * Math.sin(u * Math.PI) * 0.5,
          THREE.MathUtils.lerp(sling.y, kite.position.y - 0.98, u) -
            Math.sin(u * Math.PI) * Math.min(2.4, far * 0.025),
          THREE.MathUtils.lerp(sling.z, kite.position.z, u),
        );
      }
      points.needsUpdate = true;
    }
  });
  return (
    <group ref={handle}>
      <KiteModel />
    </group>
  );
}
function Terraces() {
  return (
    <>
      {[
        [-18, 7.7, -11],
        [20, 8.5, -25],
        [-16, 10.2, -49],
        [3, 9.7, -74],
      ].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh position={[0, 0.06, 0]} castShadow>
            <cylinderGeometry args={[2.04, 2.05, 0.26, 8]} />
            <meshStandardMaterial color="#e3a683" />
          </mesh>
          {[-1, 1].flatMap((a) =>
            [-1, 1].map((b) => (
              <mesh
                key={`${a}:${b}`}
                position={[a * 1.06, 1.07, b * 1.06]}
                castShadow
              >
                <cylinderGeometry args={[0.12, 0.18, 1.89, 8]} />
                <meshStandardMaterial color="#f2c8a4" />
              </mesh>
            )),
          )}
          <mesh position={[0, 2.05, 0]} castShadow>
            <cylinderGeometry args={[1.95, 1.97, 0.27, 8]} />
            <meshStandardMaterial color="#a45f67" />
          </mesh>
          <mesh position={[0, 2.16, 0]} scale={[1, 0.65, 1]} castShadow>
            <sphereGeometry
              args={[1.58, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]}
            />
            <meshStandardMaterial color={i % 2 ? "#c88982" : "#dca58a"} />
          </mesh>
          <mesh position={[0, 3.31, 0]}>
            <coneGeometry args={[0.12, 0.42, 8]} />
            <meshStandardMaterial color="#f3c28c" />
          </mesh>
        </group>
      ))}
      {[-1, 1].map((side) => (
        <group key={side} position={[3 + side * 3.8, 6.16, 6.8]}>
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.35, 0.26, 0.56, 10]} />
            <meshStandardMaterial color="#947071" />
          </mesh>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh
              key={i}
              position={[(i - 2) * 0.105, 0.44 + (i % 2) * 0.11, 0]}
              rotation={[0.14 * i, 0, (i - 2) * 0.33]}
            >
              <coneGeometry args={[0.09, 0.57, 5]} />
              <meshStandardMaterial color={i % 2 ? "#839a89" : "#647c77"} />
            </mesh>
          ))}
        </group>
      ))}
      {Array.from({ length: 15 }, (_, i) => (
        <mesh
          key={i}
          position={[
            -0.8 + i * 0.48,
            7.25 - Math.sin((i / 14) * Math.PI) * 0.48,
            1.3,
          ]}
          rotation={[0.1, 0.08, i % 2 ? 0.16 : -0.15]}
        >
          <coneGeometry args={[0.21, 0.41, 3]} />
          <meshStandardMaterial
            color={["#e28785", "#ffe1a9", "#77c1b7", "#af90ae"][i % 4]}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}

function AmbientKites() {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const birds = useMemo(
    () =>
      Array.from({ length: 17 }, (_, i) => ({
        x: (seed(i + 2) - 0.5) * 100,
        y: 13 + seed(i + 33) * 21,
        z: -20 - seed(i + 84) * 83,
        scale: 0.2 + seed(i + 46) * 0.37,
        color: ["#e98181", "#89bfaa", "#f1ca83", "#bcabda"][i % 4],
      })),
    [],
  );
  useFrame(({ clock }) =>
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.position.x =
        birds[i].x + Math.sin(clock.elapsedTime * 0.6 + i) * 0.9;
      mesh.position.y =
        birds[i].y + Math.cos(clock.elapsedTime * 0.85 + i) * 0.4;
      mesh.rotation.z = 0.45 + Math.sin(clock.elapsedTime * 1.3 + i) * 0.25;
    }),
  );
  return (
    <>
      {birds.map((item, i) => (
        <mesh
          key={i}
          ref={(mesh) => {
            refs.current[i] = mesh;
          }}
          position={[item.x, item.y, item.z]}
          rotation={[0, 0.24, 0.45]}
          scale={item.scale}
        >
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial
            color={item.color}
            side={THREE.DoubleSide}
            roughness={0.8}
          />
        </mesh>
      ))}
    </>
  );
}
function SceneEvents({
  onReady,
  onError,
}: {
  onReady: () => void;
  onError: () => void;
}) {
  const { gl, camera } = useThree();
  useEffect(() => {
    camera.lookAt(1, 8, -4);
    const el = gl.domElement;
    const lost = (e: Event) => {
      e.preventDefault();
      onError();
    };
    el.addEventListener("webglcontextlost", lost);
    onReady();
    return () => el.removeEventListener("webglcontextlost", lost);
  }, [camera, gl, onReady, onError]);
  return null;
}
export default function KiteScene({
  flying,
  flight,
  active,
  keys,
  visited,
  onDiscover,
  onTelemetry,
  onReady,
  onError,
}: {
  flying: boolean;
  flight: number;
  active: boolean;
  keys: RefObject<Set<FlightKey>>;
  visited: string[];
  onDiscover: (roof: Rooftop) => void;
  onTelemetry: (value: {
    distance: number;
    altitude: number;
    gust: boolean;
  }) => void;
  onReady: () => void;
  onError: () => void;
}) {
  return (
    <Canvas
      camera={{ position: [22, 17.5, 32], fov: 46, near: 0.1, far: 460 }}
      shadows
      dpr={[1, 1.35]}
      frameloop={active ? "always" : "demand"}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ touchAction: "pan-y" }}
    >
      <fog attach="fog" args={["#d3a08c", 38, 175]} />
      <hemisphereLight args={["#fcdfd8", "#a07887", 2.25]} />
      <directionalLight
        position={[22, 18, -19]}
        color="#ffd0a1"
        intensity={3.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-normalBias={0.04}
      />
      <directionalLight
        position={[-19, 12, 16]}
        color="#91a8d9"
        intensity={0.5}
      />
      <Atmosphere />
      <City />
      <Terraces />
      <AmbientKites />
      {rooftops.map((roof) => (
        <RoofLandmark
          key={roof.id}
          roof={roof}
          seen={visited.includes(roof.id)}
        />
      ))}
      <FlightRig
        flying={flying}
        flight={flight}
        keys={keys}
        onDiscover={onDiscover}
        onTelemetry={onTelemetry}
      />
      <SceneEvents onError={onError} onReady={onReady} />
    </Canvas>
  );
}
