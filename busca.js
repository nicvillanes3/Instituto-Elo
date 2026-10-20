
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formBusca");
    const campo = document.getElementById("campoBusca");

    if (!form || !campo) return;

    const parametros = new URLSearchParams(window.location.search);
    campo.value = parametros.get("busca") || "";

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const busca = campo.value.trim();

        window.location.href = "explorar.html?busca=" + encodeURIComponent(busca);
    });
});
