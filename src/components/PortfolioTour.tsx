import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Compass, List, X } from "lucide-react";

const stops = [
  {
    id: "jaipur",
    name: "Kites over Jaipur",
    tip: "Launch the kite or open the city guide to explore Jaipur.",
  },
  {
    id: "work",
    name: "Case studies",
    tip: "Choose a project and step through its architecture.",
  },
  {
    id: "atlas",
    name: "Transaction Atlas",
    tip: "Run a payment trace and see where each event happens.",
  },
  {
    id: "skills",
    name: "Skills workshop",
    tip: "Pick a technology to see its 3D exhibit and where I used it.",
  },
  {
    id: "lab",
    name: "Engineering playground",
    tip: "Try a simulation and see what happens when the inputs change.",
  },
  {
    id: "experience",
    name: "Experience",
    tip: "Expand a role to see what I worked on there.",
  },
  {
    id: "about",
    name: "About Mohit",
    tip: "Get to know the engineer behind the portfolio.",
  },
  {
    id: "recognition",
    name: "Recognition",
    tip: "Open an award to see what it recognized.",
  },
  {
    id: "contact",
    name: "Contact",
    tip: "Find my email, LinkedIn, GitHub, and résumé.",
  },
] as const;
type Stop = (typeof stops)[number];
type Tour = { current: Stop; visited: ReadonlySet<Stop["id"]> };

function recordStop(previous: Tour | null, stop: Stop): Tour {
  return {
    current: stop,
    visited: new Set([...(previous?.visited ?? []), stop.id]),
  };
}

export default function PortfolioTour({ suspended }: { suspended: boolean }) {
  const [tour, setTour] = useState<Tour | null>(null);
  const [showStops, setShowStops] = useState(false);
  const startButton = useRef<HTMLButtonElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const stopsButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const sync = () => {
      const stop = stops.find((item) => location.hash === "#" + item.id);
      if (stop) setTour((previous) => previous && recordStop(previous, stop));
    };
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  function visit(stop: Stop) {
    setTour((previous) => recordStop(previous, stop));
    if (location.hash !== "#" + stop.id)
      history.pushState(null, "", "#" + stop.id);
    document.getElementById(stop.id)?.scrollIntoView({ block: "start" });
  }

  function exit() {
    const target = tour && document.getElementById(tour.current.id);
    setTour(null);
    setShowStops(false);
    if (target) target.focus({ preventScroll: true });
    else startButton.current?.focus({ preventScroll: true });
  }

  const current = tour?.current ?? stops[0];
  const index = stops.indexOf(current);
  const previous = stops[index - 1];
  const following = stops[index + 1];
  const unvisited = stops.find((stop) => !tour?.visited.has(stop.id));
  const next = unvisited && (following ?? unvisited);

  return (
    <>
      <button
        ref={startButton}
        type="button"
        className="portfolio-tour-launch"
        aria-expanded={Boolean(tour)}
        aria-controls={tour ? "portfolio-tour-panel" : undefined}
        onClick={() => {
          if (!tour) visit(stops[0]);
          requestAnimationFrame(() =>
            nextButton.current?.focus({ preventScroll: true }),
          );
        }}
      >
        <Compass size={17} aria-hidden="true" /> <span>Guided tour</span>
      </button>
      {tour && (
        <aside
          id="portfolio-tour-panel"
          className="portfolio-tour-panel"
          aria-label="Portfolio guided tour"
          hidden={suspended}
          onKeyDown={(event) => {
            if (event.key !== "Escape") return;
            if (showStops) {
              setShowStops(false);
              stopsButton.current?.focus();
            } else {
              exit();
            }
          }}
        >
          {showStops && (
            <div
              id="portfolio-tour-stops"
              className="portfolio-tour-stops"
              role="group"
              aria-label="Tour stops"
            >
              {stops.map((stop) => (
                <button
                  key={stop.id}
                  type="button"
                  aria-current={current.id === stop.id ? "step" : undefined}
                  onClick={() => {
                    visit(stop);
                    setShowStops(false);
                    stopsButton.current?.focus({ preventScroll: true });
                  }}
                >
                  {stop.name}
                  {tour.visited.has(stop.id) && (
                    <>
                      <Check size={15} aria-hidden="true" />
                      <span className="portfolio-tour-sr">, visited</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          )}
          <div
            className="portfolio-tour-context"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="portfolio-tour-progress">
              {tour.visited.size} of {stops.length} visited
            </span>
            <strong>{current.name}</strong>
            <p>{current.tip}</p>
          </div>
          <div className="portfolio-tour-actions">
            <button
              type="button"
              aria-label="Previous stop"
              disabled={!previous}
              onClick={() => previous && visit(previous)}
            >
              <ArrowLeft size={17} />
            </button>
            <button
              ref={nextButton}
              type="button"
              className="portfolio-tour-next"
              onClick={() => {
                if (next) visit(next);
                else exit();
              }}
            >
              {next
                ? following
                  ? "Next stop"
                  : "Continue tour"
                : "Finish tour"}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
            <button
              ref={stopsButton}
              type="button"
              aria-expanded={showStops}
              aria-controls={showStops ? "portfolio-tour-stops" : undefined}
              onClick={() => setShowStops(!showStops)}
            >
              <List size={17} aria-hidden="true" /> All stops
            </button>
            <button type="button" aria-label="Exit tour" onClick={exit}>
              <X size={18} />
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
