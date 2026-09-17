function pesquisar(){

      let input = document.getElementById('barraPesquisa').value.toLowerCase();
      let itens = document.querySelectorAll('.item-ajuda');
      itens.forEach(function(item){

        let texto = item.innerText.toLowerCase();
        if(texto.includes(input)){
          item.style.display = 'block';
        }

        else{
          item.style.display = 'none';
        }
      });
    }