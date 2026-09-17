document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // DATA DA ÚLTIMA ATUALIZAÇÃO
  // =========================

  const dataAtualizacao = document.getElementById("dataAtualizacao");

  if (dataAtualizacao) {
    const data = new Date();

    const dataFormatada = data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });

    dataAtualizacao.textContent = `Última atualização: ${dataFormatada}`;
  }


  // =========================
  // BOTÃO VOLTAR AO TOPO
  // =========================

  const botaoTopo = document.getElementById("voltarTopo");

  if (botaoTopo) {

    window.addEventListener("scroll", () => {

      if (window.scrollY > 400) {
        botaoTopo.classList.add("mostrar");
      } else {
        botaoTopo.classList.remove("mostrar");
      }

    });

    botaoTopo.addEventListener("click", () => {

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    });
  }


  // =========================
  // BUSCA NA POLÍTICA
  // =========================

  const campoBusca = document.getElementById("buscarPolitica");
  const conteudo = document.querySelector(".container");

  if (campoBusca && conteudo) {

    campoBusca.addEventListener("input", () => {

      const termo = campoBusca.value.toLowerCase().trim();

      const paragrafos = conteudo.querySelectorAll("p, li, h2");

      paragrafos.forEach(elemento => {

        elemento.classList.remove("encontrado");

        if (
          termo !== "" &&
          elemento.textContent.toLowerCase().includes(termo)
        ) {
          elemento.classList.add("encontrado");
        }

      });

    });
  }

});