import type { ReactNode } from "react";

type PanelProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  action?: ReactNode;
  wide?: boolean;
  children: ReactNode;
};

export function Panel({ id, eyebrow, title, action, wide, children }: PanelProps) {
  return (
    <article className={`panel ${wide ? "xl" : ""}`} id={id}>
      <div className="panelHeader">
        <div>
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h2>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </article>
  );
}
