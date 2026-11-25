import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { landmarks, lake } from "../content/jaipur";

const rose = "#cf6d62",
  cream = "#f2c39d",
  shadow = "#673a4b",
  stone = "#e7b486";
type P = [number, number, number];
const square = new THREE.BoxGeometry(1, 1, 1);
const precalculated = new Map<string, THREE.ShapeGeometry>();
function Box({ at, size, color = rose }: { at: P; size: P; color?: string }) {
  return (
    <mesh geometry={square} scale={size} position={at} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.82} />
    </mesh>
  );
}
function archShape(w: number, h: number) {
  const key = `${w}/${h}`;
  let geo = precalculated.get(key);
  if (!geo) {
    const path = new THREE.Shape();
    path.moveTo(-w / 2, 0);
    path.lineTo(w / 2, 0);
    path.lineTo(w / 2, h * 0.54);
    path.quadraticCurveTo(w / 2, h * 0.85, 0, h);
    path.quadraticCurveTo(-w / 2, h * 0.85, -w / 2, h * 0.54);
    path.closePath();
    geo = new THREE.ShapeGeometry(path, 12);
    precalculated.set(key, geo);
  }
  return geo;
}
function Arch({
  at,
  w = 0.73,
  h = 1.05,
  tint = cream,
  door = shadow,
}: {
  at: P;
  w?: number;
  h?: number;
  tint?: string;
  door?: string;
}) {
  return (
    <group position={at}>
      <mesh geometry={archShape(w + 0.18, h + 0.13)}>
        <meshStandardMaterial color={tint} roughness={0.82} />
      </mesh>
      <mesh geometry={archShape(w, h)} position={[0, 0.028, 0.017]}>
        <meshStandardMaterial color={door} roughness={0.9} />
      </mesh>
      <Box at={[0, -0.055, 0.06]} size={[w + 0.23, 0.11, 0.26]} color={tint} />
    </group>
  );
}
function Dome({
  at,
  radius,
  color = stone,
}: {
  at: P;
  radius: number;
  color?: string;
}) {
  return (
    <group position={at}>
      <mesh castShadow position={[0, 0.19, 0]}>
        <cylinderGeometry args={[radius * 0.93, radius, 0.39, 12]} />
        <meshStandardMaterial color={cream} />
      </mesh>
      <mesh castShadow position={[0, 0.37, 0]} scale={[1, 0.74, 1]}>
        <sphereGeometry
          args={[radius, 15, 9, 0, Math.PI * 2, 0, Math.PI / 2]}
        />
        <meshStandardMaterial color={color} roughness={0.71} />
      </mesh>
      <mesh position={[0, 0.48 + radius * 0.74, 0]}>
        <coneGeometry args={[0.1 + radius * 0.037, 0.34, 8]} />
        <meshStandardMaterial color="#ebbc7a" />
      </mesh>
    </group>
  );
}
function Chhatri({
  at,
  r = 1.04,
  color = rose,
}: {
  at: P;
  r?: number;
  color?: string;
}) {
  return (
    <group position={at}>
      <Box at={[0, 0.1, 0]} size={[r * 2.04, 0.2, r * 2.04]} color={cream} />
      {[-1, 1].flatMap((a) =>
        [-1, 1].map((b) => (
          <Box
            key={`${a}/${b}`}
            at={[r * 0.72 * a, r * 0.55, r * 0.72 * b]}
            size={[0.19, r * 0.95, 0.19]}
            color={cream}
          />
        )),
      )}
      <Dome at={[0, r * 1.08, 0]} radius={r} color={color} />
    </group>
  );
}
function Hawa() {
  return (
    <>
      <Box at={[0, 0.38, 0]} size={[14, 0.76, 5.7]} color="#a85356" />
      {[0, 1, 2, 3, 4].map((level) => {
        const w = [13.5, 12.2, 10.1, 7.8, 5.25][level],
          z = [0, -0.18, -0.37, -0.58, -0.85][level],
          low = 0.65 + level * 2.08,
          depth = 5.35 - level * 0.42;
        const bays = [11, 10, 8, 6, 4][level];
        return (
          <group key={level} position={[0, low, z]}>
            <Box
              at={[0, 0.98, 0]}
              size={[w, 1.96, depth]}
              color={level % 2 ? "#da7d69" : "#cf6d62"}
            />
            <Box
              at={[0, 0.055, depth / 2]}
              size={[w + 0.22, 0.12, 0.25]}
              color={cream}
            />
            <Box
              at={[0, 1.83, depth / 2]}
              size={[w + 0.26, 0.15, 0.28]}
              color={cream}
            />
            {Array.from({ length: bays }, (_, i) => {
              const x = ((i - (bays - 1) / 2) * (w - 0.58)) / bays;
              return (
                <group key={i} position={[x, 0, depth / 2 + 0.055]}>
                  <Arch at={[0, 0.35, 0]} w={0.62} h={1.12} />
                  <Box
                    at={[-0.17, 0.78, 0.044]}
                    size={[0.025, 0.75, 0.04]}
                    color="#eab28a"
                  />
                  <Box
                    at={[0.17, 0.78, 0.044]}
                    size={[0.025, 0.75, 0.04]}
                    color="#eab28a"
                  />
                  <Box
                    at={[0, 0.74, 0.042]}
                    size={[0.52, 0.034, 0.04]}
                    color="#eab28a"
                  />
                  <Box
                    at={[0, 0.18, 0.12]}
                    size={[0.93, 0.105, 0.29]}
                    color="#e3a482"
                  />
                  <mesh
                    position={[0, 1.53, 0.09]}
                    scale={[1.1, 0.54, 0.65]}
                    castShadow
                  >
                    <sphereGeometry
                      args={[0.39, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]}
                    />
                    <meshStandardMaterial color="#e39a82" />
                  </mesh>
                </group>
              );
            })}
          </group>
        );
      })}
      {[-2.42, 0, 2.42].map((x) => (
        <Chhatri key={x} at={[x, 10.86, -0.44]} r={0.66} color="#dd8c77" />
      ))}
    </>
  );
}
function CityPalace() {
  return (
    <>
      <Box at={[0, 2.8, 0]} size={[14.2, 5.6, 8]} color="#b56765" />
      <Box at={[0, 5.62, 0]} size={[14.52, 0.28, 8.18]} color={cream} />
      <Box at={[0, 7, 0]} size={[8, 2.7, 5.2]} color="#d48476" />
      <Arch
        at={[0, 0.24, 4.07]}
        w={3.05}
        h={4.38}
        tint="#bacc9b"
        door="#4c454b"
      />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Box
            at={[s * 5.3, 3.1, 3.9]}
            size={[2.7, 6.2, 1.0]}
            color="#ce7c6e"
          />
          <Arch at={[s * 5.28, 1, 4.47]} w={1} h={1.63} />
          <Arch at={[s * 5.28, 3.22, 4.47]} w={1} h={1.63} />
          <Chhatri at={[s * 5.28, 6.3, 3.43]} r={1.06} color="#658c7f" />
        </group>
      ))}
      <Dome at={[0, 8.51, 0]} radius={2.03} color="#74988a" />
      {[-2.15, 0, 2.15].map((x) => (
        <Arch key={x} at={[x, 6, 2.65]} w={1.01} h={1.48} tint="#e8c398" />
      ))}
    </>
  );
}
function Jal() {
  return (
    <>
      <Box at={[0, 0.38, 0]} size={[12.2, 0.76, 7.15]} color="#9a786a" />
      <Box at={[0, 2.43, 0]} size={[11.83, 4.1, 6.9]} color="#deab77" />
      <Box at={[0, 4.54, 0]} size={[12.14, 0.24, 7.25]} color="#f4ca95" />
      <Box at={[0, 5.06, 0]} size={[7.1, 0.93, 4.43]} color="#e3b57c" />
      {[-1, 1].flatMap((a) =>
        [-1, 1].map((b) => (
          <Chhatri
            key={`${a}/${b}`}
            at={[a * 4.88, 4.65, b * 2.67]}
            r={1.03}
            color="#e2aa6d"
          />
        )),
      )}
      <Chhatri at={[0, 5.58, 0]} r={1.17} color="#e8b477" />
      {[-4.34, -2.89, -1.45, 0, 1.45, 2.89, 4.34].map((x) => (
        <group key={x}>
          <Arch at={[x, 1.28, 3.51]} w={0.83} h={1.05} tint="#e8bd94" />
          <Arch at={[x, 2.87, 3.51]} w={0.83} h={1.05} tint="#edc59f" />
        </group>
      ))}
    </>
  );
}
function Albert() {
  return (
    <>
      <Box at={[0, 2.02, 0]} size={[15.5, 4.03, 7.8]} color="#d6b4a4" />
      <Box at={[0, 4.12, 0]} size={[15.78, 0.18, 8.06]} color="#f3daba" />
      <Box at={[0, 4.85, 0]} size={[8.8, 1.35, 6.14]} color="#d7bcab" />
      <Box at={[0, 5.31, 3.05]} size={[4.87, 2.62, 2.17]} color="#ebd0b4" />
      <Arch
        at={[0, 0.1, 4.17]}
        w={2.08}
        h={3.63}
        tint="#f6dbc0"
        door="#6e5360"
      />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Chhatri at={[side * 5.44, 4.27, 2.45]} r={1.27} color="#b4807b" />
          <Chhatri at={[side * 2.86, 5.6, -1.81]} r={0.8} color="#bf9690" />
          {[2.44, 4.2, 5.95].map((t) => (
            <Arch
              key={t}
              at={[side * t, 0.8, 3.96]}
              w={0.9}
              h={1.86}
              tint="#f4ddc6"
            />
          ))}
        </group>
      ))}
      <Dome at={[0, 6.61, 2.49]} radius={2.04} color="#b98482" />
      <Dome at={[0, 5.61, -1]} radius={1.55} color="#c59687" />
    </>
  );
}
function Jantar() {
  return (
    <>
      <Box at={[0, 0.1, 0]} size={[11, 0.2, 10]} color="#d2a580" />
      {[-2.3, 2.3].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 2.42, 0]} rotation={[0, 0, 0.5]} castShadow>
            <boxGeometry args={[0.68, 5.25, 2.02]} />
            <meshStandardMaterial color="#e7b683" />
          </mesh>
          {Array.from({ length: 14 }, (_, i) => (
            <Box
              key={i}
              at={[-1.38 + i * 0.152, 0.23 + i * 0.31, 1.06]}
              size={[0.35, 0.16, 0.76]}
              color="#f1c597"
            />
          ))}
        </group>
      ))}
      <mesh
        castShadow
        position={[0, 0.45, -2.5]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[2.01, 0.17, 8, 36, Math.PI]} />
        <meshStandardMaterial color="#b87567" />
      </mesh>
    </>
  );
}
function Amber() {
  return (
    <>
      <mesh
        position={[0, 3.12, 0]}
        scale={[1.73, 0.74, 1]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[6.15, 9.3, 8.25, 7]} />
        <meshStandardMaterial color="#b58d78" flatShading />
      </mesh>
      <Box at={[0, 7.3, 0]} size={[21.8, 3.22, 10.8]} color="#bc8c5f" />
      <Box at={[0, 9.05, 0]} size={[22.18, 0.34, 11.03]} color="#e9b477" />
      {Array.from({ length: 26 }, (_, i) => (
        <Box
          key={i}
          at={[-10.7 + i * 0.84, 9.52, 5.32]}
          size={[0.4, 0.71, 0.49]}
          color="#dfaa72"
        />
      ))}
      {[-1, 1].map((s) => (
        <group key={s}>
          <Box
            at={[s * 8.35, 9.36, 3.55]}
            size={[3.24, 4.9, 3.56]}
            color="#d6a36d"
          />
          <Chhatri at={[s * 8.35, 11.84, 3.55]} r={1.18} color="#d3a36f" />
          <Arch at={[s * 8.35, 8.48, 5.38]} w={1.11} h={1.61} tint="#ecbe8b" />
        </group>
      ))}
      <Box at={[0, 10.94, 0]} size={[8.2, 3.9, 7.28]} color="#d7a470" />
      <Arch at={[0, 8.95, 3.69]} w={2.38} h={3.5} tint="#efc394" />
      <Chhatri at={[0, 13.02, 0]} r={1.67} color="#e0ab72" />
    </>
  );
}

function Lake() {
  const waves = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame(({ clock }) => {
    waves.uTime.value = clock.elapsedTime;
  });
  return (
    <group position={[lake.x, 0.027, lake.z]}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[lake.rx + 1.1, lake.rz + 1.1, 1]}
      >
        <circleGeometry args={[1, 72]} />
        <meshStandardMaterial color="#c39c7c" />
      </mesh>
      <mesh
        position={[0, 0.016, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[lake.rx, lake.rz, 1]}
      >
        <circleGeometry args={[1, 72]} />
        <shaderMaterial
          uniforms={waves}
          vertexShader={`varying vec2 p; void main(){p=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
          fragmentShader={`
          varying vec2 p;uniform float uTime;
          void main(){
            float ripple=sin(p.y*94.+sin(p.x*12.+uTime*.44)*1.9-uTime*1.3);
            float trace=pow(max(0.,ripple),15.)*(.22+.78*sin(p.x*42.+p.y*9.)*.5);
            vec3 shade=mix(vec3(.09,.23,.23),vec3(.26,.45,.43),.45+p.y*.36);
            vec3 col=shade+trace*vec3(.25,.26,.21)+vec3(.29,.20,.09)*pow(max(0.,1.-abs(p.x-.29)*1.7),6.)*(p.y+.8)*.38;
            gl_FragColor=vec4(col,1.);
            #include <colorspace_fragment>
          }`}
        />
      </mesh>
    </group>
  );
}

const models = {
  hawa: Hawa,
  city: CityPalace,
  jal: Jal,
  albert: Albert,
  jantar: Jantar,
  amber: Amber,
};
export function JaipurLandmarks({ seen }: { seen: readonly string[] }) {
  return (
    <>
      <Lake />
      {landmarks.map((item) => {
        const Model = models[item.id];
        return (
          <group key={item.id} position={[item.x, 0, item.z]}>
            <Model />
            <Html
              center
              position={[item.id === "jal" ? -5.5 : 0, item.height + 0.91, 0]}
              zIndexRange={[5, 1]}
            >
              <span
                className="jaipur-landmark"
                data-seen={seen.includes(item.id)}
              >
                {item.name}
              </span>
            </Html>
          </group>
        );
      })}
    </>
  );
}
