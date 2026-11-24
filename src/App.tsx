import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Box,
  FileText,
  Github,
  Layers3,
} from "lucide-react";
import { districts, caseStudies, profile } from "./content/portfolio";
import Modal from "./components/Modal";
import TraceAtlas from "./components/TraceAtlas";
import Workshop from "./components/Workshop";
import { CaseDetail, DistrictDetail, Portfolio } from "./components/Content";

const Playground = lazy(() => import("./simulations/Playground"));
function readViewHash() {
  if (!location.hash.startsWith("#view/")) return null;
  try {
    return decodeURIComponent(location.hash.slice(6));
  } catch {
    return null;
  }
}
function hasWebGL() {
  try {
    const context = document.createElement("canvas").getContext("webgl2");
    const supported = !!context;
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return supported;
  } catch {
    return false;
  }
}
export default function App() {
  const [plain, setPlain] = useState(
    () =>
      matchMedia("(max-width: 760px), (prefers-reduced-motion: reduce)")
        .matches || !hasWebGL(),
  );
  const [modal, setModal] = useState<string | null>(readViewHash);
  const open = useCallback((id: string) => {
    history.pushState(null, "", "#view/" + encodeURIComponent(id));
    setModal(id);
  }, []);
  const close = useCallback(() => {
    history.replaceState(null, "", location.pathname + location.search);
    setModal(null);
  }, []);
  useEffect(() => {
    const update = () => setModal(readViewHash());
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const preferStill = () => {
      if (reduce.matches) setPlain(true);
    };
    addEventListener("hashchange", update);
    addEventListener("popstate", update);
    reduce.addEventListener("change", preferStill);
    return () => {
      removeEventListener("hashchange", update);
      removeEventListener("popstate", update);
      reduce.removeEventListener("change", preferStill);
    };
  }, []);
  const study = modal?.startsWith("case/")
    ? caseStudies.find((c) => c.id === modal.slice(5))
    : undefined;
  const activeDistrict = districts.find((d) => d.id === modal);

  return (
    <>
      <a href="#work" className="skip-link">
        Skip to portfolio content
      </a>
      <header className="atlas-header">
        <a href="#" className="atlas-brand" aria-label="Mohit Bhagwani home">
          <span className="atlas-mark">
            mb<span>.</span>
          </span>
          <span>
            Mohit Bhagwani<small>DESIGN. BUILD. SCALE.</small>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#work">Case studies</a>
          <a href="#experience">Experience</a>
          <a href="#skills">Skills</a>
          <a href="#contact">
            Contact <ArrowUpRight size={14} />
          </a>
        </nav>
        <button
          className="atlas-mode"
          onClick={() => {
            if (!plain || hasWebGL()) setPlain(!plain);
          }}
          aria-pressed={!plain}
        >
          {plain ? <Box size={16} /> : <Layers3 size={16} />}{" "}
          {plain ? "Enable 3D" : "2D portfolio"}
        </button>
      </header>
      <main>
        <TraceAtlas plain={plain} onOpen={open} />
        <Workshop plain={plain} onOpen={open} />
        <Portfolio onOpen={open} />
      </main>
      <footer>
        <a href="#" className="footer-brand">
          mb. <span>BEYOND THE BACKEND</span>
        </a>
        <a href={profile.github} target="_blank" rel="noreferrer">
          View GitHub <ArrowUpRight size={14} />
        </a>
        <span>© {new Date().getFullYear()} Mohit Bhagwani</span>
      </footer>
      {modal && (
        <Modal
          title={
            study?.category ??
            activeDistrict?.name ??
            (modal === "resume"
              ? "Résumé"
              : modal === "contact"
                ? "Let’s connect"
                : modal === "map"
                  ? "World map"
                  : "Engineering playground")
          }
          onClose={close}
        >
          {study ? (
            <CaseDetail key={study.id} study={study} />
          ) : activeDistrict ? (
            <DistrictDetail id={activeDistrict.id} onOpen={open} />
          ) : modal === "resume" ? (
            <>
              <FileText size={40} />
              <h2>The résumé.</h2>
              <p className="lead">
                The experience is ready. The download is awaiting a verified
                file.
              </p>
              {profile.resume ? (
                <a className="button dark" href={profile.resume} download>
                  Download résumé
                </a>
              ) : (
                <p className="configuration-note">
                  Résumé download is not configured. The career timeline is
                  available below.
                </p>
              )}
              <button
                className="button dark"
                onClick={() => {
                  close();
                  document.getElementById("experience")?.scrollIntoView();
                }}
              >
                View career timeline <ArrowRight size={16} />
              </button>
            </>
          ) : modal === "contact" ? (
            <>
              <span className="eyebrow">
                OPEN TO INTERNATIONAL OPPORTUNITIES
              </span>
              <h2>
                Let’s build
                <br />
                what’s next.
              </h2>
              <p className="lead">
                Backend engineering, fintech, payment systems, and software
                architecture.
              </p>
              <a
                className="button dark"
                href={profile.github}
                target="_blank"
                rel="noreferrer"
              >
                <Github size={18} /> Find me on GitHub{" "}
                <ArrowUpRight size={18} />
              </a>
              {profile.email && (
                <a className="button" href={"mailto:" + profile.email}>
                  {profile.email}
                </a>
              )}
              {profile.linkedin && (
                <a className="button" href={profile.linkedin}>
                  LinkedIn
                </a>
              )}
              {!profile.email && !profile.linkedin && (
                <p className="configuration-note">
                  Professional email and LinkedIn are awaiting verified details.
                </p>
              )}
            </>
          ) : (
            <>
              <span className="eyebrow">ENGINEERING PLAYGROUND</span>
              <h2>Curiosity, meet cause and effect.</h2>
              <Suspense fallback={<p>Loading demonstration…</p>}>
                <Playground
                  initial={
                    modal.startsWith("demo/") ? modal.slice(5) : "payments"
                  }
                />
              </Suspense>
            </>
          )}
        </Modal>
      )}
    </>
  );
}
