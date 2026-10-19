document.addEventListener("DOMContentLoaded", function () {

    const DESTAQUES_TODOS = [1, 4, 3];   // projetos mostrados em "Todos" (ids do dadosProjetos.js)
    const MAXIMO = 3;

    const $ = id => document.getElementById(id);
    const esc = t => String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const moeda = n => "R$ " + n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });

    const favoritos = new Set();   // favoritos marcados nesta visita

    function projetosDaCategoria(categoria) {
        if (categoria === "Todos") {
            return DESTAQUES_TODOS.map(id => projetos.find(p => p.id === id)).filter(Boolean);
        }
        return projetos
            .filter(p => p.categoria === categoria)
            .sort((a, b) => b.apoiadores - a.apoiadores)
            .slice(0, MAXIMO);
    }

    function cartao(p) {
        const prazo = p.dias === 0 ? "Meta concluída" : `${p.dias} dias restantes`;
        const fav = favoritos.has(p.id);

        return `
        <article class="cartao" data-id="${p.id}" tabindex="0" role="link" aria-label="Abrir ${esc(p.titulo)}">
            <div class="cartao-img" style="background-image:url('${p.img}')">
                <button type="button" class="coracao ${fav ? "ativo" : ""}" data-fav="${p.id}" aria-label="Favoritar projeto">
                    <i class="${fav ? "fa-solid" : "fa-regular"} fa-heart"></i>
                </button>
            </div>
            <div class="cartao-corpo">
                <span class="tag" style="background:${p.cor}">${esc(p.categoria)}</span>
                <h3>${esc(p.titulo)}</h3>
                <p>${esc(p.desc)}</p>

                <div class="cartao-valores">
                    <strong>${moeda(p.arrecadado)}</strong>
                    <span>${p.pct}%</span>
                </div>
                <div class="barra"><div style="width:${p.pct}%; background:${p.cor}"></div></div>
                <div class="cartao-rodape">
                    <span>Meta ${moeda(p.meta)}</span>
                    <span>${prazo}</span>
                </div>
            </div>
        </article>`;
    }

    let categoriaAtual = "Todos";

    function renderizar() {
        const lista = projetosDaCategoria(categoriaAtual);

        $("cardsDestaque").innerHTML = lista.length
            ? lista.map(cartao).join("")
            : '<p class="vazio">Em breve teremos novos projetos nesta categoria.</p>';
    }

    // Filtros
    $("chips").addEventListener("click", e => {
        const chip = e.target.closest(".chip");
        if (!chip) return;

        document.querySelectorAll(".chip").forEach(c => c.classList.remove("ativo"));
        chip.classList.add("ativo");
        categoriaAtual = chip.dataset.categoria;
        renderizar();
    });

    // Clique no cartão abre o projeto; o coração só favorita
    $("cardsDestaque").addEventListener("click", e => {
        const coracao = e.target.closest("[data-fav]");

        if (coracao) {
            const id = Number(coracao.dataset.fav);
            if (favoritos.has(id)) favoritos.delete(id); else favoritos.add(id);
            const ativo = favoritos.has(id);
            coracao.classList.toggle("ativo", ativo);
            coracao.querySelector("i").className = (ativo ? "fa-solid" : "fa-regular") + " fa-heart";
            return;
        }

        const card = e.target.closest(".cartao");
        if (card) window.location.href = "projeto.html?id=" + card.dataset.id;
    });

    $("cardsDestaque").addEventListener("keydown", e => {
        if (e.key !== "Enter") return;
        const card = e.target.closest(".cartao");
        if (card && e.target === card) window.location.href = "projeto.html?id=" + card.dataset.id;
    });

    renderizar();
});