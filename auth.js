/* =====================================================================
   auth.js — login, proteção de páginas e navbar automática

   COMO USAR: em TODAS as páginas, dentro do <head>, coloque UMA linha:

       <script src="auth.js"></script>

   O que ele faz sozinho:
   1. Páginas privadas (lista abaixo) só abrem para quem fez login;
      quem não fez é enviado para login.html e volta para a página
      que queria assim que entrar.
   2. A navbar certa (visitante ou logado) é colocada no lugar de
      <nav class="navbar"> ou de <div id="navbar"></div>.
      Páginas sem nenhum dos dois (ex.: telas de pagamento) não recebem navbar.

   No login/cadastro, depois de validar os dados:

       Auth.entrar({ nome: "Mariane Araujo", email: "mariane@email.com" });
       Auth.irParaDestino();   // volta para a página que a pessoa queria

   O nome da primeira página (inicio.html) e da página Explorar ficam
   nas constantes PAGINA_INICIAL e PAGINA_EXPLORAR, logo abaixo.

   Para sair:  Auth.sair();  (a página sair.html já faz isso)

   ATENÇÃO: isto protege só o que o usuário VÊ no navegador. Quem sabe
   mexer no navegador consegue burlar. Para proteger dados de verdade,
   a verificação precisa acontecer também no servidor.
   ===================================================================== */
(function () {

    // ===== Configuração =====
    const CHAVE_SESSAO = "eloSessao";
    const PAGINA_LOGIN = "login.html";
    const PAGINA_INICIAL = "inicio.html";      // primeira página do site (logo, depois do login e do logout)
    const PAGINA_EXPLORAR = "explorar.html";   // página do link "Explorar" da navbar

    // Páginas que exigem login (nomes em minúsculas)
    const PAGINAS_PRIVADAS = [
        "perfil.html",
        "criador.html",
        "projetos.html",        // "Projetos criados" (menu lateral)
        "doacoes.html",
        "favoritos.html",
        "notificacoes.html",
        "configuracoes.html",
        "criarcampanha.html",
        "pagamentopix.html",
        "pagamentoboleto.html",
        "pagamentocartao.html",
        "doacaofi.html"
    ];

    // Páginas que não fazem sentido para quem já está logado
    const PAGINAS_SO_VISITANTES = ["login.html", "cadastro.html"];

    // ===== Sessão =====
    function lerSessao() {
        try { return JSON.parse(localStorage.getItem(CHAVE_SESSAO)); } catch (e) { return null; }
    }

    const Auth = {
        estaLogado() {
            const s = lerSessao();
            return Boolean(s && (s.email || s.nome));
        },

        usuario() {
            return lerSessao();
        },

        entrar(usuario) {
            try {
                localStorage.setItem(CHAVE_SESSAO, JSON.stringify(Object.assign({}, usuario, { entrouEm: Date.now() })));
            } catch (e) { /* armazenamento indisponível */ }
        },

        sair() {
            try { localStorage.removeItem(CHAVE_SESSAO); } catch (e) { /* ignora */ }
        },

        // Página para onde voltar depois do login (?voltar=perfil.html). Só aceita arquivos do próprio site.
        destino() {
            const voltar = new URLSearchParams(window.location.search).get("voltar");
            return voltar && /^[\w\-]+\.html(\?[\w=&.%\-]*)?$/i.test(voltar) ? voltar : PAGINA_INICIAL;
        },

        irParaDestino() {
            window.location.href = this.destino();
        }
    };

    Auth.paginaInicial = PAGINA_INICIAL;
    Auth.paginaExplorar = PAGINA_EXPLORAR;

    window.Auth = Auth;

    // ===== Página atual =====
    let arquivo = window.location.pathname.split("/").pop() || PAGINA_INICIAL;
    if (!/\.html$/i.test(arquivo)) arquivo += ".html";
    const arquivoMinusculo = arquivo.toLowerCase();

    // ===== Proteção de páginas =====
    function verificarAcesso() {
        if (PAGINAS_PRIVADAS.includes(arquivoMinusculo) && !Auth.estaLogado()) {
            document.documentElement.style.display = "none";   // evita mostrar a página por um instante
            window.location.replace(PAGINA_LOGIN + "?voltar=" + encodeURIComponent(arquivo + window.location.search));
            return;
        }

        if (PAGINAS_SO_VISITANTES.includes(arquivoMinusculo) && Auth.estaLogado()) {
            window.location.replace(PAGINA_INICIAL);
        }
    }

    verificarAcesso();

    // ===== Navbar automática =====
    function htmlNavbar(logado) {
        const entrar = logado ? "" : '<li><a href="login.html">Entrar</a></li>';
        const perfil = logado
            ? `<li>
                   <div class="meuPerfil">
                       <a href="perfil.html">Perfil</a>
                       <span class="material-symbols-outlined">account_circle</span>
                   </div>
               </li>`
            : "";

        return `
        <div class="nav-logo">
            <a href="${PAGINA_INICIAL}">
                <img src="logoElo.jpeg" alt="Instituto Elo Logo">
            </a>
        </div>
        <ul class="nav-links">
            <li><a href="${PAGINA_EXPLORAR}">Explorar</a></li>
            <li><a href="projetos.html">Projetos</a></li>
            <li><a href="comoFunciona.html">Como funciona</a></li>
            <li><a href="sobre.html">Sobre nós</a></li>

            <li>
                <div class="search-box">
                    <input type="text" placeholder="Buscar projetos">
                    <button type="button">
                        <span class="material-symbols-outlined">search</span>
                    </button>
                </div>
            </li>

            ${entrar}

            <li>
                <input type="button" value="Criar Campanha" id="botaoCampanha" onclick="window.location.href='criarCampanha.html'">
            </li>

            ${perfil}
        </ul>`;
    }

    function garantirRecursos() {
        // Ícones (Material Symbols) usados pela navbar: "search" e "account_circle".
        // Se a página já carrega a fonte só com uma lista de ícones (icon_names=...) que não
        // inclui account_circle, carrega a fonte completa também.
        const fontes = Array.from(document.querySelectorAll('link[href*="Material+Symbols"]'));
        const atende = fontes.some(l => !l.href.includes("icon_names") || l.href.includes("account_circle"));

        if (!atende) {
            const fonte = document.createElement("link");
            fonte.rel = "stylesheet";
            fonte.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined";
            document.head.appendChild(fonte);
        }

        // Estilo da navbar
        if (!document.querySelector('link[href*="index.css"]')) {
            const css = document.createElement("link");
            css.rel = "stylesheet";
            css.href = "index.css";
            document.head.appendChild(css);
        }
    }

    function renderizarNavbar() {
        const marcador = document.getElementById("navbar") || document.querySelector("nav.navbar");
        if (!marcador) return;   // página sem navbar (ex.: pagamento): não adiciona

        garantirRecursos();

        const nav = document.createElement("nav");
        nav.className = "navbar";
        nav.id = "navbar";
        nav.innerHTML = htmlNavbar(Auth.estaLogado());
        marcador.replaceWith(nav);
    }

    function iniciar() {
        renderizarNavbar();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }

    // Login ou logout em outra aba: atualiza esta aba também
    window.addEventListener("storage", function (e) {
        if (e.key !== CHAVE_SESSAO) return;
        verificarAcesso();
        renderizarNavbar();
    });
})();