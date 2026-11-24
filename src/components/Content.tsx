import { useState, lazy, Suspense } from "react";
import {
  ArrowUpRight,
  ArrowRight,
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
const Playground = lazy(() => import("../simulations/Playground"));
export function CaseDetail({ study }: { study: CaseStudy }) {
  const [node, setNode] = useState(0);
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
        <h3>A conceptual view of the system</h3>
        <p className="fine-print">
          Public educational abstraction. Select a stage to inspect its
          responsibility.
        </p>
        <div className="architecture-flow">
          {study.architecture.map((n, i) => (
            <button
              key={n}
              onClick={() => setNode(i)}
              className={node === i ? "active" : ""}
            >
              <small>{String(i + 1).padStart(2, "0")}</small>
              {n}
              {i < study.architecture.length - 1 && <ArrowRight size={14} />}
            </button>
          ))}
        </div>
        <p className="node-description" aria-live="polite">
          <b>{study.architecture[node]}</b> ·{" "}
          {node === 0
            ? study.problem
            : node === study.architecture.length - 1
              ? study.reliability
              : node % 2
                ? study.choices
                : study.implementation}
        </p>
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
          <article key={a.title} className="award">
            <div className="award-object">
              {i % 2 ? (
                <Award size={52} strokeWidth={1} />
              ) : (
                <Trophy size={52} strokeWidth={1} />
              )}
            </div>
            <span className="eyebrow">
              {a.source} / {a.date}
            </span>
            <h3>{a.title}</h3>
            <p>{a.description}</p>
          </article>
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
  return (
    <>
      <div className="timeline">
        {experience.map((e, i) => (
          <article key={e.company}>
            <div className="timeline-date">
              <span>{e.period}</span>
              {i === 0 && <b className="current-tag">CURRENT</b>}
            </div>
            <div>
              <h3>{e.company}</h3>
              <span className="role">{e.role}</span>
              <h4>{e.description}</h4>
              <p>{e.details}</p>
            </div>
          </article>
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
export function Portfolio({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <>
      <section id="work" className="section work-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">01 / SELECTED ENGINEERING</span>
            <h2>
              Behind every seamless
              <br />
              experience, a system.
            </h2>
          </div>
          <p>
            A closer look at the decisions, trade-offs, and details that make
            backend engineering matter.
          </p>
        </div>
        <div className="work-list">
          {caseStudies.map((c) => (
            <button
              className="case-link"
              key={c.id}
              onClick={() => onOpen("case/" + c.id)}
            >
              <span className="case-number">{c.number}</span>
              <div>
                <small>{c.category}</small>
                <h3>{c.title}</h3>
                <div className="tags">
                  {c.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </div>
              <span className="circle-arrow">
                <ArrowUpRight size={22} />
              </span>
            </button>
          ))}
        </div>
      </section>
      <section className="lab-section" id="lab">
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
        <button
          className="lab-art"
          aria-label="Open payment orchestration simulator"
          onClick={() => onOpen("demo/payments")}
        >
          <div className="lab-grid" />
          <span className="lab-chip chip-one">
            REQUEST <small>order-001</small>
          </span>
          <span className="lab-line line-one" />
          <span className="lab-chip chip-core">
            ∞<small>IDEMPOTENCY</small>
          </span>
          <span className="lab-line line-two" />
          <span className="lab-chip chip-two">
            ONE PAYMENT <small>exactly one intent</small>
          </span>
          <span className="lab-art-caption">
            <span className="live-dot" /> THE BEAUTY IS IN THE BEHAVIOR{" "}
            <ArrowUpRight size={16} />
          </span>
        </button>
      </section>
      <section id="experience" className="section experience-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">03 / THE JOURNEY SO FAR</span>
            <h2>Built on experience.</h2>
          </div>
          <p>Fintech, enterprise systems, and the people who build them.</p>
        </div>
        <Career />
      </section>
      <section id="about" className="section about-section">
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
          <div className="about-footer">
            <span className="location-dot" /> JAIPUR, RAJASTHAN, INDIA{" "}
            <span>26.91° N / 75.79° E</span>
          </div>
        </div>
      </section>
      <section id="recognition" className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">05 / A FEW MILESTONES</span>
            <h2>Work that was noticed.</h2>
          </div>
        </div>
        <Recognition />
      </section>
      <section id="contact" className="contact-section">
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
                Get in touch <ArrowUpRight size={18} />
              </a>
            ) : (
              <button className="button dark" onClick={() => onOpen("contact")}>
                Let’s connect <ArrowUpRight size={18} />
              </button>
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
