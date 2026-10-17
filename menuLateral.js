document.addEventListener("DOMContentLoaded", function() {
    const path = window.location.pathname;
    let page = path.substring(path.lastIndexOf("/") + 1).toLowerCase();
    if (page && !page.endsWith(".html")) page += ".html";
    const links = document.querySelectorAll(".barra-lateral a");
    const cardText = document.getElementById("card-text");
    const cardIcon = document.getElementById("card-icon");

    const mensagens = {
        "perfil.html": {
            texto: "Conecte-se com ideias que transformam o futuro.",
            icone: "fa-regular fa-user"
        },
        "criador.html": {
            texto: "Dicas para sua campanha decolar",
            icone: "fa-solid fa-chart-column"
        },
        "projetos.html": {
            texto: "Dicas para sua campanha decolar",
            icone: "fa-regular fa-comment-dots"
        },
        "favoritos.html": {
            texto: "Salve projetos que você gosta e acompanhe quando quiser!",
            icone: "fa-regular fa-heart"
        },
        "doacoes.html": {
            texto: "Apoiar é transformar ideias em realidade.",
            icone: "fa-solid fa-dollar-sign"
        },
        "notificacoes.html": {
            texto: "Fique por dentro das novidades e atualizações!",
            icone: "fa-regular fa-bell"
        },
        "configuracoes.html": {
            texto: "Sua segurança é nossa prioridade.",
            icone: "fa-solid fa-gear"
        },
        "sair.html": {
            texto: "Obrigado por fazer parte da comunidade Elo!",
            icone: "fa-solid fa-right-from-bracket"
        }
    };

    links.forEach(function(link) {
        if (link.getAttribute("href").toLowerCase() === page) {
            link.classList.add("active");
        }
    });

    const mensagem = mensagens[page];

    if (mensagem && cardText && cardIcon) {
        cardText.textContent = mensagem.texto;
        cardIcon.className = mensagem.icone;
        cardIcon.id = "card-icon";
    }
});