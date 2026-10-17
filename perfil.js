document.addEventListener("DOMContentLoaded", function () {

    // ===== Dados do usuário (troque pelos dados reais do usuário logado) =====
    const PERFIL_PADRAO = {
        nome: "Mariane Araujo",
        email: "mariane.araujo@gmail.com",
        telefone: "(11) 98765-4321",
        bio: "Estudante de design apaixonada por projetos que transformam realidades através da educação e tecnologia."
    };
    const PESSOAS_IMPACTADAS = 45;

    // Doações feitas pelo usuário (exemplo): 8 projetos, total R$ 650
    const DOACOES = [
        { id: 1,  valor: 50,  data: "2026-08-15" },
        { id: 2,  valor: 50,  data: "2026-08-10" },
        { id: 6,  valor: 40,  data: "2026-07-28" },
        { id: 4,  valor: 100, data: "2026-07-12" },
        { id: 5,  valor: 150, data: "2026-06-30" },
        { id: 3,  valor: 60,  data: "2026-06-15" },
        { id: 9,  valor: 120, data: "2026-05-20" },
        { id: 10, valor: 80,  data: "2026-05-02" }
    ];

    const $ = id => document.getElementById(id);
    const esc = t => String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const moeda = n => "R$" + n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
    const dataBR = iso => iso.split("-").reverse().join("/");

    function aviso(texto) {
        const el = $("aviso");
        el.textContent = texto;
        el.classList.add("visivel");
        setTimeout(() => el.classList.remove("visivel"), 2500);
    }

    // ===== Armazenamento no navegador =====
    const CHAVE_PERFIL = "eloPerfil";
    const CHAVE_PAINEL = "eloPainelCriador";   // edições feitas no painel do criador
    const CHAVE_FOTO = "eloFotoPerfil";

    const ler = (chave, padrao) => {
        try { return JSON.parse(localStorage.getItem(chave)) || padrao; } catch (e) { return padrao; }
    };
    const gravar = (chave, valor) => {
        try { localStorage.setItem(chave, JSON.stringify(valor)); return true; } catch (e) { return false; }
    };

    let perfil = Object.assign({}, PERFIL_PADRAO, ler(CHAVE_PERFIL, {}));

    // Projetos criados (com as edições feitas no painel do criador)
    const painel = ler(CHAVE_PAINEL, { edicoes: {} });
    const criados = MEUS_PROJETOS.map(id => projetos.find(p => p.id === id)).filter(Boolean);
    criados.forEach(p => {
        const ed = (painel.edicoes || {})[p.id];
        if (ed) {
            Object.assign(p, ed);
            p.pct = Math.min(100, Math.round((p.arrecadado / p.meta) * 100));
        }
    });

    // Doações já ligadas ao projeto, da mais recente para a mais antiga
    const apoios = DOACOES
        .map(d => ({ ...d, projeto: projetos.find(p => p.id === d.id) }))
        .filter(d => d.projeto)
        .sort((a, b) => b.data.localeCompare(a.data));

    // ===== Cabeçalho do perfil =====
    function renderizarPerfil() {
        $("nomePerfil").textContent = perfil.nome;
        $("emailPerfil").textContent = perfil.email;
        $("bioPerfil").textContent = perfil.bio;
        document.title = "Meu perfil | " + perfil.nome;
    }

    function renderizarNumeros() {
        const total = apoios.reduce((soma, d) => soma + d.valor, 0);
        $("statCriados").textContent = criados.length;
        $("statApoiados").textContent = new Set(apoios.map(d => d.id)).size;
        $("statTotal").textContent = moeda(total);
        $("statPessoas").textContent = PESSOAS_IMPACTADAS;
    }

    // ===== Listas =====
    const linhaCriado = p => `
        <a href="projeto.html?id=${p.id}" class="item">
            <div class="item-foto" style="background-image:url('${p.img}')"></div>
            <div class="item-meio">
                <strong>${esc(p.titulo)}</strong>
                <small>${esc(p.org)}</small>
                <div class="mini-barra"><div style="width:${p.pct}%"></div></div>
                <div class="item-valores">
                    <span>${moeda(p.arrecadado)} arrecadados</span>
                    <span>${p.pct}% da meta</span>
                </div>
            </div>
            <i class="fa-solid fa-chevron-right seta"></i>
        </a>`;

    const linhaApoio = d => {
        const andamento = d.projeto.dias > 0 && d.projeto.pct < 100;
        return `
        <a href="projeto.html?id=${d.projeto.id}" class="item">
            <div class="item-foto" style="background-image:url('${d.projeto.img}')"></div>
            <div class="item-meio">
                <strong>${esc(d.projeto.titulo)}</strong>
                <small>Por ${esc(d.projeto.autor)}</small>
                <div class="item-valores">
                    <span>${moeda(d.valor)} doados</span>
                    <span>${dataBR(d.data)}</span>
                </div>
            </div>
            <span class="tag-status ${andamento ? "" : "concluido"}">${andamento ? "Em andamento" : "Concluído"}</span>
            <i class="fa-solid fa-chevron-right seta"></i>
        </a>`;
    };

    function renderizarListas() {
        $("resumoCriados").innerHTML = criados.slice(0, 3).map(linhaCriado).join("") ||
            '<p class="vazio">Você ainda não criou nenhum projeto.</p>';
        $("listaCriados").innerHTML = criados.map(linhaCriado).join("") ||
            '<p class="vazio">Você ainda não criou nenhum projeto.</p>';

        $("resumoApoiados").innerHTML = apoios.slice(0, 3).map(linhaApoio).join("") ||
            '<p class="vazio">Você ainda não apoiou nenhum projeto.</p>';
        $("listaApoiados").innerHTML = apoios.map(linhaApoio).join("") ||
            '<p class="vazio">Você ainda não apoiou nenhum projeto.</p>';
    }

    // ===== Abas =====
    function abrirAba(nome) {
        document.querySelectorAll(".aba").forEach(a => a.classList.toggle("ativo", a.dataset.aba === nome));
        document.querySelectorAll(".aba-painel").forEach(p => p.classList.toggle("ativo", p.id === "aba-" + nome));
        if (nome === "informacoes") preencherFormulario();
    }

    document.querySelectorAll(".aba").forEach(aba => {
        aba.addEventListener("click", () => abrirAba(aba.dataset.aba));
    });

    document.querySelectorAll("[data-ir]").forEach(botao => {
        botao.addEventListener("click", () => abrirAba(botao.dataset.ir));
    });

    // ===== Editar perfil / Informações pessoais =====
    function preencherFormulario() {
        $("campoNome").value = perfil.nome;
        $("campoTelefone").value = perfil.telefone;
        $("campoEmail").value = perfil.email;
        $("campoBio").value = perfil.bio;
        $("erroPerfil").hidden = true;
    }

    $("btnEditar").addEventListener("click", () => {
        abrirAba("informacoes");
        document.querySelector(".abas").scrollIntoView({ behavior: "smooth", block: "start" });
        $("campoNome").focus();
    });

    $("cancelarPerfil").addEventListener("click", () => abrirAba("geral"));

    $("formPerfil").addEventListener("submit", e => {
        e.preventDefault();

        const nome = $("campoNome").value.trim();
        const email = $("campoEmail").value.trim();
        const telefone = $("campoTelefone").value.trim();
        const bio = $("campoBio").value.trim();
        const erro = $("erroPerfil");

        let mensagem = "";
        if (!nome) mensagem = "Informe seu nome completo.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) mensagem = "Informe um e-mail válido.";

        if (mensagem) {
            erro.textContent = mensagem;
            erro.hidden = false;
            return;
        }

        perfil = { nome, email, telefone, bio };
        gravar(CHAVE_PERFIL, perfil);
        renderizarPerfil();
        abrirAba("geral");
        aviso("Perfil atualizado!");
    });

    // ===== Foto de perfil =====
    const foto = $("fotoPerfil");
    const fotoSalva = ler(CHAVE_FOTO, null);
    if (fotoSalva) foto.src = fotoSalva;

    $("btnFoto").addEventListener("click", () => $("arquivoFoto").click());

    $("arquivoFoto").addEventListener("change", e => {
        const arquivo = e.target.files[0];
        if (!arquivo) return;

        if (arquivo.size > 2 * 1024 * 1024) {
            aviso("Escolha uma imagem de até 2 MB.");
            return;
        }

        const leitor = new FileReader();
        leitor.onload = () => {
            foto.src = leitor.result;
            gravar(CHAVE_FOTO, leitor.result);
            aviso("Foto atualizada!");
        };
        leitor.readAsDataURL(arquivo);
    });

    // ===== Convidar amigos =====
    const modal = $("modal");
    let ultimoFoco = null;

    function abrirModal(titulo, corpoHtml) {
        ultimoFoco = document.activeElement;
        $("modalTitulo").textContent = titulo;
        $("modalCorpo").innerHTML = corpoHtml;
        modal.hidden = false;
        const primeiro = modal.querySelector("input, button.btn-azul, .rede");
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

    $("btnConvidar").addEventListener("click", () => {
        const url = new URL("index.html", window.location.href).href;
        const texto = "Venha apoiar ideias que transformam o futuro no Instituto Elo!";

        abrirModal("Convidar amigos", `
            <p class="modal-texto">Compartilhe a Elo e ajude mais projetos a saírem do papel.</p>
            <div class="link-compartilhar">
                <input type="text" id="linkConvite" value="${esc(url)}" readonly>
                <button type="button" class="btn-azul" id="copiarConvite">Copiar</button>
            </div>
            <div class="redes">
                <a class="rede" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(texto + " " + url)}">
                    <i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
                <a class="rede" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}">
                    <i class="fa-brands fa-facebook-f"></i> Facebook</a>
                <a class="rede" href="mailto:?subject=${encodeURIComponent("Conheça o Instituto Elo")}&body=${encodeURIComponent(texto + "\n" + url)}">
                    <i class="fa-regular fa-envelope"></i> E-mail</a>
                ${navigator.share ? '<button type="button" class="rede" id="maisOpcoes"><i class="fa-solid fa-share-nodes"></i> Mais opções</button>' : ""}
            </div>`);

        $("copiarConvite").addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(url);
            } catch (erro) {
                $("linkConvite").select();
                document.execCommand("copy");
            }
            $("copiarConvite").textContent = "Copiado!";
            setTimeout(() => { if ($("copiarConvite")) $("copiarConvite").textContent = "Copiar"; }, 2000);
        });

        const mais = $("maisOpcoes");
        if (mais) {
            mais.addEventListener("click", async () => {
                try { await navigator.share({ title: "Instituto Elo", text: texto, url }); } catch (erro) { /* cancelado */ }
            });
        }
    });

    // ===== Início =====
    renderizarPerfil();
    renderizarNumeros();
    renderizarListas();

    // Permite abrir direto uma aba: perfil.html#apoiados
    const abaInicial = window.location.hash.replace("#", "");
    if (["geral", "criados", "apoiados", "informacoes"].includes(abaInicial)) abrirAba(abaInicial);
});