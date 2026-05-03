import type { ReactNode } from "react";
import { tenant } from "../app/data";

const navItems = [
  "Dashboard",
  "Ordens",
  "Clientes",
  "Equipamentos",
  "Contratos",
  "PMOC",
  "Orcamentos",
  "Checklists",
  "Mapas",
  "QR",
  "Agenda",
  "Campo",
  "Estoque",
  "Manuais",
  "IA",
  "Notificacoes",
  "Integracoes",
  "Whitelabel",
];

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brandMark">IM</div>
        <div className="tenant">
          <strong>{tenant.name}</strong>
          <span>{tenant.label}</span>
        </div>

        <nav aria-label="Menu principal">
          {navItems.map((item) => (
            <a className={item === "Dashboard" ? "active" : ""} href={`#${item.toLowerCase()}`} key={item}>
              {item}
            </a>
          ))}
        </nav>
      </aside>

      <main className="main">{children}</main>
    </div>
  );
}
