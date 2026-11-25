import { useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { CaseStudy } from "../content/portfolio";

export default function ArchitectureExplorer({
  stages,
}: {
  stages: CaseStudy["architecture"];
}) {
  const [selected, setSelected] = useState(0);
  const stage = stages[selected];

  return (
    <div className="case-flow">
      <ol
        className="case-flow-steps"
        style={{ "--step-count": stages.length } as CSSProperties}
        aria-label="System stages"
      >
        {stages.map(({ name }, index) => (
          <li key={name} data-progress={index <= selected}>
            <button
              aria-current={index === selected ? "step" : undefined}
              onClick={() => setSelected(index)}
              type="button"
            >
              <span className="case-flow-marker" aria-hidden="true">
                {index < selected ? <Check size={15} /> : index + 1}
              </span>
              {name}
            </button>
          </li>
        ))}
      </ol>
      <div className="case-flow-detail">
        <div
          className="case-flow-readout"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="case-flow-position">
            Stage {selected + 1} of {stages.length}
          </span>
          <strong>{stage.name}</strong>
          <p>{stage.description}</p>
          {stage.example && (
            <div className="case-flow-example">
              <span>{stage.example.caption}</span>
              <dl>
                {stage.example.fields.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
        <div className="case-flow-controls">
          <button
            type="button"
            aria-label="Previous stage"
            disabled={selected === 0}
            onClick={() => setSelected(selected - 1)}
          >
            <ArrowLeft size={17} />
          </button>
          <button
            type="button"
            disabled={selected === stages.length - 1}
            onClick={() => setSelected(selected + 1)}
          >
            Next stage <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
