import type { ReactNode } from "react";
import { tenant } from "../app/data";

const navItems = [
  { label: "Cockpit", href: "#dashboard" },
  { label: "Ordens", href: "#ordens" },
  { label: "Agenda", href: "#agenda" },
  { label: "Contratos", href: "#contratos" },
  { label: "Campo", href: "#campo" },
  { label: "Estoque", href: "#estoque" },
  { label: "Avancado", href: "#console" },
];

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brandMark">
          <img src="/icemax.PNG" alt="ICEMAX Ar Condicionado" />
        </div>
        <div className="tenant">
          <strong>{tenant.name}</strong>
          <span>{tenant.label}</span>
        </div>

        <nav aria-label="Menu principal">
          {navItems.map((item) => (
            <a className={item.label === "Cockpit" ? "active" : ""} href={item.href} key={item.label}>
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      <main className="main">{children}</main>
    </div>
  );
}
