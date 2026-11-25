import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { inLake } from "../content/jaipur";

const brick = new THREE.BoxGeometry(1, 1, 1);
const skin = "#9f6351";
const pavement = "#84636b";
const colours = [
  "#e18174",
  "#edba72",
  "#72aaa0",
  "#817fad",
  "#804c66",
  "#ecbfa2",
];
type Vec = [number, number, number];
function Block({
  at,
  size,
  color,
  lit = false,
}: {
  at: Vec;
  size: Vec;
  color: string;
  lit?: boolean;
}) {
  return (
    <mesh position={at} scale={size} geometry={brick} receiveShadow>
      <meshStandardMaterial
        color={color}
        roughness={0.8}
        emissive={lit ? color : "#000000"}
        emissiveIntensity={lit ? 0.72 : 0}
      />
    </mesh>
  );
}
function Street() {
  return (
    <>
      <Block at={[0, 0.014, -42]} size={[4.85, 0.055, 80]} color={pavement} />
      <Block at={[0, 0.019, -1.8]} size={[107, 0.062, 3.15]} color={pavement} />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Block
            at={[side * 2.65, 0.058, -42]}
            size={[0.5, 0.12, 80]}
            color="#c49683"
          />
          <Block
            at={[0, 0.06, -1.8 + side * 1.73]}
            size={[106, 0.11, 0.39]}
            color="#c39688"
          />
          {[-41, -32, -23, -14, -6, -2].map((z) => (
            <group key={z}>
              <Block
                at={[side * 2.84, 1.02, z]}
                size={[0.09, 1.99, 0.09]}
                color="#655768"
              />
              <Block
                at={[side * 2.84, 2.06, z]}
                size={[0.27, 0.18, 0.29]}
                color="#ffd19b"
                lit
              />
              <Block
                at={[side * 2.84, 2.19, z]}
                size={[0.35, 0.1, 0.35]}
                color="#655768"
              />
            </group>
          ))}
        </group>
      ))}
      {Array.from({ length: 19 }, (_, i) => (
        <Block
          key={i}
          at={[0, 0.055, -4 - i * 4.2]}
          size={[0.065, 0.012, 1.61]}
          color="#cda983"
        />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <Block
          key={i}
          at={[-2.05 + 0.69 * i, 0.059, -2.53]}
          size={[0.3, 0.013, 0.93]}
          color="#f4d2a7"
        />
      ))}
      {[-15.2, -12.83, -10.46, -8.09, 10.4, 12.9, 15.4, 17.9].map((x, i) => (
        <group key={x} position={[x, 0, 0.18]}>
          <Block at={[0, 0.41, 0]} size={[1.53, 0.78, 0.74]} color="#a66165" />
          <Block at={[0, 0.84, 0]} size={[1.68, 0.1, 0.82]} color="#e4b38a" />
          {[-0.67, 0.67].map((p) => (
            <Block
              key={p}
              at={[p, 1.23, -0.18]}
              size={[0.06, 0.82, 0.06]}
              color="#855f64"
            />
          ))}
          {Array.from({ length: 6 }, (_, p) => (
            <Block
              key={p}
              at={[-0.72 + p * 0.29, 1.65, -0.1]}
              size={[0.29, 0.086, 1.03]}
              color={p % 2 ? "#f4d3a4" : colours[i % 6]}
            />
          ))}
          {[0, 1, 2].map((j) => (
            <Block
              key={j}
              at={[-0.45 + j * 0.45, 0.96, 0.17]}
              size={[0.26, 0.15, 0.28]}
              color={colours[(i + j + 1) % 6]}
            />
          ))}
        </group>
      ))}
    </>
  );
}
function Vehicle({ i }: { i: number }) {
  const ref = useRef<THREE.Group>(null);
  const auto = i % 3 !== 0;
  const colour = auto
    ? ["#76a391", "#80aa97", "#b7ba68"][i % 3]
    : ["#a54f58", "#788f9a", "#d29773"][i % 3];
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    if (i < 8) {
      const sign = i % 2 === 0 ? 1 : -1;
      const distance = (t * (3.2 + (i % 3) * 0.4) + i * 13.73) % 75;
      ref.current.position.set(
        sign * 0.94,
        0.17,
        sign === 1 ? -77 + distance : -2 - distance,
      );
      ref.current.rotation.y = sign === 1 ? 0 : Math.PI;
    } else {
      const sign = i % 2 === 0 ? 1 : -1;
      ref.current.position.set(
        sign * (((t * 4.1 + i * 17) % 97) - 48),
        0.17,
        -1.8 + sign * 0.56,
      );
      ref.current.rotation.y = (sign * Math.PI) / 2;
    }
  });
  return (
    <group ref={ref} scale={auto ? 0.95 : 1.12}>
      <Block
        at={[0, 0.24, 0]}
        size={[0.55, 0.28, auto ? 0.77 : 1.18]}
        color={colour}
      />
      <Block
        at={[0, 0.49, auto ? -0.07 : 0]}
        size={[0.48, 0.27, auto ? 0.62 : 0.59]}
        color={auto ? "#dbc07d" : "#8fabb1"}
      />
      {auto && (
        <Block
          at={[0, 0.66, -0.07]}
          size={[0.59, 0.11, 0.69]}
          color="#e2c584"
        />
      )}
      {[-1, 1].flatMap((s) =>
        [-0.36, 0.36].map((z) => (
          <mesh
            key={`${s}/${z}`}
            rotation={[0, 0, Math.PI / 2]}
            position={[s * 0.29, 0.105, z]}
          >
            <cylinderGeometry args={[0.13, 0.13, 0.07, 9]} />
            <meshStandardMaterial color="#493d4b" />
          </mesh>
        )),
      )}
      {[-1, 1].map((s) => (
        <Block
          key={s}
          at={[s * 0.18, 0.25, auto ? 0.41 : 0.6]}
          size={[0.105, 0.08, 0.026]}
          color="#ffdc9d"
          lit
        />
      ))}
    </group>
  );
}

function Pedestrians() {
  const body = useRef<THREE.InstancedMesh>(null),
    head = useRef<THREE.InstancedMesh>(null),
    legs = useRef<THREE.InstancedMesh>(null);
  const rig = useMemo(() => new THREE.Object3D(), []);
  const walkers = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        speed: 0.55 + (i % 6) * 0.08,
        phase: i * 1.79,
        color: colours[i % colours.length],
        roof: i < 7,
        crossing: i >= 30,
      })),
    [],
  );
  useEffect(() => {
    walkers.forEach((p, i) =>
      body.current?.setColorAt(i, new THREE.Color(p.color)),
    );
    if (body.current?.instanceColor)
      body.current.instanceColor.needsUpdate = true;
  }, [walkers]);
  useFrame(({ clock }) => {
    if (!body.current || !head.current || !legs.current) return;
    const t = clock.elapsedTime;
    walkers.forEach((p, i) => {
      const velocity = t * p.speed + p.phase;
      const sign = i % 2 === 0 ? 1 : -1;
      let x = sign * (2.62 + (i % 3) * 0.13),
        z = sign === 1 ? -58 + (velocity % 57) : -1 - (velocity % 57),
        y = 0.1,
        angle = sign === 1 ? 0 : Math.PI;
      if (p.crossing) {
        x = sign * ((velocity % 42) - 21);
        z = 0.09 + sign * 0.19;
        angle = (sign * Math.PI) / 2;
      }
      if (p.roof) {
        x = 2.6 + i * 0.65 + Math.sin(velocity * 0.34) * 0.65;
        z = 7.8 + Math.sin(velocity * 0.22 + i) * 0.83;
        y = 5.88;
        angle = velocity * 0.2;
      }
      if (!p.roof && inLake(x, z, 0.13)) y = -3;
      const step = Math.sin(t * 6 + p.phase);
      rig.position.set(x, y + 0.56 + Math.abs(step) * 0.034, z);
      rig.rotation.set(0, angle, 0);
      rig.scale.set(0.24, 0.49, 0.17);
      rig.updateMatrix();
      body.current!.setMatrixAt(i, rig.matrix);
      rig.position.set(x, y + 0.88 + Math.abs(step) * 0.034, z);
      rig.scale.set(0.19, 0.21, 0.18);
      rig.updateMatrix();
      head.current!.setMatrixAt(i, rig.matrix);
      [-1, 1].forEach((s, j) => {
        rig.position.set(
          x + s * 0.062 * Math.cos(angle),
          y + 0.205,
          z - s * 0.062 * Math.sin(angle),
        );
        rig.rotation.set(step * s * 0.31, angle, 0);
        rig.scale.set(0.083, 0.34, 0.088);
        rig.updateMatrix();
        legs.current!.setMatrixAt(i * 2 + j, rig.matrix);
      });
    });
    body.current.instanceMatrix.needsUpdate = true;
    head.current.instanceMatrix.needsUpdate = true;
    legs.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <instancedMesh
        ref={body}
        args={[undefined, undefined, walkers.length]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.94} />
      </instancedMesh>
      <instancedMesh
        ref={head}
        args={[undefined, undefined, walkers.length]}
        frustumCulled={false}
      >
        <icosahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color={skin} roughness={0.91} />
      </instancedMesh>
      <instancedMesh
        ref={legs}
        args={[undefined, undefined, walkers.length * 2]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#574757" roughness={0.94} />
      </instancedMesh>
    </>
  );
}
function SunsetDust() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const data: number[] = [];
    const random = (n: number) => {
      const q = Math.sin(n * 61.41 + 89.2) * 6318.25;
      return q - Math.floor(q);
    };
    for (let i = 0; i < 180; i++)
      data.push(
        (random(i * 3) - 0.5) * 62,
        1 + random(i * 3 + 1) * 20,
        15 - random(i * 3 + 2) * 92,
      );
    g.setAttribute("position", new THREE.Float32BufferAttribute(data, 3));
    return g;
  }, []);
  const uniforms = useMemo(() => ({ time: { value: 0 } }), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(({ clock }) => {
    if (mat.current) mat.current.uniforms.time.value = clock.elapsedTime;
  });
  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
       uniform float time;varying float opacity;
       void main(){
         vec3 p=position;
         p.x+=sin(time*.25+p.z*.15)*1.4;
         p.y+=sin(time*.45+p.x*.2)*.85;
         vec4 mv=modelViewMatrix*vec4(p,1.);
         opacity=.2+.27*sin(p.z*2.+time*.81);
         gl_PointSize=clamp(87./max(5.,-mv.z),1.,7.);
         gl_Position=projectionMatrix*mv;
       }`}
        fragmentShader={`
       varying float opacity;
       void main(){
        float d=length(gl_PointCoord-.5);
        gl_FragColor=vec4(1.,.72,.43,max(0.,opacity)*(1.-smoothstep(.02,.5,d)));
       }`}
      />
    </points>
  );
}
export default function JaipurLife() {
  return (
    <>
      <Street />
      <Pedestrians />
      {Array.from({ length: 12 }, (_, i) => (
        <Vehicle key={i} i={i} />
      ))}
      <SunsetDust />
    </>
  );
}
