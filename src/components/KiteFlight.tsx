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
import { landmarks, type JaipurLandmark } from "../content/jaipur";
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
  const [landmark, setLandmark] = useState<JaipurLandmark | null>(null);
  const guideToggle = useRef<HTMLButtonElement>(null);
  const launchButton = useRef<HTMLButtonElement>(null);
  const [impact, setImpact] = useState("");
  const timer = useRef<number | undefined>(undefined);
  const [pausedForGuide, setPausedForGuide] = useState(false);
  const [discovery, setDiscovery] = useState<Rooftop | null>(null);
  const [stats, setStats] = useState({
    distance: 0,
    altitude: 14,
    gust: false,
  });
  const area = useRef<HTMLElement>(null);
  const input = useRef(new Set<FlightKey>());
  const pauseFlight = useCallback(() => {
    setFlying(false);
    requestAnimationFrame(() =>
      launchButton.current?.focus({ preventScroll: true }),
    );
  }, []);
  const showScene = !plain && !failed;
  const isFlying = showScene && flying && visible;
  const flightView = isFlying || (showScene && map && pausedForGuide);
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
      if (!(target instanceof Node) || !area.current?.contains(target)) return;
      if (e.key === "Escape") {
        pauseFlight();
        return;
      }
      if (
        target instanceof HTMLElement &&
        target.closest("a, button, input, select, textarea")
      )
        return;
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
  }, [isFlying, pauseFlight]);
  function start(reset = false) {
    setDiscovery(null);
    setImpact("");
    setMap(false);
    if (reset || !flight) {
      setFlight((value) => value + 1);
      setStats({ distance: 0, altitude: 14, gust: false });
    }
    setFlying(true);
    const surface = area.current;
    if (surface) {
      window.scrollTo({
        top: window.scrollY + surface.getBoundingClientRect().top,
        behavior: "instant",
      });
      surface.focus({ preventScroll: true });
    }
  }
  function closeGuide() {
    setMap(false);
    if (pausedForGuide && showScene) {
      setFlying(true);
      area.current?.focus({ preventScroll: true });
    } else {
      guideToggle.current?.focus({ preventScroll: true });
    }
    setPausedForGuide(false);
  }

  const next = rooftops.find((roof) => !visited.includes(roof.id));
  return (
    <section
      ref={area}
      id="jaipur"
      className="kite-hero"
      data-flight={flightView}
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
      <div className="kite-title" hidden={flightView}>
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
              ref={launchButton}
              className="kite-launch"
              disabled={!ready}
              onClick={() => start()}
            >
              <Play size={16} /> {flight ? "Resume flight" : "Launch kite"}
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
            Fly over Jaipur and find my projects on the rooftops.
          </p>
        )}
      </div>
      <button
        ref={guideToggle}
        className="jaipur-map-toggle"
        aria-expanded={map}
        aria-controls={map ? "jaipur-map" : undefined}
        onClick={() => {
          if (map) {
            closeGuide();
          } else {
            setPausedForGuide(isFlying);
            setFlying(false);
            setMap(true);
          }
        }}
      >
        <Map size={17} /> Jaipur guide
      </button>
      {map && (
        <aside
          id="jaipur-map"
          className="jaipur-map"
          aria-label="Jaipur landmarks"
          onKeyDown={(event) => {
            if (event.key === "Escape") closeGuide();
          }}
        >
          <header>
            <h2>Explore Jaipur</h2>
            <button aria-label="Close Jaipur guide" onClick={closeGuide}>
              <X size={20} />
            </button>
          </header>
          <p>Pick a landmark to see what to look for on the flight.</p>
          <div
            className="jaipur-route-map"
            role="group"
            aria-label="Landmark map"
          >
            <div className="jaipur-map-lake" aria-hidden="true" />
            <i className="jaipur-map-start" title="Launch terrace" />
            {landmarks.map((site, i) => (
              <button
                type="button"
                className="jaipur-map-pin"
                aria-label={`Locate ${site.name}`}
                aria-pressed={landmark?.id === site.id}
                key={site.id}
                onClick={() => setLandmark(site)}
                style={{
                  left: `${50 + site.x * 1.16}%`,
                  top: `${87 + (site.z - 3) * 0.79}%`,
                  background: site.accent,
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <ol>
            {landmarks.map((site, index) => (
              <li key={site.id}>
                <button
                  type="button"
                  aria-pressed={landmark?.id === site.id}
                  onClick={() => setLandmark(site)}
                >
                  <i aria-hidden="true" style={{ background: site.accent }}>
                    {index + 1}
                  </i>
                  <b>{site.name}</b>
                  {surveyed.includes(site.id) && <span>Seen</span>}
                </button>
              </li>
            ))}
          </ol>
          {landmark && (
            <div className="jaipur-landmark-detail" aria-live="polite">
              <strong>{landmark.subtitle}</strong>
              <p>{landmark.guide}</p>
            </div>
          )}
          <nav className="jaipur-stops" aria-label="Portfolio rooftop stops">
            <strong>Rooftop stops</strong>
            {rooftops.map((roof) => (
              <a
                href={roof.link}
                key={roof.id}
                onClick={() => {
                  setPausedForGuide(false);
                  setMap(false);
                }}
              >
                {roof.name} <ArrowUpRight size={15} />
              </a>
            ))}
          </nav>
        </aside>
      )}
      {impact && isFlying && (
        <div className="kite-impact" role="status">
          <b>Clipped {impact}</b>
          <span>Regaining altitude</span>
        </div>
      )}
      {isFlying && (
        <div
          className="kite-flight-deck"
          role="group"
          aria-label="Flight instruments"
        >
          <div className="kite-route">
            <Compass size={21} aria-hidden="true" />
            <div>
              <span className="kite-deck-label">
                {next ? "Next rooftop" : "Route complete"}
              </span>
              <strong>{next ? next.name : "All rooftops discovered"}</strong>
            </div>
            <span
              className="kite-roof-count"
              aria-label={`${visited.length} of ${rooftops.length} rooftops discovered`}
            >
              {visited.length}/{rooftops.length}
            </span>
          </div>
          <dl className="kite-telemetry">
            <div>
              <dt>Distance</dt>
              <dd data-testid="kite-distance">{stats.distance} m</dd>
            </div>
            <div>
              <dt>Altitude</dt>
              <dd>{stats.altitude} m</dd>
            </div>
          </dl>
          <div className="kite-flight-actions">
            <button onClick={pauseFlight}>
              <Pause size={17} /> Pause flight
            </button>
            <button
              onClick={() => start(true)}
              aria-label="Return to launch"
              title="Return to launch"
            >
              <RotateCcw size={17} />
            </button>
          </div>
          <div className="kite-keyboard-guide">
            <span>
              <kbd>←</kbd>
              <kbd>→</kbd> Steer
            </span>
            <span>
              <kbd>↑</kbd>
              <kbd>↓</kbd> Altitude
            </span>
            <span>
              <kbd>Space</kbd> Gust
            </span>
          </div>
          <div
            className="kite-flight-pad"
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
                <Icon size={20} />
              </button>
            ))}
          </div>
        </div>
      )}
      {isFlying && stats.gust && (
        <span className="kite-gust-note">Gust caught!</span>
      )}
      {discovery && isFlying && (
        <aside
          className="kite-rooftop-card"
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
