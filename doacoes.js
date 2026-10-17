document.addEventListener("DOMContentLoaded", function () {

    const POR_PAGINA = 6;

    const $ = id => document.getElementById(id);
    const esc = t => String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const moeda = n => "R$" + n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const dataBR = iso => iso.split("-").reverse().join("/");

    // ===== Doações do usuário ligadas aos projetos =====
    const doacoes = todasAsDoacoes()
        .map(d => ({ ...d, projeto: projetos.find(p => p.id === d.id) }))
        .filter(d => d.projeto)
        .map(d => {
            d.concluido = d.projeto.dias === 0 || d.projeto.pct >= 100;
            return d;
        });

    // ===== Resumo =====
    const total = doacoes.reduce((soma, d) => soma + d.valor, 0);
    const projetosDiferentes = new Set(doacoes.map(d => d.id)).size;
    const concluidos = new Set(doacoes.filter(d => d.concluido).map(d => d.id)).size;

    $("resTotal").textContent = moeda(total);
    $("resTotalSub").textContent = `em ${doacoes.length} ${doacoes.length === 1 ? "doação" : "doações"}`;
    $("resProjetos").textContent = projetosDiferentes;
    $("resDoacoes").textContent = doacoes.length;
    $("resConcluidos").textContent = concluidos;
    $("resConcluidosSub").textContent = concluidos === 1 ? "projeto concluído" : "projetos concluídos";

    // ===== Estado da lista =====
    let filtro = "todas";
    let ordem = "recentes";
    let pagina = 1;

    function filtradas() {
        const lista = doacoes.filter(d =>
            filtro === "todas" ||
            (filtro === "andamento" && !d.concluido) ||
            (filtro === "concluido" && d.concluido));

        if (ordem === "recentes") lista.sort((a, b) => b.data.localeCompare(a.data));
        else if (ordem === "antigas") lista.sort((a, b) => a.data.localeCompare(b.data));
        else if (ordem === "valor") lista.sort((a, b) => b.valor - a.valor);
        return lista;
    }

    function linha(d) {
        const p = d.projeto;
        const status = d.concluido
            ? `<span class="status concluido">Projeto concluído <i class="fa-solid fa-award"></i></span>`
            : `<span class="status">Doação confirmada</span>`;

        return `
        <a href="projeto.html?id=${p.id}" class="doacao">
            <div class="doacao-foto" style="background-image:url('${p.img}')"></div>
            <div class="doacao-projeto">
                <strong>${esc(p.titulo)}</strong>
                <small>${esc(p.desc)}</small>
            </div>
            <span class="doacao-valor">${moeda(d.valor)}</span>
            <span class="doacao-data">${dataBR(d.data)}</span>
            <span class="doacao-status">${status}</span>
            <i class="fa-solid fa-chevron-right seta"></i>
        </a>`;
    }

    function renderizar() {
        const lista = filtradas();
        const totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
        if (pagina > totalPaginas) pagina = totalPaginas;

        const inicio = (pagina - 1) * POR_PAGINA;
        const visiveis = lista.slice(inicio, inicio + POR_PAGINA);

        $("listaDoacoes").innerHTML = visiveis.length
            ? visiveis.map(linha).join("")
            : `<div class="vazio">
                   <p>Nenhuma doação encontrada nesta categoria.</p>
                   <a href="explorar.html" class="btn-azul">Explorar projetos</a>
               </div>`;

        const primeiro = lista.length ? inicio + 1 : 0;
        const ultimo = Math.min(inicio + POR_PAGINA, lista.length);
        $("textoPaginacao").textContent = `Mostrando ${primeiro} a ${ultimo} de ${lista.length} projetos`;

        let botoes = `<button type="button" class="pag" data-pag="anterior" aria-label="Página anterior" ${pagina === 1 ? "disabled" : ""}>
                          <i class="fa-solid fa-chevron-left"></i></button>`;
        for (let i = 1; i <= totalPaginas; i++) {
            botoes += `<button type="button" class="pag ${i === pagina ? "ativo" : ""}" data-pag="${i}">${i}</button>`;
        }
        botoes += `<button type="button" class="pag" data-pag="proxima" aria-label="Próxima página" ${pagina === totalPaginas ? "disabled" : ""}>
                       <i class="fa-solid fa-chevron-right"></i></button>`;
        $("botoesPaginacao").innerHTML = botoes;
    }

    // ===== Eventos =====
    document.querySelectorAll(".aba").forEach(aba => {
        aba.addEventListener("click", () => {
            document.querySelectorAll(".aba").forEach(a => a.classList.remove("ativo"));
            aba.classList.add("ativo");
            filtro = aba.dataset.filtro;
            pagina = 1;
            renderizar();
        });
    });

    $("ordenacao").addEventListener("change", e => {
        ordem = e.target.value;
        pagina = 1;
        renderizar();
    });

    $("botoesPaginacao").addEventListener("click", e => {
        const botao = e.target.closest(".pag");
        if (!botao || botao.disabled) return;

        const valor = botao.dataset.pag;
        if (valor === "anterior") pagina--;
        else if (valor === "proxima") pagina++;
        else pagina = Number(valor);
        renderizar();
    });

    renderizar();
});