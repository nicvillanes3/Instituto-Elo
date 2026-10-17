document.addEventListener("DOMContentLoaded", function () {

    // ===== Configuração (troque pelos dados reais do usuário logado) =====
    const NOME_CRIADOR = "Mariane";
    const $ = id => document.getElementById(id);

    const meus = MEUS_PROJETOS.map(id => projetos.find(p => p.id === id)).filter(Boolean);
    if (!meus.length) return;

    // ===== Alterações feitas no painel (guardadas no navegador) =====
    const CHAVE = "eloPainelCriador";
    let salvo = { edicoes: {}, atualizacoes: {} };

    try {
        salvo = Object.assign(salvo, JSON.parse(localStorage.getItem(CHAVE)) || {});
    } catch (erro) { /* sem armazenamento disponível */ }

    function guardar() {
        try { localStorage.setItem(CHAVE, JSON.stringify(salvo)); } catch (erro) { /* ignora */ }
    }

    // Aplica edições e novas atualizações salvas
    meus.forEach(p => {
        const ed = salvo.edicoes[p.id];
        if (ed) {
            Object.assign(p, ed);
            p.pct = Math.min(100, Math.round((p.arrecadado / p.meta) * 100));
        }
        const novas = salvo.atualizacoes[p.id] || [];
        p.atualizacoes = [...novas, ...(p.atualizacoes || [])];
    });

    // Campanha em destaque: a primeira em andamento (ou a primeira da lista)
    const idUrl = Number(new URLSearchParams(window.location.search).get("id"));
    const principal = meus.find(p => p.id === idUrl) || meus.find(p => p.dias > 0) || meus[0];

    // ===== Utilitários =====
    const moeda = n => "R$ " + n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
    const num = n => n.toLocaleString("pt-BR");
    const esc = t => String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    function aviso(texto) {
        const el = $("aviso");
        el.textContent = texto;
        el.classList.add("visivel");
        setTimeout(() => el.classList.remove("visivel"), 2500);
    }

    $("nomeCriador").textContent = NOME_CRIADOR;
    $("atalhoPagina").href = "projeto.html?id=" + principal.id;

    // ===== Cartões de resumo =====
    function renderizarResumo() {
        $("arrecadado").textContent = moeda(principal.arrecadado);
        $("deMeta").textContent = "de " + num(principal.meta);
        $("miniBarra").style.width = principal.pct + "%";
        $("miniPct").textContent = principal.pct + "% da meta";
        $("apoiadores").textContent = principal.apoiadores;
        $("dias").textContent = principal.dias;
        $("visualizacoes").textContent = num(principal.apoiadores * 30); // exemplo: troque pelo dado real
    }

    // ===== Dados do gráfico (exemplo gerado a partir do total arrecadado) =====
    function gerarIncrementos(seed, total, dias) {
        let s = seed * 9301 + 49297;
        const rand = () => {
            s = (s * 9301 + 49297) % 233280;
            return s / 233280;
        };
        const pesos = Array.from({ length: dias }, (_, i) => (0.3 + (i / dias) * 1.7) * (0.4 + rand()));
        const somaPesos = pesos.reduce((a, b) => a + b, 0);
        return pesos.map(p => (p / somaPesos) * total);
    }

    const DIAS_TOTAIS = 90;
    const incrementos = gerarIncrementos(principal.id, principal.arrecadado, DIAS_TOTAIS);
    const acumulado = [];
    incrementos.reduce((soma, inc, i) => (acumulado[i] = soma + inc), 0);

    const hoje = new Date();
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    function dataDoIndice(i) {             // i = 0 é o dia mais antigo
        const d = new Date(hoje);
        d.setDate(hoje.getDate() - (DIAS_TOTAIS - 1 - i));
        return d;
    }

    const rotuloData = d => `${d.getDate()} ${meses[d.getMonth()]}`;
    const dataCompleta = d =>
        `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

    // ===== Indicadores abaixo do gráfico =====
    const somaIncrementos = (de, ate) => incrementos.slice(de, ate).reduce((a, b) => a + b, 0);
    const ult7 = somaIncrementos(DIAS_TOTAIS - 7, DIAS_TOTAIS);
    const ant7 = somaIncrementos(DIAS_TOTAIS - 14, DIAS_TOTAIS - 7);
    const media30 = somaIncrementos(DIAS_TOTAIS - 30, DIAS_TOTAIS) / 30;
    const mediaAnt30 = somaIncrementos(DIAS_TOTAIS - 60, DIAS_TOTAIS - 30) / 30;
    const maiorDoacao = Math.round(Math.max(...incrementos) * 0.4 / 10) * 10;

    function tendencia(el, atual, anterior) {
        const variacao = anterior ? Math.round(((atual - anterior) / anterior) * 100) : 0;
        el.textContent = (variacao >= 0 ? "↑ " : "↓ ") + Math.abs(variacao) + "%";
        el.classList.toggle("negativa", variacao < 0);
    }

    $("ind7").textContent = moeda(ult7);
    $("indMedia").textContent = moeda(media30);
    $("indMaior").textContent = moeda(maiorDoacao);
    tendencia($("tend7"), ult7, ant7);
    tendencia($("tendMedia"), media30, mediaAnt30);

    // ===== Gráfico em SVG =====
    const svg = $("graficoSvg");
    const dica = $("dica");
    const L = 44, R = 18, T = 14, B = 30;
    const W = 640, H = 270;
    let pontos = [];

    function desenhar(periodo) {
        const serie = acumulado.slice(DIAS_TOTAIS - periodo);
        const indiceInicial = DIAS_TOTAIS - periodo;

        const maxBruto = Math.max(...serie);
        const passo = maxBruto > 20000 ? 5000 : 2000;
        const maxY = Math.ceil((maxBruto * 1.05) / passo) * passo;

        const x = i => L + (i / (serie.length - 1)) * (W - L - R);
        const y = v => T + (1 - v / maxY) * (H - T - B);

        pontos = serie.map((v, i) => ({ x: x(i), y: y(v), v, data: dataDoIndice(indiceInicial + i) }));

        let html = `
            <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#1265df" stop-opacity="0.28"/>
                    <stop offset="100%" stop-color="#1265df" stop-opacity="0.02"/>
                </linearGradient>
            </defs>`;

        for (let v = 0; v <= maxY; v += passo) {
            const yy = y(v);
            html += `<line x1="${L}" y1="${yy}" x2="${W - R}" y2="${yy}" stroke="#ececec" stroke-width="1"/>
                     <text x="${L - 8}" y="${yy + 3}" text-anchor="end" font-size="9" fill="#555">${v === 0 ? "0" : (v / 1000) + "k"}</text>`;
        }

        const marcas = 6;
        for (let k = 0; k < marcas; k++) {
            const i = Math.round((k / (marcas - 1)) * (serie.length - 1));
            html += `<text x="${x(i)}" y="${H - 10}" text-anchor="middle" font-size="9" fill="#555">${rotuloData(pontos[i].data)}</text>`;
        }

        const linha = pontos.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
        const base = H - B;
        html += `<path d="${linha} L${pontos[pontos.length - 1].x},${base} L${pontos[0].x},${base} Z" fill="url(#areaGrad)"/>
                 <path d="${linha}" fill="none" stroke="#1265df" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
                 <circle id="pontoAtivo" r="4.5" fill="#fff" stroke="#1265df" stroke-width="2.5"/>
                 <rect id="areaHover" x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}" fill="transparent"/>`;

        svg.innerHTML = html;
        mostrarPonto(pontos.length - 1);

        const area = svg.querySelector("#areaHover");
        area.addEventListener("mousemove", e => {
            const caixa = svg.getBoundingClientRect();
            const px = ((e.clientX - caixa.left) / caixa.width) * W;
            let melhor = 0;
            pontos.forEach((p, i) => {
                if (Math.abs(p.x - px) < Math.abs(pontos[melhor].x - px)) melhor = i;
            });
            mostrarPonto(melhor);
        });
        area.addEventListener("mouseleave", () => mostrarPonto(pontos.length - 1));
    }

    function mostrarPonto(i) {
        const p = pontos[i];
        const ponto = svg.querySelector("#pontoAtivo");
        ponto.setAttribute("cx", p.x);
        ponto.setAttribute("cy", p.y);

        dica.hidden = false;
        dica.innerHTML = `<span>${rotuloData(p.data)}</span><strong>${moeda(Math.round(p.v))}</strong>`;
        dica.style.left = (p.x / W) * 100 + "%";
        dica.style.top = (p.y / H) * 100 + "%";
    }

    $("periodo").addEventListener("change", e => desenhar(Number(e.target.value)));

    // ===== Projetos que criei =====
    function renderizarProjetos() {
        $("listaProjetos").innerHTML = meus.slice(0, 3).map(p => {
            const encerrado = p.dias === 0 || p.pct >= 100;
            const lado = encerrado
                ? `<span class="selo">Finalizado</span><small>campanha encerrada</small>`
                : `<strong>${p.dias}</strong><small>dias restantes</small>`;

            return `
            <a href="projeto.html?id=${p.id}" class="projeto-linha">
                <div class="projeto-foto" style="background-image:url('${p.img}')"></div>
                <div class="projeto-meio">
                    <strong>${esc(p.titulo)}</strong>
                    <small>${esc(p.org)}</small>
                    <div class="mini-barra"><div style="width:${p.pct}%"></div></div>
                    <div class="projeto-valores">
                        <span>${moeda(p.arrecadado)} arrecadados</span>
                        <span>${p.pct}% da meta</span>
                    </div>
                </div>
                <div class="projeto-lado">${lado}</div>
                <i class="fa-solid fa-chevron-right seta"></i>
            </a>`;
        }).join("");
    }

    // ===== Últimas atualizações =====
    function renderizarAtualizacoes() {
        const todas = [];
        meus.forEach(p => (p.atualizacoes || []).forEach(a => todas.push({ titulo: a[0], texto: a[1], tempo: a[2], projeto: p })));

        // novas (publicadas agora) primeiro; depois a ordem original
        todas.sort((a, b) => (b.tempo === "Agora mesmo") - (a.tempo === "Agora mesmo"));

        $("listaAtualizacoes").innerHTML = todas.slice(0, 3).map(a => `
            <div class="atualizacao">
                <span class="ponto-tempo"></span>
                <div class="atualizacao-foto" style="background-image:url('${a.projeto.img}')"></div>
                <div class="atualizacao-texto">
                    <strong>${esc(a.titulo)}</strong>
                    <p>${esc(a.texto)}</p>
                    <small>${esc(a.tempo)} · ${esc(a.projeto.titulo)}</small>
                </div>
            </div>`).join("") || '<p class="vazio">Nenhuma atualização publicada ainda.</p>';
    }

    // ===== Janela (modal) =====
    const modal = $("modal");
    let ultimoFoco = null;

    function abrirModal(titulo, corpoHtml) {
        ultimoFoco = document.activeElement;
        $("modalTitulo").textContent = titulo;
        $("modalCorpo").innerHTML = corpoHtml;
        modal.hidden = false;
        const primeiro = modal.querySelector("input, textarea, button.btn-modal, .rede");
        if (primeiro) primeiro.focus();
    }

    function fecharModal() {
        modal.hidden = true;
        $("modalCorpo").innerHTML = "";
        if (ultimoFoco) ultimoFoco.focus();
    }

    modal.addEventListener("click", e => {
        if (e.target.closest("[data-fechar]")) fecharModal();
    });

    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && !modal.hidden) fecharModal();
    });

    // ===== Atalho: Editar campanha =====
    function abrirEdicao() {
        abrirModal("Editar campanha", `
            <form id="formEditar" novalidate>
                <label class="campo"><span>Título</span>
                    <input type="text" id="edTitulo" value="${esc(principal.titulo)}" maxlength="80"></label>
                <label class="campo"><span>Descrição</span>
                    <textarea id="edDesc" maxlength="300">${esc(principal.desc)}</textarea></label>
                <div class="campos-duplos">
                    <label class="campo"><span>Meta (R$)</span>
                        <input type="number" id="edMeta" min="1" value="${principal.meta}"></label>
                    <label class="campo"><span>Dias restantes</span>
                        <input type="number" id="edDias" min="0" value="${principal.dias}"></label>
                </div>
                <p class="erro-form" id="erroForm" hidden></p>
                <div class="modal-acoes">
                    <button type="button" class="btn-modal claro" data-fechar>Cancelar</button>
                    <button type="submit" class="btn-modal">Salvar alterações</button>
                </div>
            </form>`);

        $("formEditar").addEventListener("submit", e => {
            e.preventDefault();

            const titulo = $("edTitulo").value.trim();
            const desc = $("edDesc").value.trim();
            const meta = Number($("edMeta").value);
            const dias = Number($("edDias").value);
            const erro = $("erroForm");

            let mensagem = "";
            if (!titulo) mensagem = "Informe o título da campanha.";
            else if (!desc) mensagem = "Escreva uma descrição para a campanha.";
            else if (!(meta > 0)) mensagem = "A meta precisa ser maior que zero.";
            else if (meta < principal.arrecadado) mensagem = "A meta não pode ser menor que o valor já arrecadado (" + moeda(principal.arrecadado) + ").";
            else if (!(dias >= 0)) mensagem = "Os dias restantes não podem ser negativos.";

            if (mensagem) {
                erro.textContent = mensagem;
                erro.hidden = false;
                return;
            }

            Object.assign(principal, { titulo, desc, meta, dias });
            principal.pct = Math.min(100, Math.round((principal.arrecadado / meta) * 100));

            salvo.edicoes[principal.id] = { titulo, desc, meta, dias };
            guardar();

            renderizarResumo();
            renderizarProjetos();
            renderizarAtualizacoes();
            fecharModal();
            aviso("Campanha atualizada!");
        });
    }

    // ===== Atalho: Compartilhar projeto =====
    function abrirCompartilhar() {
        const url = new URL("projeto.html?id=" + principal.id, window.location.href).href;
        const texto = `Apoie o projeto "${principal.titulo}" no Instituto Elo!`;

        abrirModal("Compartilhar projeto", `
            <div class="link-compartilhar">
                <input type="text" id="linkProjeto" value="${esc(url)}" readonly>
                <button type="button" class="btn-modal" id="copiarLink">Copiar</button>
            </div>
            <div class="redes">
                <a class="rede" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(texto + " " + url)}">
                    <i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
                <a class="rede" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}">
                    <i class="fa-brands fa-facebook-f"></i> Facebook</a>
                <a class="rede" href="mailto:?subject=${encodeURIComponent(principal.titulo)}&body=${encodeURIComponent(texto + "\n" + url)}">
                    <i class="fa-regular fa-envelope"></i> E-mail</a>
                ${navigator.share ? '<button type="button" class="rede" id="maisOpcoes"><i class="fa-solid fa-share-nodes"></i> Mais opções</button>' : ""}
            </div>`);

        $("copiarLink").addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(url);
            } catch (erro) {
                $("linkProjeto").select();
                document.execCommand("copy");
            }
            $("copiarLink").textContent = "Copiado!";
            setTimeout(() => { if ($("copiarLink")) $("copiarLink").textContent = "Copiar"; }, 2000);
        });

        const mais = $("maisOpcoes");
        if (mais) {
            mais.addEventListener("click", async () => {
                try { await navigator.share({ title: principal.titulo, text: texto, url }); } catch (erro) { /* cancelado */ }
            });
        }
    }

    // ===== Atalho: Adicionar atualização =====
    function abrirAtualizacao() {
        abrirModal("Adicionar atualização", `
            <form id="formAtualizacao" novalidate>
                <label class="campo"><span>Título da atualização</span>
                    <input type="text" id="atTitulo" maxlength="70" placeholder="Ex.: Chegamos a 70% da meta!"></label>
                <label class="campo"><span>O que há de novo?</span>
                    <textarea id="atTexto" maxlength="240" placeholder="Conte aos apoiadores como a campanha está andando."></textarea></label>
                <p class="erro-form" id="erroForm" hidden></p>
                <div class="modal-acoes">
                    <button type="button" class="btn-modal claro" data-fechar>Cancelar</button>
                    <button type="submit" class="btn-modal">Publicar</button>
                </div>
            </form>`);

        $("formAtualizacao").addEventListener("submit", e => {
            e.preventDefault();

            const titulo = $("atTitulo").value.trim();
            const texto = $("atTexto").value.trim();

            if (!titulo || !texto) {
                $("erroForm").textContent = "Preencha o título e o texto da atualização.";
                $("erroForm").hidden = false;
                return;
            }

            const nova = [titulo, texto, "Agora mesmo"];
            principal.atualizacoes.unshift(nova);

            salvo.atualizacoes[principal.id] = [nova, ...(salvo.atualizacoes[principal.id] || [])];
            guardar();

            renderizarAtualizacoes();
            fecharModal();
            aviso("Atualização publicada!");
            $("atualizacoes").scrollIntoView({ behavior: "smooth", block: "center" });
        });
    }

    // ===== Atalho: Relatórios completos =====
    function abrirRelatorio() {
        const melhorIndice = incrementos.indexOf(Math.max(...incrementos));
        const mediaPorApoiador = principal.apoiadores ? principal.arrecadado / principal.apoiadores : 0;
        const projecao = principal.arrecadado + media30 * principal.dias;
        const faltam = Math.max(0, principal.meta - principal.arrecadado);

        abrirModal("Relatório da campanha", `
            <p class="relatorio-nota">${esc(principal.titulo)} — dados dos últimos ${DIAS_TOTAIS} dias.</p>
            <div class="relatorio-grade">
                <div class="relatorio-item"><small>Total arrecadado</small><strong>${moeda(principal.arrecadado)}</strong></div>
                <div class="relatorio-item"><small>Falta para a meta</small><strong>${moeda(faltam)}</strong></div>
                <div class="relatorio-item"><small>Doação média por apoiador</small><strong>${moeda(mediaPorApoiador)}</strong></div>
                <div class="relatorio-item"><small>Média diária (30 dias)</small><strong>${moeda(media30)}</strong></div>
                <div class="relatorio-item"><small>Melhor dia</small><strong>${rotuloData(dataDoIndice(melhorIndice))} · ${moeda(incrementos[melhorIndice])}</strong></div>
                <div class="relatorio-item"><small>Projeção ao fim do prazo</small><strong>${moeda(projecao)}</strong></div>
            </div>
            <p class="relatorio-nota">A projeção considera a média diária dos últimos 30 dias mantida até o fim da campanha.</p>
            <div class="modal-acoes">
                <button type="button" class="btn-modal claro" data-fechar>Fechar</button>
                <button type="button" class="btn-modal" id="baixarCsv"><i class="fa-solid fa-download"></i> Baixar CSV</button>
            </div>`);

        $("baixarCsv").addEventListener("click", () => {
            const fmt = n => n.toFixed(2).replace(".", ",");
            let csv = "Data;Doações do dia (R$);Acumulado (R$)\n";
            incrementos.forEach((inc, i) => {
                csv += `${dataCompleta(dataDoIndice(i))};${fmt(inc)};${fmt(acumulado[i])}\n`;
            });

            const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `relatorio-${principal.titulo.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(link.href);

            aviso("Relatório baixado!");
        });
    }

    // ===== Liga os atalhos =====
    const acoes = {
        editar: abrirEdicao,
        compartilhar: abrirCompartilhar,
        atualizar: abrirAtualizacao,
        relatorio: abrirRelatorio
    };

    document.querySelectorAll(".atalho[data-acao]").forEach(botao => {
        botao.addEventListener("click", () => acoes[botao.dataset.acao]());
    });

    // ===== Primeira renderização =====
    renderizarResumo();
    renderizarProjetos();
    renderizarAtualizacoes();
    desenhar(30);
});