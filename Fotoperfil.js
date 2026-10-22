// Limpa a foto de perfil ao sair da conta.
// Inclua este script em TODAS as páginas (e em logout.html):
//   <script src="fotoPerfil.js"></script>
(function () {
    const CHAVE_FOTO = "eloFotoPerfil";

    function limparFoto() {
        try { localStorage.removeItem(CHAVE_FOTO); } catch (e) { /* ignora */ }
    }

    // Quem chegar na página de logout já sai sem foto
    if (/logout\.html$/i.test(window.location.pathname)) limparFoto();

    // Qualquer link "Sair" (inclusive os criados pelo auth.js) limpa a foto
    document.addEventListener("click", function (e) {
        const link = e.target.closest('a[href$="logout.html"]');
        if (link) limparFoto();
    });
})();