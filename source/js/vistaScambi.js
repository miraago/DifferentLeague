import { UTENTELOGGATO } from "./gestioneUtente.js";
import { paginaDaRendereVisibile } from "./script.js";
import { creaCardGiocatore } from "./cardGiocatore.js";

const vistaScambi = document.getElementById("vista-scambi");
vistaScambi.addEventListener("change", gestisciSelezionaSquadra);
vistaScambi.addEventListener("click", gestisciClickCard);

let cbPlayer = [];
let cbPresidenti = [];

export function inizializzaScambi(players, presidenti) {
  cbPlayer = players;
  cbPresidenti = presidenti;
}

export function scambiaGiocatore() {
  const TAG_H2 = document.querySelector("h2");
  vistaScambi.innerHTML = "";

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

      container.append(creaCardGiocatore(element, index, 0));
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

function gestisciSelezionaSquadra(e) {
  if (!e.target.closest("select")) return;

  resetSelected(); //resettiamo eventuali card selezionate in azioni precedenti

  const squadraSelezionata = document.getElementById(
    "select-scelta-squadra",
  ).value;
  const presidenteSquadra2 = cbPresidenti.find((presidentecorrente) => {
    return presidentecorrente.getNomeRosa == squadraSelezionata;
  });

  const containerSquadra2 = document.getElementById("container-squadra-2");
  containerSquadra2.innerHTML = "";
  stampaSquadra(presidenteSquadra2, containerSquadra2);
  controllaDoppioni();
}

function resetSelected() {
  //preleviamo tutte le card
  const tutteLeCard = vistaScambi.querySelectorAll(".card-giocatore");
  if (tutteLeCard.length > 0) {
    tutteLeCard.forEach((el) => {
      if (el.classList.contains("selected")) {
        el.classList.remove("selected");
      }
    });
  }
}
//controlla se ci sono doppioni che non possono essere scambiati e li disabilita
function controllaDoppioni() {
  const elementiSquadraUtente = document.querySelectorAll(
    "#container-squadra-utente .card-giocatore",
  );
  const elementiSquadra2 = document.querySelectorAll(
    "#container-squadra-2 .card-giocatore",
  );

  let arrayNomiSquadra1 = [];
  elementiSquadraUtente.forEach((el) =>
    arrayNomiSquadra1.push(el.dataset.card),
  ); //inserisco tutti i nomi di squadra 1 in un array
  //scorro squadra 2 per capire se c'è un doppione che non deve essere selezionato, e lo disabilito
  elementiSquadra2.forEach((cardAttuale) => {
    if (
      arrayNomiSquadra1.some(
        (nomeAttuale) => nomeAttuale == cardAttuale.dataset.card,
      )
    ) {
      cardAttuale.classList.add("disabled");
    }
  });

  let arrayNomiSquadra2 = [];
  elementiSquadra2.forEach((el) => arrayNomiSquadra2.push(el.dataset.card)); //inserisco tutti i nomi di squadra 2 in un array
  //scorro squadra utente per capire se c'è un doppione che non deve essere selezionato, e lo disabilitod
  elementiSquadraUtente.forEach((cardAttuale) => {
    if (
      arrayNomiSquadra2.some(
        (nomeAttuale) => nomeAttuale == cardAttuale.dataset.card,
      )
    ) {
      cardAttuale.classList.add("disabled");
    } else {
      cardAttuale.classList.remove("disabled");
    }
  });
}

function gestisciClickCard(e) {
  const cardGiocatoreCliccata = e.target.closest(".card-giocatore");
  if (
    !cardGiocatoreCliccata ||
    cardGiocatoreCliccata.classList.contains("disabled")
  )
    return;

  if (cardGiocatoreCliccata.classList.contains("selected")) {
    cardGiocatoreCliccata.classList.remove("selected");
  } else {
    cardGiocatoreCliccata.classList.add("selected");
  }
}
