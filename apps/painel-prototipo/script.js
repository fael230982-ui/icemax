const titles = {
  dashboard: "Dashboard operacional",
  orders: "Ordens de servico",
  schedule: "Agenda inteligente",
  field: "Equipe em campo",
  stock: "Estoque e pecas",
  ai: "Assistente IA",
  settings: "Configuracao whitelabel",
};

const navItems = document.querySelectorAll(".nav-item");
const views = document.querySelectorAll(".view");
const title = document.querySelector("#view-title");

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    const viewId = item.dataset.view;

    navItems.forEach((nav) => nav.classList.remove("active"));
    views.forEach((view) => view.classList.remove("active"));

    item.classList.add("active");
    document.querySelector(`#${viewId}`).classList.add("active");
    title.textContent = titles[viewId];
  });
});
