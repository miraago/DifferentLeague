const nav = document.getElementById("navbar"); //riferimento alla navbar

const bottoneRiduci = document.getElementById("btn-riduci"); //riferimento al bottone riduci
const bottoneApriChiudi = document.getElementById("btn-freccia-apri-chiudi"); // riferimento al bottone apri chiudi

export function inizializzaNavbar() {
  nav.addEventListener("click", gestisciClickNavbar);
}

function gestisciClickNavbar(event) {
  if (!event.target.closest("#navbar")) {
    //controllo se il click è avvenuto sulla navbar
    return;
  }
  const bottoneCliccato = event.target.closest(".btn");

  if (bottoneCliccato == bottoneRiduci) {
    //click avvenuto sul bottone riduci
    //significa che la barra o è chiusa o e aperta
    //per sicurezza c'è o non c'è togliamo la classe .chiuso e aggiungiamo ridotto
    nav.classList.remove("chiuso");
    //aggiungiamo la classe ridotto alla nav
    nav.classList.add("ridotto");
    //nascondiamo il bottone riduci
    bottoneCliccato.style.display = "none";
    //VISTO CHE è STATO RIDOTTO AGGIUNGIAMO L'ICONA del menu
    bottoneApriChiudi.innerText = "≡";
  }

  if (bottoneCliccato == bottoneApriChiudi) {
    //click avvenuto sul bottone apri o chiudi
    //significa che la barra o è chiusa o e aperta o e ridotta

    //scopriamo se sta apert, chiusa o ridotta e facciamo lo switch
    if (nav.classList.contains("chiuso")) {
      //se è chiusa
      bottoneCliccato.innerText = "<"; //mettiamo carattere di chiusura
      nav.classList.remove("chiuso"); //rimuoviamo class chiuso
      bottoneRiduci.style.display = "block";
    } else if (nav.classList.contains("ridotto")) {
      nav.classList.remove("ridotto");
      nav.classList.remove("chiuso");
      bottoneRiduci.style.display = "block";
      bottoneApriChiudi.innerText = "<";
    } else {
      nav.classList.add("chiuso");
      bottoneCliccato.innerText = ">";
      bottoneRiduci.style.display = "none";
    }
    //per sicurezza, c'è o non c'è eliminiamo la classe ridotto e la rendiamo visibile il bottone cliccato
    bottoneCliccato.style.display = "block";
    nav.classList.remove("ridotto");
  }
}
