import { UTENTELOGGATO } from "./gestioneUtente.js";
import { paginaDaRendereVisibile } from "./script.js";
import { toCapitalize } from "./funzioniAgo.js";
import { creaCardGiocatore } from "./cardGiocatore.js";
import { popupStatisticheGiocatore } from "./popupStatisticheGiocatori.js";
import { player } from "./script.js";

const vistaLaMiaSquadra = document.getElementById("vista-la-mia-squadra");

/** Mostra la pagina "La mia squadra" con i dati della squadra dell'utente loggato */
export function mostraLaMiaSquadra() {
  paginaDaRendereVisibile("la-mia-squadra");

  // impostiamo il titolo della pagina
  const titoloPagina = document.getElementById("titolo-pagina");
  titoloPagina.textContent = "La Mia Rosa";

  vistaLaMiaSquadra.querySelector("#nome-squadra").textContent =
    `${UTENTELOGGATO.nomeSquadraUtenteLoggato}`;
  vistaLaMiaSquadra.querySelector("#nome-presidente").textContent =
    `${toCapitalize(UTENTELOGGATO.presidenteUtenteLoggato.getNomePresidente)}`;
  vistaLaMiaSquadra.querySelector("#crediti-residui").innerHTML =
    `<img src="./Assets/image/generici/dollar.png"/> ${UTENTELOGGATO.presidenteUtenteLoggato.getCreditiResidui}`;
  vistaLaMiaSquadra.querySelector("#totale-portieri").textContent =
    `Por.${UTENTELOGGATO.presidenteUtenteLoggato.getContaP}`;
  vistaLaMiaSquadra.querySelector("#totale-difensori").textContent =
    `Dif.${UTENTELOGGATO.presidenteUtenteLoggato.getContaD}`;
  vistaLaMiaSquadra.querySelector("#totale-centrocampisti").textContent =
    `Cen.${UTENTELOGGATO.presidenteUtenteLoggato.getContaC}`;
  vistaLaMiaSquadra.querySelector("#totale-attaccanti").textContent =
    `Att.${UTENTELOGGATO.presidenteUtenteLoggato.getContaA}`;
  const containerRosa = vistaLaMiaSquadra.querySelector("#container-rosa");
  containerRosa.addEventListener("click", gestioneClickInCardGiocatore);

  const containerPortieri = document.getElementById("container-portieri");
  const containerDifensori = document.getElementById("container-difensori");
  const containerCentrocampisti = document.getElementById(
    "container-centrocampisti",
  );
  const containerAttaccanti = document.getElementById("container-attaccanti");

  //azzeramento dei container
  containerPortieri.innerHTML = "";
  containerDifensori.innerHTML = "";
  containerCentrocampisti.innerHTML = "";
  containerAttaccanti.innerHTML = "";

  //prelevo i portieri e li stampo
  UTENTELOGGATO.presidenteUtenteLoggato.getTuttiGliSlot.forEach(
    (element, index) => {
      switch (element.getDatiGiocatore.getRuolo) {
        case "P":
          containerPortieri.appendChild(creaCardGiocatore(element, index, 0));
          break;
        case "D":
          containerDifensori.appendChild(creaCardGiocatore(element, index, 0));
          break;
        case "C":
          containerCentrocampisti.appendChild(
            creaCardGiocatore(element, index, 0),
          );
          break;
        case "A":
          containerAttaccanti.appendChild(creaCardGiocatore(element, index, 0));
          break;
        default:
          break;
      }
    },
  );

  function gestioneClickInCardGiocatore(event) {
    const nomeGiocatore = event.target.closest(".testo-nome-giocatore");
    if (nomeGiocatore) {
      // apriamo la statistica del giocatore
      console.log(`Hai cliccato sul giocatore: ${nomeGiocatore.textContent}`);
      //passiamo il giocatore al popup
      popupStatisticheGiocatore(
        player.find(
          (giocatoreCorrente) =>
            giocatoreCorrente.getNome == nomeGiocatore.textContent,
        ),
      );
    }
  }
}
