// Dados de pagamento vindos da URL: pagamentoPix.html?id=1&valor=50
// Requer dadosProjetos.js carregado antes deste arquivo.

const parametrosPagamento = new URLSearchParams(window.location.search);
const projetoPagamento = projetos.find(p => p.id === Number(parametrosPagamento.get("id")));
const valorPagamento = parseFloat(parametrosPagamento.get("valor"));
const NOME_APOIADOR = "Mariane Araujo"; // troque pelo nome do usuário logado

const pagamentoValido = Boolean(projetoPagamento) && valorPagamento >= 5;

// Sem projeto ou valor válido, volta para o Explorar
if (!pagamentoValido) {
    window.location.replace("explorar.html");
}

const doisDigitos = n => String(n).padStart(2, "0");

function formatarMoeda(valor) {
    return "R$" + valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatarData(data) {
    return `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}/${data.getFullYear()}`;
}

function formatarHora(data) {
    return `${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`;
}

function preencherResumo() {
    const agora = new Date();
    const vencimento = new Date(agora);
    vencimento.setDate(vencimento.getDate() + 5);

    const campos = {
        projeto: projetoPagamento.titulo,
        org: projetoPagamento.org,
        data: `${formatarData(agora)} às ${formatarHora(agora)}`,
        valor: formatarMoeda(valorPagamento),
        vencimento: formatarData(vencimento),
        apoiador: NOME_APOIADOR
    };

    document.querySelectorAll("[data-campo]").forEach(el => {
        el.textContent = campos[el.dataset.campo];
    });

    document.querySelectorAll("[data-imagem]").forEach(img => {
        img.src = projetoPagamento.img;
        img.alt = projetoPagamento.titulo;
    });

    // Botões "Voltar" retornam à página do projeto
    document.querySelectorAll("[data-voltar]").forEach(link => {
        link.href = "projeto.html?id=" + projetoPagamento.id;
    });

    document.title = document.title + " | " + projetoPagamento.titulo;
}

if (pagamentoValido) {
    preencherResumo();
}