import { AuthPanel } from "./AuthPanel";

export function Topbar() {
  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Painel operacional</p>
          <h1>Controle de ordens de servico</h1>
        </div>
        <div className="actions">
          <button className="secondary">Exportar</button>
          <button>Nova OS</button>
        </div>
      </header>
      <AuthPanel />
    </>
  );
}
