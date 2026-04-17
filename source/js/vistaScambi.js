import { UTENTELOGGATO } from "./gestioneUtente.js";
import { paginaDaRendereVisibile } from "./script.js";
import { creaCardGiocatore } from "./cardGiocatore.js";

const vistaScambi = document.getElementById("vista-scambi");
vistaScambi.addEventListener("change", gestisciselezionaSquadra);

let cbPlayer = [];
let cbPresidenti = [];

export function inizializzaScambi(players, presidenti) {
  cbPlayer = players;
  cbPresidenti = presidenti;
}

export function scambiaGiocatore() {
  const TAG_H2 = document.querySelector("h2");

  if (TAG_H2.dataset.action != "apri-scambi-classici") {
    TAG_H2.innerText = "MERCATO - Proposte di scambio";
    TAG_H2.dataset.action = "apri-scambi";
    paginaDaRendereVisibile("scambi");
  }

  creaContainer();

  //stampiamo i giocatori della propria squadra
  const containerSquadraUtente = document.getElementById(
    "container-squadra-utente",
  );
  stampaSquadra(UTENTELOGGATO.presidenteUtenteLoggato, containerSquadraUtente);
}

function stampaSquadra(squadraDaStampare, container) {
  squadraDaStampare.getTuttiGliSlot.forEach((element, index) => {
    if (element) {
      // se element esiste e non è null crea card giocatore

      container.append(creaCardGiocatore(element, index));
    } else {
      //situazione di slot vuoto
    }
  });
}

function creaContainer() {
  //contenitore squadra utente
  const containerSquadraUtente = document.createElement("section");
  containerSquadraUtente.id = "container-squadra-utente";

  //container squadra 2
  const containerSquadra2 = document.createElement("section");
  containerSquadra2.id = "container-squadra-2";

  //container seleziona squadra
  const containerSelezionaSquadra = document.createElement("section");
  containerSelezionaSquadra.id = "container-seleziona-squadra";
  containerSelezionaSquadra.innerHTML =
    "<div>Seleziona la squadra con cui proporre uno scambio</div>";

  //creiamo il select per la scelta della squadra
  let rigaOption = "<option selected value='0'> Seleziona Squadra </option>";
  cbPresidenti.forEach((presidentecorrente) => {
    rigaOption += `<option value='${presidentecorrente.getNomeRosa}'>${presidentecorrente.getNomeRosa}</option>`;
  });

  //crea select scelta squadra
  const selectSceltaSquadra = document.createElement("select");
  selectSceltaSquadra.id = "select-scelta-squadra";

  selectSceltaSquadra.innerHTML = rigaOption;
  containerSelezionaSquadra.append(selectSceltaSquadra);

  //inserisco i due container
  vistaScambi.append(
    containerSelezionaSquadra,
    containerSquadraUtente,
    containerSquadra2,
  );
}

function gestisciselezionaSquadra(e) {
  if (!e.target.closest("select")) return;

  const squadraSelezionata = document.getElementById(
    "select-scelta-squadra",
  ).value;
  const presidenteSquadra2 = cbPresidenti.find((presidentecorrente) => {
    return presidentecorrente.getNomeRosa == squadraSelezionata;
  });

  const containerSquadra2 = document.getElementById("container-squadra-2");
  containerSquadra2.innerHTML = "";
  stampaSquadra(presidenteSquadra2, containerSquadra2);
}
