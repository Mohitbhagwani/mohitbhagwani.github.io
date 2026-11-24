import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Compass,
  Pause,
  Play,
  RotateCcw,
  Wind,
} from "lucide-react";
import { rooftops, type Rooftop, type FlightKey } from "../content/kite";

const Scene = lazy(() => import("../world/KiteScene"));
const direction: Record<string, FlightKey> = {
  a: "left",
  ArrowLeft: "left",
  d: "right",
  ArrowRight: "right",
  w: "rise",
  ArrowUp: "rise",
  s: "dive",
  ArrowDown: "dive",
  " ": "gust",
};
const touch = [
  ["rise", ArrowUp],
  ["left", ArrowLeft],
  ["dive", ArrowDown],
  ["right", ArrowRight],
  ["gust", Wind],
] as const;
class FlightBoundary extends Component<
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
export default function KiteFlight({
  plain,
  onOpen,
}: {
  plain: boolean;
  onOpen: (id: string) => void;
}) {
  const [flight, setFlight] = useState(0);
  const [flying, setFlying] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [visited, setVisited] = useState<string[]>([]);
  const [discovery, setDiscovery] = useState<Rooftop | null>(null);
  const [stats, setStats] = useState({
    distance: 0,
    altitude: 14,
    gust: false,
  });
  const area = useRef<HTMLElement>(null);
  const input = useRef(new Set<FlightKey>());
  const showScene = !plain && !failed;
  const isFlying = showScene && flying && visible;
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => {
    setFailed(true);
    setFlying(false);
  }, []);
  const onDiscover = useCallback((roof: Rooftop) => {
    setVisited((prev) => (prev.includes(roof.id) ? prev : [...prev, roof.id]));
    setDiscovery(roof);
  }, []);
  useEffect(() => {
    const target = area.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setLoaded(true);
        else {
          setFlying(false);
          input.current.clear();
        }
      },
      { threshold: 0.16 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!isFlying) return;
    const keys = input.current;
    const down = (e: KeyboardEvent) => {
      const target = e.target;
      if (
        !(target instanceof Node) ||
        !area.current?.contains(target) ||
        (target instanceof HTMLElement &&
          target.closest("a, button, input, select, textarea"))
      )
        return;
      if (e.key === "Escape") {
        setFlying(false);
        return;
      }
      const move = direction[e.key] ?? direction[e.key.toLowerCase()];
      if (move) {
        e.preventDefault();
        if (move !== "gust" || !e.repeat) keys.add(move);
      }
    };
    const up = (e: KeyboardEvent) => {
      const move = direction[e.key] ?? direction[e.key.toLowerCase()];
      if (move && move !== "gust") keys.delete(move);
    };
    const clear = () => keys.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      clear();
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, [isFlying]);
  function start(reset = false) {
    setDiscovery(null);
    if (reset || !flight) {
      setFlight((value) => value + 1);
      setStats({ distance: 0, altitude: 14, gust: false });
    }
    setFlying(true);
    area.current?.focus({ preventScroll: true });
  }
  const next = rooftops.find((roof) => !visited.includes(roof.id));
  return (
    <section
      ref={area}
      className="kite-hero"
      data-flight={isFlying}
      data-3d={showScene}
      tabIndex={-1}
      aria-labelledby="kite-title"
    >
      {showScene && (
        <div className="kite-scene" data-testid="kite-scene">
          {loaded && (
            <FlightBoundary onError={onError}>
              <Suspense fallback={null}>
                <Scene
                  flying={isFlying}
                  flight={flight}
                  active={visible}
                  keys={input}
                  visited={visited}
                  onDiscover={onDiscover}
                  onTelemetry={setStats}
                  onReady={onReady}
                  onError={onError}
                />
              </Suspense>
            </FlightBoundary>
          )}
          {!ready && (
            <p className="kite-loading" role="status">
              Loading the Jaipur rooftops…
            </p>
          )}
        </div>
      )}
      <div className="kite-title">
        <p>
          MOHIT BHAGWANI <span>·</span> JAIPUR, INDIA
        </p>
        <h1 id="kite-title" aria-label="Beyond the Backend — Kites over Jaipur">
          Kites over
          <br /> Jaipur<span>.</span>
        </h1>
        <p className="kite-subtitle">
          A backend engineer’s portfolio, from above.
        </p>
        <div className="kite-actions">
          {showScene && !isFlying && (
            <button
              className="kite-launch"
              disabled={!ready}
              onClick={() => start()}
            >
              <Play size={16} />
              {flight ? "Resume flight" : "Launch kite"}
            </button>
          )}
          {isFlying && (
            <button className="kite-pause" onClick={() => setFlying(false)}>
              <Pause size={14} /> Pause
            </button>
          )}
          <a href="#work" onClick={() => setFlying(false)}>
            Jump to the portfolio <ArrowDown size={15} />
          </a>
          {!showScene && (
            <button className="kite-pause" onClick={() => onOpen("resume")}>
              View résumé <ArrowUpRight size={14} />
            </button>
          )}
        </div>
      </div>
      {showScene && (
        <div className="kite-hud">
          <div className="kite-hud-main">
            <Compass size={17} />
            <span>{next ? next.name : "All rooftops discovered"}</span>
            <span>
              {visited.length}/{rooftops.length}
            </span>
          </div>
          <p>
            {flight
              ? "Fly through a colored wind ring to discover a rooftop."
              : "Launch and follow the wind rings over the rooftops."}
          </p>
          {flight > 0 && (
            <div className="kite-meter">
              <span data-testid="kite-distance">{stats.distance} m</span>
              <span>{stats.altitude} m high</span>
              {stats.gust && <span>Gust caught!</span>}
            </div>
          )}
          {isFlying && (
            <button className="kite-reset" onClick={() => start(true)}>
              <RotateCcw size={14} /> Return to launch
            </button>
          )}
        </div>
      )}
      {isFlying && (
        <div className="kite-help">
          <span>
            <kbd>←</kbd>
            <kbd>→</kbd> Steer
          </span>
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> Height
          </span>
          <span>
            <kbd>Space</kbd> Gust
          </span>
        </div>
      )}
      {isFlying && (
        <div
          className="kite-touch"
          role="group"
          aria-label="Kite flight controls"
        >
          {touch.map(([key, Icon]) => (
            <button
              key={key}
              aria-label={`Kite ${key}`}
              onPointerDown={(e) => {
                e.preventDefault();
                e.currentTarget.setPointerCapture(e.pointerId);
                input.current.add(key);
              }}
              onPointerUp={() => {
                if (key !== "gust") input.current.delete(key);
              }}
              onPointerCancel={() => input.current.delete(key)}
              onLostPointerCapture={() => {
                if (key !== "gust") input.current.delete(key);
              }}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
      )}
      {discovery && showScene && (
        <aside
          className="kite-discovery"
          aria-label="Discovered rooftop"
          aria-live="polite"
        >
          <span>ROOFTOP DISCOVERED</span>
          <h2>{discovery.name}</h2>
          <p>{discovery.detail}</p>
          <a href={discovery.link} onClick={() => setFlying(false)}>
            Explore rooftop <ArrowUpRight size={16} />
          </a>
        </aside>
      )}
    </section>
  );
}
