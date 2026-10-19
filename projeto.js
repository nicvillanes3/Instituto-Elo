document.addEventListener("DOMContentLoaded", function () {

    // ===== 1. Descobre qual projeto abrir (?id=3) =====
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));
    const projeto = projetos.find(p => p.id === id);

    const conteudo = document.getElementById("conteudo");
    const naoEncontrado = document.getElementById("naoEncontrado");

    if (!projeto) {
        conteudo.hidden = true;
        document.querySelector(".breadcrumb").hidden = true;
        naoEncontrado.hidden = false;
        document.title = "Projeto não encontrado | Instituto Elo";
        return;
    }

    const moeda = n => "R$ " + n.toLocaleString("pt-BR");
    const $ = sel => document.getElementById(sel);

    // ===== 2. Preenche os dados do projeto =====
    document.title = projeto.titulo + " | Instituto Elo";

    $("bcCategoria").textContent = projeto.categoria;
    $("bcCategoria").href = "explorar.html?categoria=" + encodeURIComponent(projeto.categoria);
    $("bcTitulo").textContent = projeto.titulo;

  const capa = $("capa");

capa.style.backgroundImage = `url("${projeto.img}")`;
capa.style.backgroundSize = "cover";
capa.style.backgroundPosition = "center";
capa.style.backgroundRepeat = "no-repeat";
    $("tag").textContent = projeto.categoria;
    $("tag").style.background = projeto.cor;
    $("titulo").textContent = projeto.titulo;
    $("descricao").textContent = projeto.desc;
    $("local").textContent = projeto.local || "Brasil";
    $("nivel").textContent = projeto.nivel || "Todas as idades";

    $("arrecadado").textContent = moeda(projeto.arrecadado);
    $("barra").style.width = projeto.pct + "%";
    $("barra").style.background = projeto.cor;
    $("pct").textContent = projeto.pct + "% da meta";
    $("meta").textContent = "Meta " + moeda(projeto.meta);

    const concluido = projeto.dias === 0;
    $("prazoMeta").textContent = concluido ? "Meta concluída" : projeto.dias + " dias restantes";
    $("apoiadores").textContent = projeto.apoiadores;
    $("dias").textContent = concluido ? "Concluído" : projeto.dias + " dias";

    // ===== 3. Aba "Sobre" =====
    $("textoSobre").innerHTML = (projeto.sobre || [projeto.desc])
        .map(texto => `<p>${texto}</p>`)
        .join("");

    $("destaques").innerHTML = (projeto.destaques || []).map(d => `
        <div class="destaque">
            <strong>${d[1]}</strong>
            <div class="destaque-linha">
                <span class="destaque-icone"><i class="fa-solid ${d[0]}"></i></span>
                <small>${d[2]}</small>
            </div>
        </div>`).join("");

    // ===== 4. Atualizações =====
    const atualizacoes = projeto.atualizacoes || [];
    $("contAtualizacoes").textContent = atualizacoes.length;

    const itemAtualizacao = a => `
        <article class="atualizacao">
            <div class="atualizacao-img" style="background-image:url('${projeto.img}')"></div>
            <div>
                <strong>${a[0]}</strong>
                <p>${a[1]}</p>
                <small>${a[2]}</small>
            </div>
        </article>`;

    $("listaAtualizacoes").innerHTML = atualizacoes.length
        ? atualizacoes.map(itemAtualizacao).join("")
        : '<p class="vazio">Este projeto ainda não publicou atualizações.</p>';

    $("atualizacaoRecente").innerHTML = atualizacoes.length
        ? itemAtualizacao(atualizacoes[0])
        : '<p class="vazio">Nenhuma atualização por enquanto.</p>';

    // ===== 5. Apoiadores (lista de exemplo gerada a partir do projeto) =====
    $("contApoiadores").textContent = projeto.apoiadores;

    const nomes = ["Ana Paula", "Bruno Lima", "Camila Rocha", "Daniel Souza", "Eduarda Alves",
        "Felipe Costa", "Gabriela Nunes", "Henrique Dias", "Isabela Martins", "João Pedro",
        "Karina Melo", "Lucas Ferreira"];
    const valoresExemplo = [25, 50, 100, 30, 75, 20, 150, 40, 60, 35, 80, 45];

    const exibidos = Math.min(projeto.apoiadores, 8);
    let htmlApoiadores = "";

    for (let i = 0; i < exibidos; i++) {
        const indice = (projeto.id + i) % nomes.length;
        const nome = nomes[indice];
        htmlApoiadores += `
            <div class="apoiador">
                <span class="avatar">${nome.charAt(0)}</span>
                <strong>${nome}</strong>
                <span class="apoiador-valor">${moeda(valoresExemplo[indice])}</span>
            </div>`;
    }

    if (projeto.apoiadores > exibidos) {
        htmlApoiadores += `<p class="vazio">e mais ${projeto.apoiadores - exibidos} apoiadores</p>`;
    }
    $("listaApoiadores").innerHTML = htmlApoiadores;

    // ===== 6. Abas =====
    function abrirAba(nome) {
        document.querySelectorAll(".aba").forEach(a => a.classList.toggle("ativo", a.dataset.aba === nome));
        document.querySelectorAll(".aba-conteudo").forEach(c => c.classList.toggle("ativo", c.id === "aba-" + nome));
    }

    document.querySelectorAll(".aba").forEach(aba => {
        aba.addEventListener("click", () => abrirAba(aba.dataset.aba));
    });

    $("verTodas").addEventListener("click", e => {
        e.preventDefault();
        abrirAba("atualizacoes");
        document.querySelector(".abas").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    // ===== 7. Favoritar =====
    let favorito = false;
    $("btnFavorito").addEventListener("click", function () {
        favorito = !favorito;
        this.classList.toggle("ativo", favorito);
        this.querySelector("i").className = (favorito ? "fa-solid" : "fa-regular") + " fa-heart";
    });

    // ===== 8. Compartilhar =====
    $("btnCompartilhar").addEventListener("click", async function () {
        const dados = { title: projeto.titulo, text: "Conheça o projeto " + projeto.titulo, url: window.location.href };

        try {
            if (navigator.share) {
                await navigator.share(dados);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                const rotulo = this.querySelector("strong");
                rotulo.textContent = "Link copiado!";
                setTimeout(() => rotulo.textContent = "Compartilhar", 2000);
            }
        } catch (erro) {
            /* o usuário cancelou o compartilhamento */
        }
    });

    // ===== 9. Doação =====
    const botoesValor = document.querySelectorAll(".valor");
    const campoCustom = $("valorCustom");
    const botoesMetodo = document.querySelectorAll(".metodo");
    const btnDoar = $("btnDoar");
    const retorno = $("retorno");

    let valorSelecionado = 50;
    let metodo = "pix";

    const textosBotao = {
        pix: "Doar agora com PIX",
        cartao: "Doar agora com cartão",
        boleto: "Gerar boleto"
    };

    const nomesMetodo = {
        pix: "PIX",
        cartao: "cartão de crédito",
        boleto: "boleto bancário"
    };

    function lerValorCustom() {
        const numero = parseFloat(campoCustom.value.replace(/\./g, "").replace(",", "."));
        return isNaN(numero) ? 0 : numero;
    }

    botoesValor.forEach(botao => {
        botao.addEventListener("click", () => {
            botoesValor.forEach(b => b.classList.remove("ativo"));
            botao.classList.add("ativo");
            retorno.hidden = true;

            if (botao.dataset.valor === "outro") {
                valorSelecionado = lerValorCustom();
                campoCustom.focus();
            } else {
                valorSelecionado = Number(botao.dataset.valor);
                campoCustom.value = "";
            }
        });
    });

    campoCustom.addEventListener("input", () => {
        campoCustom.value = campoCustom.value.replace(/[^\d,]/g, "");
        botoesValor.forEach(b => b.classList.toggle("ativo", b.dataset.valor === "outro"));
        valorSelecionado = lerValorCustom();
        retorno.hidden = true;
    });

    botoesMetodo.forEach(botao => {
        botao.addEventListener("click", () => {
            botoesMetodo.forEach(b => b.classList.remove("ativo"));
            botao.classList.add("ativo");
            metodo = botao.dataset.metodo;
            btnDoar.textContent = textosBotao[metodo];
            retorno.hidden = true;
        });
    });

    btnDoar.addEventListener("click", () => {
        retorno.hidden = false;

        if (valorSelecionado < 5) {
            retorno.className = "retorno erro";
            retorno.textContent = "Informe um valor de pelo menos R$ 5,00 para doar.";
            return;
        }

        const paginas = {
            pix: "pagamentoPix.html",
            cartao: "pagamentoCartao.html",
            boleto: "pagamentoBoleto.html"
        };

        // Leva o projeto e o valor escolhidos para a página de pagamento
        window.location.href = `${paginas[metodo]}?id=${projeto.id}&valor=${valorSelecionado}`;
    });
});