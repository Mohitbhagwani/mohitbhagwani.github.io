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
  Map,
  X,
  Pause,
  Play,
  RotateCcw,
  Wind,
} from "lucide-react";
import { rooftops, type Rooftop, type FlightKey } from "../content/kite";
import { landmarks } from "../content/jaipur";
import { profile } from "../content/portfolio";

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
export default function KiteFlight({ plain }: { plain: boolean }) {
  const [flight, setFlight] = useState(0);
  const [flying, setFlying] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [visited, setVisited] = useState<string[]>([]);
  const [surveyed, setSurveyed] = useState<string[]>([]);
  const [map, setMap] = useState(false);
  const [impact, setImpact] = useState("");
  const timer = useRef<number | undefined>(undefined);
  const flightWasRunning = useRef(false);
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
  const onImpact = useCallback((name: string) => {
    window.clearTimeout(timer.current);
    setImpact(name);
    timer.current = window.setTimeout(() => setImpact(""), 2100);
  }, []);
  const onLandmark = useCallback(
    (id: string) =>
      setSurveyed((prev) => (prev.includes(id) ? prev : [...prev, id])),
    [],
  );
  useEffect(() => () => window.clearTimeout(timer.current), []);
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
    setImpact("");
    setMap(false);
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
      aria-label="Kites over Jaipur"
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
                  surveyed={surveyed}
                  onImpact={onImpact}
                  onLandmark={onLandmark}
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
          <i className="kite-location-dot" /> BACKEND ENGINEER <span>·</span>{" "}
          JAIPUR, INDIA
        </p>
        <h1 id="kite-title">
          Mohit
          <br /> Bhagwani<span>.</span>
        </h1>
        <p className="kite-subtitle">
          I build payment systems and distributed services.
        </p>
        <div className="kite-topics" aria-label="Engineering focus">
          <span>Java / Spring Boot</span>
          <span>Fintech</span>
          <span>Developer tooling</span>
        </div>
        <div className="kite-actions">
          {showScene && !isFlying && (
            <button
              className="kite-launch"
              disabled={!ready}
              onClick={() => start()}
            >
              <Play size={16} /> {flight ? "Resume flight" : "Launch kite"}
            </button>
          )}
          {isFlying && (
            <button className="kite-pause" onClick={() => setFlying(false)}>
              <Pause size={14} /> Pause
            </button>
          )}
          <a href="#work" onClick={() => setFlying(false)}>
            View case studies <ArrowDown size={15} />
          </a>
          {!isFlying && profile.resume && (
            <a href={profile.resume} target="_blank" rel="noreferrer">
              View résumé <ArrowUpRight size={14} />
            </a>
          )}
        </div>
        {showScene && !isFlying && (
          <p className="kite-experience-label">
            Kites over Jaipur <span>·</span> An interactive tour of my work
          </p>
        )}
      </div>
      {showScene && (
        <button
          className="jaipur-map-toggle"
          aria-expanded={map}
          aria-controls="jaipur-map"
          onClick={() => {
            if (!map) {
              flightWasRunning.current = isFlying;
              setFlying(false);
              setMap(true);
            } else {
              setMap(false);
              if (flightWasRunning.current) {
                setFlying(true);
                area.current?.focus({ preventScroll: true });
              }
            }
          }}
        >
          <Map size={17} /> City map
        </button>
      )}
      {map && showScene && (
        <aside
          id="jaipur-map"
          className="jaipur-map"
          aria-label="Jaipur landmarks"
        >
          <header>
            <span>JAIPUR</span>
            <button
              aria-label="Close city map"
              onClick={() => {
                setMap(false);
                if (flightWasRunning.current) {
                  setFlying(true);
                  area.current?.focus({ preventScroll: true });
                }
              }}
            >
              <X size={17} />
            </button>
          </header>
          <h2>Landmarks</h2>
          <p>The flight compresses distances into one scenic route.</p>
          <div className="jaipur-route-map" aria-hidden="true">
            <div className="jaipur-map-lake" />
            <i className="jaipur-map-start" title="Launch terrace" />
            {landmarks.map((site, i) => (
              <i
                className="jaipur-map-pin"
                key={site.id}
                style={{
                  left: `${50 + site.x * 1.16}%`,
                  top: `${87 + (site.z - 3) * 0.86}%`,
                  background: site.accent,
                }}
              >
                {i + 1}
              </i>
            ))}
          </div>
          <ol>
            {landmarks.map((site, index) => (
              <li key={site.id} data-seen={surveyed.includes(site.id)}>
                <i style={{ background: site.accent }}>{index + 1}</i>
                <div>
                  <b>{site.name}</b>
                  <small>{site.subtitle}</small>
                </div>
                <span>{surveyed.includes(site.id) ? "Seen" : ""}</span>
              </li>
            ))}
          </ol>
        </aside>
      )}
      {impact && isFlying && (
        <div className="kite-impact" role="status">
          <b>Clipped {impact}</b>
          <span>Regaining altitude</span>
        </div>
      )}
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
