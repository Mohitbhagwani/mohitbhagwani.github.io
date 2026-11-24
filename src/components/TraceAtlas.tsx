import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Box,
  CirclePause,
  Play,
  RotateCcw,
  SkipForward,
  Maximize,
  X,
  Compass,
} from "lucide-react";
import {
  traceNodes,
  traceRoutes,
  type TraceNodeId,
  type TraceScenario,
} from "../content/trace";

const Scene = lazy(() => import("../world/TraceScene"));
const scenarios = [
  { id: "success", label: "Approved" },
  { id: "failure", label: "Provider failure" },
  { id: "duplicate", label: "Duplicate request" },
] as const;

class SceneBoundary extends Component<
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

export default function TraceAtlas({
  plain,
  onOpen,
}: {
  plain: boolean;
  onOpen: (id: string) => void;
}) {
  const [scenario, setScenario] = useState<TraceScenario>("success");
  const [cursor, setCursor] = useState(-1);
  const [running, setRunning] = useState(false);
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<TraceNodeId | null>(null);
  const [ready, setReady] = useState(false);
  const [failedScene, setFailedScene] = useState(false);
  const [immersive, setImmersive] = useState(false);
  const [follow, setFollow] = useState(true);
  const theater = useRef<HTMLDialogElement>(null);
  const route = traceRoutes[scenario];
  const current = route[cursor];
  const previous = route[cursor - 1];
  const finished = cursor === route.length - 1;
  const focus =
    traceNodes.find((node) => node.id === (selected ?? current?.node)) ??
    traceNodes[0];
  const failed = current?.state === "REJECTED" || current?.state === "FAILED";

  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => {
    setFailedScene(true);
    setImmersive(false);
  }, []);
  useEffect(() => {
    if (!immersive || !theater.current) return;
    const dialog = theater.current;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [immersive]);
  const advance = useCallback(() => {
    if (cursor >= route.length - 1) {
      setRunning(false);
      return;
    }
    setCursor(cursor + 1);
    setRevision((value) => value + 1);
    setSelected(null);
    if (cursor + 1 === route.length - 1) setRunning(false);
  }, [cursor, route.length]);
  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(advance, 1150);
    return () => window.clearTimeout(timer);
  }, [running, advance]);

  function reset(next: TraceScenario = scenario) {
    setScenario(next);
    setCursor(-1);
    setRunning(false);
    setSelected(null);
    setRevision((value) => value + 1);
  }
  function toggle() {
    if (running) {
      setRunning(false);
      return;
    }
    if (finished || cursor < 0) {
      setCursor(0);
      setRevision((value) => value + 1);
      setSelected(null);
    }
    setRunning(true);
  }
  const hasScene = !plain && !failedScene;
  const inTheater = immersive && hasScene;
  const scene = {
    active: previous?.node ?? null,
    next: current?.node ?? null,
    revision,
    visited: route.slice(0, cursor + 1).map((step) => step.node),
    failed,
    selected,
    onSelect: setSelected,
    onReady,
    onError,
  };
  function closeTheater() {
    setImmersive(false);
    setRunning(false);
  }
  return (
    <section className="trace-hero" aria-labelledby="atlas-heading">
      <div className="trace-mast">
        <div className="trace-intro">
          <p className="trace-kicker">
            <span /> INTERACTIVE PORTFOLIO <i /> BACKEND ENGINEERING
          </p>
          <h1 id="atlas-heading">
            Beyond the
            <br /> Backend<span>.</span>
          </h1>
          <p className="trace-intro-copy">
            I’m Mohit Bhagwani. I build payment systems and distributed
            services. Follow a fictional transaction to see the work behind a
            single request.
          </p>
          <div className="trace-intro-actions">
            {hasScene ? (
              <button
                className="trace-enter"
                onClick={() => {
                  setFollow(true);
                  setImmersive(true);
                }}
              >
                Enter the 3D journey <Maximize size={16} />
              </button>
            ) : (
              <a href="#trace-console">
                Try the trace <ArrowRight size={16} />
              </a>
            )}
            <button onClick={() => onOpen("resume")}>
              View résumé <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
        <div
          className="trace-stage"
          data-testid={hasScene ? "world-stage" : undefined}
        >
          <div className="trace-stage-header">
            <span>
              <Box size={14} /> TRANSACTION ATLAS
            </span>
            <span>PAYMENT ORCHESTRATION</span>
          </div>
          {hasScene ? (
            <SceneBoundary onError={onError}>
              <Suspense fallback={null}>
                {!inTheater && <Scene {...scene} />}
              </Suspense>
              {!ready && (
                <div className="trace-loading" role="status">
                  Loading the 3D system{" "}
                  <progress aria-label="Loading 3D system" />
                </div>
              )}
            </SceneBoundary>
          ) : (
            <div
              className="trace-fallback"
              aria-label="Payment architecture diagram"
            >
              {traceNodes.map((node, index) => (
                <button
                  style={{ "--node-color": node.color } as React.CSSProperties}
                  key={node.id}
                  aria-pressed={focus.id === node.id}
                  onClick={() => setSelected(node.id)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <b>{node.label}</b>
                  <ArrowRight size={14} />
                </button>
              ))}
            </div>
          )}
          <div className="trace-stage-footer">
            <span>
              {hasScene
                ? "DRAG TO ROTATE · PINCH OR SCROLL TO ZOOM"
                : "SELECT A STAGE TO INSPECT"}
            </span>
            <span>FIG. A / CONCEPTUAL SYSTEM</span>
          </div>
        </div>
      </div>
      {inTheater && (
        <dialog
          ref={theater}
          className="trace-theater"
          aria-label="Immersive transaction journey"
          onCancel={(event) => {
            event.preventDefault();
            closeTheater();
          }}
        >
          <div className="theater-canvas">
            <SceneBoundary onError={onError}>
              <Suspense
                fallback={
                  <p className="trace-loading">Loading the 3D journey…</p>
                }
              >
                <Scene
                  {...scene}
                  immersive
                  track={follow}
                  onLaunch={cursor < 0 ? toggle : undefined}
                />
              </Suspense>
            </SceneBoundary>
          </div>
          <header className="theater-top">
            <div>
              <span>BEYOND THE BACKEND</span>
              <h2>Transaction journey</h2>
            </div>
            <button autoFocus onClick={closeTheater}>
              <X size={17} /> <span>Exit 3D</span>
            </button>
          </header>
          <aside className="theater-event" aria-live="polite">
            <span>
              EVENT {Math.max(0, cursor + 1)} OF {route.length}
            </span>
            <strong>{current?.state ?? "READY"}</strong>
            <p>
              {current?.message ??
                "Select a route, then click the packet at the ingress gate."}
            </p>
          </aside>
          <div className="theater-controls">
            <div
              className="trace-scenarios"
              role="group"
              aria-label="3D trace scenario"
            >
              {scenarios.map((item) => (
                <button
                  key={item.id}
                  aria-pressed={scenario === item.id}
                  onClick={() => reset(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="trace-buttons">
              <button className="trace-run" onClick={toggle}>
                {running ? <CirclePause size={16} /> : <Play size={16} />}{" "}
                {running
                  ? "Pause trace"
                  : finished
                    ? "Replay trace"
                    : "Run trace"}
              </button>
              <button
                aria-label="Advance one event"
                title="Advance one event"
                disabled={finished}
                onClick={() => {
                  setRunning(false);
                  advance();
                }}
              >
                <SkipForward size={17} />
              </button>
              <button aria-pressed={follow} onClick={() => setFollow(!follow)}>
                <Compass size={16} /> {follow ? "Free camera" : "Follow packet"}
              </button>
            </div>
          </div>
        </dialog>
      )}
      <div className="trace-console" id="trace-console">
        <div className="trace-control">
          <p className="trace-panel-label">01 / RUN A TRANSACTION</p>
          <div
            className="trace-scenarios"
            role="group"
            aria-label="Trace scenario"
          >
            {scenarios.map((item) => (
              <button
                key={item.id}
                aria-pressed={scenario === item.id}
                onClick={() => reset(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="trace-buttons">
            <button className="trace-run" onClick={toggle}>
              {running ? <CirclePause size={16} /> : <Play size={16} />}{" "}
              {running
                ? "Pause trace"
                : finished
                  ? "Replay trace"
                  : "Run trace"}
            </button>
            <button
              title="Advance one event"
              aria-label="Advance one event"
              onClick={() => {
                setRunning(false);
                advance();
              }}
              disabled={finished}
            >
              <SkipForward size={17} />
            </button>
            <button
              title="Reset trace"
              aria-label="Reset trace"
              onClick={() => reset()}
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
        <div className="trace-monitor" aria-live="polite">
          <p className="trace-panel-label">
            02 / EVENT MONITOR{" "}
            <span>
              {cursor < 0 ? "00" : String(cursor + 1).padStart(2, "0")} /{" "}
              {String(route.length).padStart(2, "0")}
            </span>
          </p>
          <div className="trace-progress" aria-hidden="true">
            {route.map((step, index) => (
              <span key={step.state} data-complete={index <= cursor} />
            ))}
          </div>
          <strong
            data-testid="trace-state"
            className={failed ? "trace-failed" : ""}
          >
            {current?.state ?? "STANDBY"}
          </strong>
          <p>
            {current?.message ??
              "Select a scenario, then run it or inspect one event at a time."}
          </p>
        </div>
        <div className="trace-inspector">
          <p className="trace-panel-label">03 / SYSTEM INSPECTOR</p>
          <h2>
            <span style={{ background: focus.color }} />
            {focus.label}
          </h2>
          <p>{focus.detail}</p>
          <button onClick={() => onOpen(focus.view)}>
            Explore related work <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
      <div className="trace-legend">
        <span>Educational model · fictional data</span>
        <a href="#work">
          Skip to selected work <ArrowRight size={15} />
        </a>
      </div>
    </section>
  );
}
