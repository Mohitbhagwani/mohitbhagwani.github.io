import { useId, useState, lazy, Suspense } from "react";
import {
  ArrowUpRight,
  ChevronRight,
  ChevronDown,
  Boxes,
  GitBranch,
  Workflow,
  Trophy,
  GraduationCap,
  Award,
  Github,
  FileText,
} from "lucide-react";
import {
  caseStudies,
  districts,
  experience,
  profile,
  awards,
  type CaseStudy,
} from "../content/portfolio";
import ArchitectureExplorer from "./ArchitectureExplorer";

const Playground = lazy(() => import("../simulations/Playground"));
export function CaseDetail({ study }: { study: CaseStudy }) {
  return (
    <article className="case-detail">
      <span className="eyebrow">
        CASE STUDY {study.number} / {study.category}
      </span>
      <h2>{study.title}</h2>
      <p className="lead">{study.summary}</p>
      <div className="tags">
        {study.tags.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
      <div className="detail-grid">
        <section>
          <h3>The business problem</h3>
          <p>{study.problem}</p>
        </section>
        <section>
          <h3>The engineering challenge</h3>
          <p>{study.challenge}</p>
        </section>
      </div>
      <section className="contribution">
        <span className="eyebrow">MY CONTRIBUTION</span>
        <p>{study.contribution}</p>
      </section>
      <section>
        <h3>Explore the system</h3>
        <ArchitectureExplorer stages={study.architecture} />
      </section>
      <div className="detail-grid">
        {[
          ["Technology choices", study.choices],
          ["Engineering trade-offs", study.tradeoffs],
          ["Implementation approach", study.implementation],
          ["Reliability & error handling", study.reliability],
          ["What I learned", study.lesson],
          ["Outcome & scope", study.outcome],
        ].map(([title, text]) => (
          <section key={title}>
            <h3>{title}</h3>
            <p>{text}</p>
          </section>
        ))}
      </div>
      {study.demo && (
        <section className="embedded-demo">
          <span className="eyebrow">MAKE IT TANGIBLE</span>
          <Suspense fallback={<p>Loading demonstration…</p>}>
            <Playground initial={study.demo} />
          </Suspense>
        </section>
      )}
    </article>
  );
}
export function Recognition() {
  return (
    <>
      <div className="recognition-grid">
        {awards.map((a, i) => (
          <details key={a.title} className="award">
            <summary>
              <span className="award-object">
                {i % 2 ? <Award size={34} /> : <Trophy size={34} />}
              </span>
              <span className="eyebrow">
                {a.source} · {a.date}
              </span>
              <strong>{a.title}</strong>
              <ChevronDown size={18} className="disclosure-chevron" />
            </summary>
            <p>{a.description}</p>
          </details>
        ))}
      </div>
      <div className="certifications">
        <span className="eyebrow">MICROSOFT CERTIFICATIONS</span>
        <h3>A foundation in the cloud.</h3>
        <div>
          <span>
            <Award /> Azure Administrator Associate
          </span>
          <span>
            <Award /> Azure Developer Associate
          </span>
        </div>
        <p className="fine-print">
          Certification credentials supplied by Mohit. Current validity has not
          been verified; active status is not claimed.
        </p>
      </div>
    </>
  );
}
export function Career() {
  const roles = useId();
  return (
    <>
      <div className="timeline">
        {experience.map((e, i) => (
          <details key={e.company} name={roles} open={i === 0}>
            <summary>
              <span className="timeline-date">
                {e.period}
                {i === 0 && <b className="current-tag">Current</b>}
              </span>
              <span>
                <strong>{e.company}</strong>
                <span className="role">{e.role}</span>
              </span>
              <ChevronDown size={20} className="disclosure-chevron" />
            </summary>
            <div className="timeline-story">
              <h4>{e.description}</h4>
              <p>{e.details}</p>
            </div>
          </details>
        ))}
      </div>
      <div className="education">
        <GraduationCap size={30} />
        <div>
          <span className="eyebrow">2019 — 2022 / EDUCATION</span>
          <h3>Bachelor of Computer Applications</h3>
          <p>
            Cloud Technology and Information Security
            <br />
            Vivekananda Global University, Jaipur · CGPA 9.0
          </p>
        </div>
      </div>
    </>
  );
}
export function DistrictDetail({
  id,
  onOpen,
}: {
  id: string;
  onOpen: (id: string) => void;
}) {
  const district = districts.find((d) => d.id === id)!;
  return (
    <>
      <span className="eyebrow">DISTRICT {district.number}</span>
      <h2>{district.name}</h2>
      <p className="lead">{district.subtitle}</p>
      {id === "museum" ? (
        <Recognition />
      ) : id === "career" ? (
        <Career />
      ) : id === "playground" ? (
        <Suspense fallback={<p>Loading demonstrations…</p>}>
          <Playground />
        </Suspense>
      ) : (
        <div className="district-cases">
          {district.cases.map((id) => {
            const c = caseStudies.find((c) => c.id === id)!;
            return (
              <button
                className="case-link"
                key={id}
                onClick={() => onOpen("case/" + id)}
              >
                <span>{c.number}</span>
                <div>
                  <small>{c.category}</small>
                  <h3>{c.title}</h3>
                  <p>{c.summary}</p>
                </div>
                <ArrowUpRight />
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
export function SelectedWork({ onOpen }: { onOpen: (id: string) => void }) {
  const [study, setStudy] = useState(caseStudies[0]);

  return (
    <section
      id="work"
      tabIndex={-1}
      className="section work-section"
      aria-labelledby="work-title"
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">SELECTED ENGINEERING</span>
          <h2 id="work-title">Backend case studies</h2>
        </div>
        <p>
          Follow a payment, step through a Java migration, or explore another
          system stage by stage.
        </p>
      </div>
      <div className="case-explorer">
        <div
          className="case-picker"
          role="group"
          aria-label="Select a case study"
        >
          {caseStudies.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={study.id === item.id}
              aria-controls="case-preview"
              onClick={() => setStudy(item)}
            >
              <span>{item.label}</span>
              <ChevronRight size={17} aria-hidden="true" />
            </button>
          ))}
        </div>
        <article id="case-preview" className="case-preview">
          <header aria-live="polite">
            <h3>{study.title}</h3>
            <p>{study.summary}</p>
          </header>
          <ArchitectureExplorer key={study.id} stages={study.architecture} />
          <div className="case-preview-actions">
            <button
              className="button dark"
              onClick={() => onOpen("case/" + study.id)}
            >
              Read case study <ArrowUpRight size={17} />
            </button>
            {study.demo && (
              <button
                className="button"
                onClick={() => onOpen("demo/" + study.demo)}
              >
                Try simulation <ArrowUpRight size={17} />
              </button>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

const experiments = [
  {
    id: "payments",
    title: "Payment orchestration",
    prompt: "What if a provider times out?",
    icon: Workflow,
  },
  {
    id: "inventory",
    title: "Inventory reservations",
    prompt: "Three buyers want the last two items.",
    icon: Boxes,
  },
  {
    id: "kyc",
    title: "Identity verification",
    prompt: "How does a verification reach manual review?",
    icon: GitBranch,
  },
];

export function Portfolio({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <>
      <section className="lab-section" id="lab" tabIndex={-1}>
        <div>
          <span className="eyebrow">02 / THINK LIKE AN ENGINEER</span>
          <h2>
            Break things.
            <br />
            Learn something.
          </h2>
          <p>
            What happens when a provider fails? Or three people buy the last two
            items? Find out in a collection of hands-on system experiments.
          </p>
          <button className="button lime" onClick={() => onOpen("playground")}>
            Enter the playground <ArrowUpRight size={18} />
          </button>
          <span className="lab-note">
            Educational demonstrations. Zero real transactions.
          </span>
        </div>
        <div
          className="lab-experiments"
          role="group"
          aria-label="Choose an experiment"
        >
          {experiments.map(({ id, title, prompt, icon: Icon }) => (
            <button key={id} type="button" onClick={() => onOpen("demo/" + id)}>
              <Icon size={24} aria-hidden="true" />
              <span>
                <strong>{title}</strong>
                <small>{prompt}</small>
              </span>
              <ArrowUpRight size={17} aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>
      <section
        id="experience"
        tabIndex={-1}
        className="section experience-section"
      >
        <div className="section-heading">
          <div>
            <span className="eyebrow">03 / THE JOURNEY SO FAR</span>
            <h2>Built on experience.</h2>
          </div>
          <p>Fintech, enterprise systems, and the people who build them.</p>
        </div>
        <Career />
      </section>
      <section id="about" tabIndex={-1} className="section about-section">
        <div className="about-intro">
          <span className="eyebrow">04 / THE ENGINEER BEHIND THE SYSTEMS</span>
          <h2>
            Curious by nature.
            <br />
            Backend by craft.
          </h2>
          <p>
            I’m Mohit, a backend software engineer based in Jaipur. My work sits
            where payments, distributed systems, and thoughtful software
            architecture meet.
          </p>
          <p>
            I care about clear APIs, reliable transactions, and systems that
            other engineers can understand and evolve. I also care about the
            people building them.
          </p>
          <div className="about-links">
            <a href="#work">
              Explore my work <ArrowUpRight size={16} />
            </a>
            <a href="#skills">
              See my toolkit <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </section>
      <section id="recognition" tabIndex={-1} className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">05 / A FEW MILESTONES</span>
            <h2>Work that was noticed.</h2>
          </div>
        </div>
        <Recognition />
      </section>
      <section id="contact" tabIndex={-1} className="contact-section">
        <span className="eyebrow">
          NEXT / LET’S BUILD SOMETHING THAT MATTERS
        </span>
        <h2>
          Good systems start
          <br />
          with a conversation<span>.</span>
        </h2>
        <div className="contact-bottom">
          <p>
            Based in Jaipur. Open to international opportunities,
            <br />
            including the UK and Europe.
          </p>
          <div className="button-row">
            {profile.email ? (
              <a className="button dark" href={"mailto:" + profile.email}>
                Email me <ArrowUpRight size={18} />
              </a>
            ) : (
              <button className="button dark" onClick={() => onOpen("contact")}>
                Let’s connect <ArrowUpRight size={18} />
              </button>
            )}
            {profile.linkedin && (
              <a
                className="button"
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn <ArrowUpRight size={17} />
              </a>
            )}
            <a
              className="button"
              href={profile.github}
              target="_blank"
              rel="noreferrer"
            >
              <Github size={17} /> GitHub
            </a>
            <button className="button" onClick={() => onOpen("resume")}>
              <FileText size={17} /> Résumé
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
