export default function Stepper({ steps = [], current = 0 }) {
  const total = steps.length || 1;
  const safeCurrent = Math.min(current + 1, total);
  const label = steps[current]?.label;
  const pct = `${(safeCurrent / total) * 100}%`;

  return (
    <div className="ui-stepper">
      <div className="ui-stepper__row">
        <span>
          Step {safeCurrent} of {total}
        </span>
        {label ? <span className="truncate">{label}</span> : null}
      </div>
      <div className="ui-stepper__bar" aria-hidden="true">
        <div className="ui-stepper__fill" style={{ width: pct }} />
      </div>
    </div>
  );
}


