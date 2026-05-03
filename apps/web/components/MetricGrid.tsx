import { metrics } from "../app/data";

export function MetricGrid() {
  return (
    <section className="metrics" aria-label="Indicadores principais">
      {metrics.map((metric) => (
        <article className={`metric ${metric.tone}`} key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
          <small>{metric.detail}</small>
        </article>
      ))}
    </section>
  );
}
