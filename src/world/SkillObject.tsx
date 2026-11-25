import { useEffect, useMemo, type ReactNode } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { Exhibit } from "../content/workshop";

type XYZ = [number, number, number];

const steel = "#9ba6b0";
const charcoal = "#252a31";
const porcelain = "#eee4d0";
const azure = "#397994";
const gopherBlue = "#69c9da";
const gopherTan = "#d8a47c";
const leftRight = [-1, 1];

function Block({
  at,
  size,
  color,
  metallic = 0.45,
  radius = 0.045,
}: {
  at: XYZ;
  size: XYZ;
  color: string;
  metallic?: number;
  radius?: number;
}) {
  return (
    <RoundedBox
      args={size}
      position={at}
      radius={radius}
      smoothness={3}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={color}
        metalness={metallic}
        roughness={0.34}
      />
    </RoundedBox>
  );
}

function Revolved({
  profile,
  children,
}: {
  profile: [number, number][];
  children: ReactNode;
}) {
  const points = useMemo(
    () => profile.map(([r, y]) => new THREE.Vector2(r, y)),
    [profile],
  );
  return (
    <mesh castShadow receiveShadow>
      <latheGeometry args={[points, 80]} />
      {children}
    </mesh>
  );
}

function Cable({
  points,
  radius,
  color,
  metalness = 0,
}: {
  points: XYZ[];
  radius: number;
  color: string;
  metalness?: number;
}) {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        points.map((point) => new THREE.Vector3(...point)),
      ),
    [points],
  );
  return (
    <mesh castShadow>
      <tubeGeometry args={[curve, 42, radius, 16, false]} />
      <meshPhysicalMaterial
        color={color}
        metalness={metalness}
        roughness={0.3}
        clearcoat={0.45}
      />
    </mesh>
  );
}

const saucer: [number, number][] = [
  [0, 0.02],
  [0.57, 0.02],
  [0.64, 0.031],
  [0.86, 0.06],
  [1.02, 0.113],
  [1.09, 0.153],
  [1.108, 0.18],
  [1.097, 0.207],
  [1.064, 0.22],
  [0.98, 0.187],
  [0.84, 0.142],
  [0.7, 0.113],
  [0.54, 0.104],
  [0, 0.104],
];
const cupShell: [number, number][] = [
  [0, 0.108],
  [0.48, 0.108],
  [0.514, 0.126],
  [0.52, 0.173],
  [0.571, 0.211],
  [0.629, 0.277],
  [0.677, 0.376],
  [0.717, 0.51],
  [0.744, 0.68],
  [0.761, 0.854],
  [0.767, 1.006],
  [0.766, 1.157],
  [0.756, 1.184],
  [0.737, 1.193],
];
const cupWall: [number, number][] = [
  [0.737, 1.193],
  [0.717, 1.179],
  [0.71, 1.157],
  [0.707, 1],
  [0.695, 0.847],
  [0.678, 0.7],
  [0.649, 0.53],
  [0.594, 0.386],
  [0.503, 0.294],
  [0.407, 0.272],
  [0, 0.272],
];
const cupHandle: XYZ[] = [
  [0.72, 1.01, 0],
  [0.91, 1.018, 0],
  [1.085, 0.925, 0],
  [1.147, 0.752, 0],
  [1.112, 0.574, 0],
  [0.968, 0.429, 0],
  [0.678, 0.377, 0],
];
const spoonHandle: XYZ[] = [
  [1.2, 0.048, -0.34],
  [1.23, 0.057, -0.14],
  [1.25, 0.058, 0.1],
  [1.25, 0.061, 0.36],
  [1.23, 0.066, 0.56],
];
const spoonBowl: [number, number][] = [
  [0, 0],
  [0.052, 0.008],
  [0.083, 0.023],
  [0.101, 0.046],
  [0.092, 0.048],
  [0.074, 0.03],
  [0.044, 0.017],
  [0, 0.012],
];

function CoffeeCup() {
  const crema = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const context = canvas.getContext("2d");
    if (!context) return null;
    const pixels = context.createImageData(256, 256);
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++) {
        const u = (x - 128) / 128;
        const v = (y - 128) / 128;
        const r = Math.hypot(u, v);
        const angle = Math.atan2(v, u);
        const curl = Math.sin(24 * r - 2.6 * angle + 4 * Math.sin(5 * v + u));
        const edge = THREE.MathUtils.smoothstep(
          r + 0.04 * Math.sin(angle * 17),
          0.76,
          1,
        );
        const grain = Math.sin(x * 12.9 + y * 78.2) * 3.7;
        const foam = Math.max(0, curl) * (0.075 + 0.15 * edge) + edge * 0.58;
        const offset = (y * 256 + x) * 4;
        pixels.data.set(
          [
            63 + 143 * foam + grain,
            31 + 96 * foam + grain,
            15 + 55 * foam,
            255,
          ],
          offset,
        );
      }
    }
    context.putImageData(pixels, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
  useEffect(() => () => crema?.dispose(), [crema]);
  return (
    <group rotation-y={-0.26}>
      <Revolved profile={saucer}>
        <meshPhysicalMaterial
          color={porcelain}
          roughness={0.24}
          clearcoat={0.78}
          clearcoatRoughness={0.17}
        />
      </Revolved>
      <Revolved profile={cupShell}>
        <meshPhysicalMaterial
          color="#a64e33"
          roughness={0.27}
          clearcoat={0.88}
          clearcoatRoughness={0.15}
        />
      </Revolved>
      <Revolved profile={cupWall}>
        <meshPhysicalMaterial
          color={porcelain}
          roughness={0.25}
          clearcoat={0.84}
        />
      </Revolved>
      <Cable points={cupHandle} radius={0.079} color="#a64e33" />
      <mesh position-y={1.045} rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[0.714, 80]} />
        <meshPhysicalMaterial
          color={crema ? "#fff" : "#633622"}
          map={crema}
          roughness={0.31}
          clearcoat={0.36}
        />
      </mesh>
      <Cable
        points={spoonHandle}
        radius={0.027}
        color="#cfd1ce"
        metalness={0.94}
      />
      <group position={[1.205, 0.014, -0.48]} scale-z={1.58}>
        <Revolved profile={spoonBowl}>
          <meshPhysicalMaterial
            color="#d4d5d5"
            roughness={0.17}
            metalness={0.95}
          />
        </Revolved>
      </group>
    </group>
  );
}

function Ring({
  radius,
  tube,
  color,
}: {
  radius: number;
  tube: number;
  color: string;
}) {
  return (
    <mesh castShadow receiveShadow>
      <torusGeometry args={[radius, tube, 16, 64]} />
      <meshStandardMaterial color={color} roughness={0.25} metalness={0.87} />
    </mesh>
  );
}

const gopherBody: [number, number][] = [
  [0, 0.085],
  [0.35, 0.085],
  [0.52, 0.127],
  [0.64, 0.234],
  [0.699, 0.406],
  [0.716, 0.633],
  [0.715, 0.87],
  [0.699, 1.114],
  [0.676, 1.36],
  [0.663, 1.57],
  [0.625, 1.755],
  [0.544, 1.9],
  [0.405, 2.004],
  [0.225, 2.062],
  [0, 2.077],
];

function Vinyl({
  at,
  size,
  color,
  tilt = 0,
  roughness = 0.4,
}: {
  at: XYZ;
  size: XYZ;
  color: string;
  tilt?: number;
  roughness?: number;
}) {
  return (
    <mesh position={at} scale={size} rotation-z={tilt} castShadow>
      <sphereGeometry args={[1, 40, 24]} />
      <meshPhysicalMaterial
        color={color}
        roughness={roughness}
        clearcoat={0.37}
        clearcoatRoughness={0.24}
      />
    </mesh>
  );
}

function GoGopher() {
  return (
    <group rotation-y={0.1}>
      <group scale-z={0.79}>
        <Revolved profile={gopherBody}>
          <meshPhysicalMaterial
            color={gopherBlue}
            roughness={0.36}
            clearcoat={0.47}
            clearcoatRoughness={0.26}
          />
        </Revolved>
      </group>
      <Vinyl
        at={[-0.64, 0.25, -0.43]}
        size={[0.23, 0.09, 0.15]}
        color={gopherBlue}
        tilt={0.37}
      />
      {leftRight.map((side) => (
        <group key={side}>
          <Vinyl
            at={[side * 0.565, 1.848, 0.035]}
            size={[0.225, 0.224, 0.133]}
            color={gopherBlue}
            tilt={-side * 0.35}
          />
          <Vinyl
            at={[side * 0.594, 1.865, 0.135]}
            size={[0.132, 0.126, 0.046]}
            color="#39798b"
          />
          <Vinyl
            at={[side * 0.35, 1.541 + side * 0.035, 0.472]}
            size={[0.306, 0.344, 0.189]}
            color="#f8f4ec"
            roughness={0.26}
          />
          <Vinyl
            at={[side * 0.34 + 0.035, 1.559 + side * 0.035, 0.632]}
            size={[0.077, 0.106, 0.045]}
            color="#241c20"
            roughness={0.18}
          />
          <Vinyl
            at={[side * 0.358, 0.083, 0.343]}
            size={[0.197, 0.083, 0.199]}
            color={gopherTan}
            tilt={side * 0.16}
          />
          <Vinyl
            at={[side * 0.69, 0.83, 0.081]}
            size={[0.129, 0.252, 0.121]}
            color={gopherBlue}
            tilt={side * 0.28}
          />
          <Vinyl
            at={[side * 0.754, 0.65, 0.126]}
            size={[0.091, 0.102, 0.084]}
            color={gopherTan}
            tilt={side * 0.28}
          />
          <Block
            at={[side * 0.068, 1.129, 0.631]}
            size={[0.123, 0.17, 0.105]}
            color="#fffaf0"
            metallic={0}
            radius={0.024}
          />
        </group>
      ))}
      <Vinyl
        at={[0, 1.279, 0.548]}
        size={[0.233, 0.141, 0.138]}
        color="#dfac85"
      />
      <Vinyl
        at={[0, 1.367, 0.657]}
        size={[0.119, 0.086, 0.073]}
        color="#262022"
        roughness={0.22}
      />
    </group>
  );
}

const leafShape = new THREE.Shape();
leafShape.moveTo(0, 0);
leafShape.bezierCurveTo(-0.81, 0.38, -0.87, 1.31, 0.32, 1.83);
leafShape.bezierCurveTo(0.85, 1.12, 0.9, 0.49, 0, 0);
const leafStem: XYZ[] = [
  [-0.11, -0.24, 0.012],
  [0.03, 0.21, 0.018],
  [0.175, 0.76, 0.023],
  [0.22, 1.3, 0.02],
  [0.32, 1.79, 0.013],
];

function Leaf() {
  return (
    <group>
      <Block at={[0, 0.115, 0]} size={[1.47, 0.23, 0.82]} color="#8c9389" />
      <group position={[-0.18, 0.39, 0.14]} rotation={[-0.28, 0.09, -0.2]}>
        <mesh castShadow receiveShadow>
          <extrudeGeometry
            args={[
              leafShape,
              {
                depth: 0.017,
                bevelThickness: 0.018,
                bevelSize: 0.025,
                bevelSegments: 3,
                steps: 1,
                curveSegments: 48,
              },
            ]}
          />
          <meshPhysicalMaterial
            color="#51824c"
            roughness={0.48}
            clearcoat={0.31}
          />
        </mesh>
        <Cable points={leafStem} radius={0.025} color="#a1b977" />
        {[0.42, 0.65, 0.9, 1.19, 1.41].map((height, index) => (
          <group key={height}>
            {leftRight.map((side) => (
              <Cable
                key={side}
                points={[
                  [0.1 + index * 0.025, height, 0.039],
                  [0.1 + side * (0.26 - index * 0.021), height + 0.15, 0.038],
                  [0.095 + side * (0.43 - index * 0.047), height + 0.27, 0.032],
                ]}
                radius={0.008}
                color="#94b47a"
              />
            ))}
          </group>
        ))}
      </group>
    </group>
  );
}

function Drive() {
  return (
    <group rotation-y={-0.18}>
      <Block at={[0, 0.15, 0]} size={[1.76, 0.3, 2.21]} color={charcoal} />
      <Block at={[0, 0.308, 0]} size={[1.65, 0.09, 2.1]} color="#65707a" />
      <group position={[0, 0.382, -0.22]} rotation-x={-Math.PI / 2}>
        <mesh receiveShadow>
          <circleGeometry args={[0.66, 64]} />
          <meshStandardMaterial
            color="#b0bac7"
            metalness={0.98}
            roughness={0.21}
          />
        </mesh>
        {[0.31, 0.515, 0.643].map((radius) => (
          <Ring key={radius} radius={radius} tube={0.005} color="#d6dee2" />
        ))}
        <group position-z={0.045}>
          <Ring radius={0.13} tube={0.038} color="#9da9ac" />
        </group>
      </group>
      <group position={[0.57, 0.45, 0.68]} rotation-y={0.42}>
        <mesh castShadow>
          <cylinderGeometry args={[0.148, 0.169, 0.16, 28]} />
          <meshStandardMaterial
            color={steel}
            metalness={0.81}
            roughness={0.3}
          />
        </mesh>
        <Block at={[0, 0, -0.31]} size={[0.115, 0.044, 0.68]} color="#bdc7d2" />
      </group>
      {leftRight.flatMap((x) =>
        leftRight.map((z) => (
          <mesh
            key={`${x}/${z}`}
            position={[x * 0.75, 0.367, z * 0.963]}
            rotation-x={-Math.PI / 2}
          >
            <circleGeometry args={[0.042, 16]} />
            <meshStandardMaterial color="#293238" metalness={0.6} />
          </mesh>
        )),
      )}
    </group>
  );
}

function Memory() {
  return (
    <group rotation={[-0.76, 0.04, -0.1]} position={[0, 0.51, 0]}>
      <Block
        at={[0, 0, 0]}
        size={[2.15, 1, 0.085]}
        color="#485f49"
        metallic={0.1}
      />
      {[-0.75, -0.25, 0.25, 0.75].map((x) => (
        <group key={x}>
          <Block
            at={[x, 0.035, 0.077]}
            size={[0.37, 0.43, 0.12]}
            color={charcoal}
          />
          {Array.from({ length: 8 }, (_, index) => (
            <Block
              key={index}
              at={[x + (index - 3.5) * 0.042, -0.393, 0.05]}
              size={[0.023, 0.153, 0.016]}
              color="#cfac67"
              metallic={0.77}
              radius={0.003}
            />
          ))}
        </group>
      ))}
    </group>
  );
}

function Container() {
  return (
    <group rotation-y={-0.28}>
      <Block
        at={[0, 0.64, 0]}
        size={[2.22, 1.27, 1.27]}
        color="#39677b"
        radius={0.034}
      />
      {Array.from({ length: 13 }, (_, index) => (
        <Block
          key={index}
          at={[(index - 6) * 0.161, 0.65, 0.649]}
          size={[0.055, 1.09, 0.062]}
          color={azure}
          radius={0.009}
        />
      ))}
      {leftRight.map((side) => (
        <group key={side}>
          <Block
            at={[0, 0.64 + side * 0.566, 0.669]}
            size={[2.23, 0.11, 0.095]}
            color="#527c8b"
          />
          <Block
            at={[side * 1.065, 0.64, 0.668]}
            size={[0.121, 1.24, 0.098]}
            color="#527c8b"
          />
          <Block
            at={[1.136, 0.65, side * 0.31]}
            size={[0.038, 1.1, 0.57]}
            color="#547e90"
          />
          <Block
            at={[1.171, 0.64, side * 0.17]}
            size={[0.035, 1.09, 0.04]}
            color={steel}
            radius={0.009}
          />
          <Block
            at={[1.175, 0.58, side * 0.258]}
            size={[0.04, 0.037, 0.187]}
            color={steel}
            radius={0.009}
          />
        </group>
      ))}
    </group>
  );
}

const interfaceCables: XYZ[][] = [
  [
    [0.27, 0.27, 0.53],
    [0.29, 0.23, 0.86],
    [0.55, 0.12, 1.03],
    [0.83, 0.08, 1.08],
    [1.17, 0.085, 0.97],
  ],
  [
    [-0.46, 0.27, 0.53],
    [-0.48, 0.25, 0.81],
    [-0.69, 0.14, 0.99],
    [-0.96, 0.09, 0.99],
    [-1.19, 0.075, 0.79],
  ],
];

function Networking({ hub }: { hub: boolean }) {
  const levels = hub ? [0.23] : [0.225, 0.69, 1.155];
  return (
    <group rotation-y={hub ? 0.17 : -0.2}>
      {levels.map((height) => (
        <group key={height} position-y={height}>
          <Block
            at={[0, 0, 0]}
            size={[2.17, 0.4, 1.15]}
            color={hub ? "#818487" : "#565e67"}
          />
          <Block at={[0, 0, 0.56]} size={[2.09, 0.3, 0.072]} color={charcoal} />
          {[-0.79, -0.53, -0.27, -0.01, 0.25, 0.51].map((x) => (
            <group key={x} position-x={x}>
              <Block
                at={[0, -0.024, 0.601]}
                size={[0.183, 0.118, 0.028]}
                color={steel}
                radius={0.01}
              />
              <Block
                at={[0, -0.025, 0.618]}
                size={[0.138, 0.077, 0.014]}
                color="#14191e"
                radius={0.006}
              />
              <mesh position={[0, 0.087, 0.606]}>
                <boxGeometry args={[0.042, 0.018, 0.016]} />
                <meshStandardMaterial
                  color={x > 0.35 ? "#a19f76" : "#9ec182"}
                  emissive="#6d9d5c"
                  emissiveIntensity={x > 0.35 ? 0.12 : 0.75}
                />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      {hub &&
        interfaceCables.map((points, index) => (
          <group key={index}>
            <Cable
              points={points}
              radius={0.033}
              color={index === 0 ? "#93876e" : charcoal}
            />
            <Block
              at={[points[0][0], 0.244, 0.644]}
              size={[0.118, 0.087, 0.169]}
              color={steel}
            />
            <Block at={points[4]} size={[0.144, 0.094, 0.112]} color={steel} />
          </group>
        ))}
    </group>
  );
}

export default function SkillObject({ item }: { item: Exhibit }) {
  switch (item.id) {
    case "java":
      return <CoffeeCup />;
    case "go":
      return <GoGopher />;
    case "spring":
      return <Leaf />;
    case "sql":
      return <Drive />;
    case "redis":
      return <Memory />;
    case "docker":
      return <Container />;
    default:
      return <Networking hub={item.id === "mcp"} />;
  }
}
