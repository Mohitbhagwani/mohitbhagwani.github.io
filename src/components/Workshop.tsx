import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Footprints,
  RotateCcw,
} from "lucide-react";
import { exhibits, type Exhibit } from "../content/workshop";
import { skills } from "../content/portfolio";

const Scene = lazy(() => import("../world/WorkshopScene"));
const directions = [
  ["up", ArrowUp],
  ["left", ArrowLeft],
  ["down", ArrowDown],
  ["right", ArrowRight],
] as const;

class WorkshopBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function Workshop({
  plain,
  onOpen,
}: {
  plain: boolean;
  onOpen: (id: string) => void;
}) {
  const [selected, setSelected] = useState<Exhibit>(exhibits[0]);
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [walking, setWalking] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [nearby, setNearby] = useState<Exhibit | null>(null);
  const [placard, setPlacard] = useState<Exhibit | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const input = useRef(new Set<string>());
  const inspect = useCallback((item: Exhibit) => {
    setSelected(item);
    setPlacard(item);
  }, []);
  const overview = useCallback(() => {
    setWalking(false);
    setPlacard(null);
  }, []);
  const onError = useCallback(() => {
    setUnavailable(true);
    setWalking(false);
  }, []);
  const show3d = !plain && !unavailable;
  const canWalk = walking && show3d;
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setLoaded(true);
        else setWalking(false);
      },
      { rootMargin: "140px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!canWalk) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") overview();
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [canWalk, overview]);

  function walk() {
    setNearby(null);
    setPlacard(null);
    setWalking(true);
    stage.current?.focus({ preventScroll: true });
  }
  return (
    <section id="skills" className="workshop" aria-labelledby="workshop-title">
      <div className="workshop-heading">
        <div>
          <p className="workshop-kicker">LANGUAGES · FRAMEWORKS · TOOLS</p>
          <h2 id="workshop-title">
            The tools I build with<span>.</span>
          </h2>
        </div>
        <p>Select a technology to see it in 3D and explore how I’ve used it.</p>
      </div>
      <div className="workshop-surface">
        <div
          className="workshop-stage"
          ref={stage}
          tabIndex={show3d ? 0 : undefined}
          aria-label="Skills workshop scene"
        >
          {show3d && loaded && (
            <WorkshopBoundary onError={onError}>
              <Suspense
                fallback={
                  <p className="trace-loading" role="status">
                    Loading the workshop…
                  </p>
                }
              >
                <Scene
                  selected={selected.id}
                  onSelect={inspect}
                  walking={canWalk}
                  active={visible}
                  input={input}
                  onNearby={setNearby}
                  onError={onError}
                />
              </Suspense>
            </WorkshopBoundary>
          )}
          {show3d && (
            <div className="workshop-stage-top">
              <span className="workshop-caption">
                {canWalk ? "ENGINEERING WORKSHOP" : "TECHNOLOGY SHOWCASE"}
              </span>
              {canWalk ? (
                <button onClick={overview}>
                  <RotateCcw size={15} /> Overview
                </button>
              ) : (
                <button onClick={walk}>
                  <Footprints size={17} /> Walk the workshop
                </button>
              )}
            </div>
          )}
          {!show3d && (
            <div className="workshop-list-heading">
              <h3>Browse the tools</h3>
              <p>Select a technology to read about its role in my work.</p>
            </div>
          )}
          {show3d && (
            <div className="workshop-stage-bottom">
              {canWalk ? (
                <span>WASD / arrows · E to inspect · Esc to exit</span>
              ) : (
                <span className="workshop-object-name">{selected.object}</span>
              )}
              {canWalk && nearby && (
                <button onClick={() => inspect(nearby)}>
                  Inspect {nearby.name} <ArrowUpRight size={14} />
                </button>
              )}
            </div>
          )}
          {canWalk && placard && (
            <aside
              className="workshop-placard"
              aria-live="polite"
              aria-label="Exhibit detail"
            >
              <div>
                <strong>{placard.name}</strong>
                <button
                  aria-label="Close exhibit detail"
                  onClick={() => {
                    setPlacard(null);
                    stage.current?.focus({ preventScroll: true });
                  }}
                >
                  ×
                </button>
              </div>
              <p>{placard.summary}</p>
            </aside>
          )}
          {canWalk && (
            <div
              className="workshop-drive"
              role="group"
              aria-label="Workshop movement"
            >
              {directions.map(([direction, Icon]) => (
                <button
                  key={direction}
                  aria-label={`Walk ${direction}`}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.currentTarget.setPointerCapture(event.pointerId);
                    input.current.add(direction);
                  }}
                  onPointerUp={() => input.current.delete(direction)}
                  onPointerCancel={() => input.current.delete(direction)}
                  onLostPointerCapture={() => input.current.delete(direction)}
                >
                  <Icon size={17} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="workshop-info">
          <div
            className="workshop-tools"
            role="group"
            aria-label="Workshop exhibits"
          >
            {exhibits.map((item) => (
              <button
                key={item.id}
                onClick={() => inspect(item)}
                aria-pressed={selected.id === item.id}
                style={{ "--tool-color": item.color } as CSSProperties}
              >
                {item.name}
              </button>
            ))}
          </div>
          <article className="workshop-detail" aria-live="polite">
            <p className="workshop-kicker">{selected.type}</p>
            <h3>{selected.name}</h3>
            <p>{selected.summary}</p>
            {selected.id === "go" && (
              <p className="workshop-credit">
                3D adaptation of the{" "}
                <a href="https://go.dev/blog/gopher">Go gopher</a> by Renée
                French ·{" "}
                <a href="https://creativecommons.org/licenses/by/4.0/">
                  CC BY 4.0
                </a>
              </p>
            )}
            {selected.work && (
              <button
                onClick={() => {
                  if (canWalk) overview();
                  onOpen("case/" + selected.work);
                }}
              >
                Read related work <ArrowUpRight size={15} />
              </button>
            )}
          </article>
        </div>
      </div>
      <details className="workshop-index">
        <summary>Full technology list</summary>
        <dl>
          {Object.entries(skills).map(([group, items]) => (
            <div key={group}>
              <dt>{group}</dt>
              <dd>{items.join(" · ")}</dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  );
}
