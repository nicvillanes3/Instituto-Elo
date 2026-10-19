
const formEsqueciSenha = document.getElementById("formEsqueciSenha");
const mensagemSenha = document.getElementById("mensagemSenha");

formEsqueciSenha.addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();

    mensagemSenha.className = "mensagem-senha";
    mensagemSenha.textContent = "";

    if (!email) {
        mensagemSenha.textContent = "Informe o e-mail cadastrado.";
        mensagemSenha.classList.add("erro");
        return;
    }

    mensagemSenha.textContent = "A solicitação foi validada visualmente. Para receber instruções de redefinição, é necessário conectar esta página ao sistema de autenticação do Elo.";
    mensagemSenha.classList.add("sucesso");
});
