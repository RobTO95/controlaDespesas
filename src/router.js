const routes = {
    "/home": "views/home.html",
    "/despesas": "views/despesas.html",
    "/funcionarios": "views/funcionarios.html",
    "/analises": "views/analises.html",
    "/funcionario": "views/funcionario.html",
};

async function loadPage(path) {
    const route = routes[path] || routes["/home"];
    try {
        const response = await fetch(route);
        const html = await response.text();
        document.getElementById("app").innerHTML = html;

        if (path === "/despesas") {
            import("./controllers/despesas.js").then((module) => {
                module.openDespesas();
            });
        } else if (path === "/funcionarios") {
            import("./controllers/funcionarios.js").then((module) => {
                module.openFuncionarios();
            });
        }
    } catch (e) {
        document.getElementById("app").innerHTML =
            "<h2>Erro ao carregar a página.</h2>";
    }
}

function highlightActiveLink(path) {
    const links = document.querySelectorAll("nav a");
    links.forEach((link) => {
        // Remove destaque anterior
        link.classList.remove("activeNav");

        // Compara o hash atual com o href do link
        const hrefPath = link.getAttribute("href").slice(1); // remove o '#'
        if (hrefPath === path) {
            link.classList.add("activeNav");
        }
    });
}

function router() {
    const hash = window.location.hash.slice(1) || "/home"; // remove o '#'
    loadPage(hash);
    highlightActiveLink(hash); // Destaca o link correspondente
}

// Inicializa o router e adiciona o ouvinte de hashchange
window.addEventListener("load", router);
window.addEventListener("hashchange", router);
