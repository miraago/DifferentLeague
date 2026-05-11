import { UTENTELOGGATO } from "./gestioneUtente.js";
import { paginaDaRendereVisibile, player } from "./script.js";
import { creaCardGiocatore } from "./cardGiocatore.js";
import { IMPOSTAZIONI } from "./impostazioni.js";
import { popupStatisticheGiocatore } from "./popupStatisticheGiocatori.js";

const vistaScambi = document.getElementById("vista-scambi");
vistaScambi.addEventListener("change", gestisciSelezionaSquadra);
vistaScambi.addEventListener("click", gestisciClickCard);
vistaScambi.addEventListener("click", gestisciClickStatisticaGiocatore);
vistaScambi.addEventListener("click", inviaProposta);
vistaScambi.addEventListener("change", gestisciAggiungiRichiediCrediti);

let cbPlayer = [];
let cbPresidenti = [];
let selezionatiSquadra1 = [];
let selezionatiSquadra2 = [];
let presidenteSquadra2 = null;

export function inizializzaScambi(players, presidenti) {
  cbPlayer = players;
  cbPresidenti = presidenti;
}

/**APPENA SI PIGGIA SUL MENU SCAMBI CLASSICI SI AVVIA LA FUNZIONE */
export function scambiaGiocatore() {
  const TAG_H2 = document.querySelector("h2");

  if (TAG_H2.dataset.action != "apri-scambi-classici") {
    TAG_H2.innerText = "MERCATO - Proposte di scambio";
    TAG_H2.dataset.action = "apri-scambi";
    paginaDaRendereVisibile("scambi");
  }
  selezionatiSquadra1 = [];
  selezionatiSquadra2 = [];
  resetErrori();
  resetContainerSquadra1();
  resetContainerSquadra2();
  
  resetDifferenzaCrediti();
  creaSelectSquadre();
  aggiornaRuoliECreditiResiduiSquadra2();
  aggiornaRuoliECreditiResiduiSquadraUtente();
  aggiornaContainerRiepilogoScambi();

  //stampiamo i giocatori della propria squadra
  const containerSquadraUtente = document.getElementById(
    "container-squadra-utente",
  );
  // Blocca i click finché non viene selezionato un avversario dalla select
  containerSquadraUtente.style.pointerEvents = "none";

  stampaSquadra(UTENTELOGGATO.presidenteUtenteLoggato, containerSquadraUtente);
}

/**
 * funzione che stampa la squadra passata come parametro nel container passato come parametro
 * @param {*} squadraDaStampare
 * @param {*} container
 */
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

function gestisciSelezionaSquadra(e) {
  if (!e.target.closest("select")) return; //se il cambio non è avvenuto su una select esci dalla funzione

  if(e.target.id!=="select-scelta-squadra") return; //controlliamo che sia la select che ci occorre per questa funzione
  
  

  resetSelected(); //resettiamo eventuali card selezionate in azioni precedenti
  selezionatiSquadra1 = [];
  selezionatiSquadra2 = [];
  aggiornaContainerRiepilogoScambi();

  const squadraSelezionata = document.getElementById(
    "select-scelta-squadra",
  ).value;

  const containerSquadraUtente = document.getElementById(
    "container-squadra-utente",
  );

  /**CONTROLLO SE è stata selezionata una SQUADRA 2
   * SE LA SQUADRA NON è STATA SELEZIONATA DISABILITO IL POINTER EVENT DAL CONTAINER SQUADRA 1
   * PERCHE' e' INUTILE FAR SELEZIONARE I GIOCATORI SENZA UNA SQUADRA DA SCAMBIARE
   */
  // Abilita/disabilita il container a seconda della selezione
  if (squadraSelezionata != "0") {
    containerSquadraUtente.style.pointerEvents = "auto";
  } else {
    containerSquadraUtente.style.pointerEvents = "none";
    //RIAVVIA SCAMBIO
    scambiaGiocatore();
    return;
  }

  presidenteSquadra2 = cbPresidenti.find((presidentecorrente) => {
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
function controllaDoppioni() {
  const elementiSquadraUtente = document.querySelectorAll(
    "#container-squadra-utente .card-giocatore",
  );
  const elementiSquadra2 = document.querySelectorAll(
    "#container-squadra-2 .card-giocatore",
  );

  // Creiamo un array pulito solo con i nomi: ["Leao", "Maignan", ...]
  const nomiSquadra1 = Array.from(elementiSquadraUtente).map(
    (el) => el.dataset.card,
  );
  const nomiSquadra2 = Array.from(elementiSquadra2).map(
    (el) => el.dataset.card,
  );

  // Scorro squadra 2: se il nome è INCLUSO in squadra 1, lo disabilito
  elementiSquadra2.forEach((card) => {
    if (nomiSquadra1.includes(card.dataset.card)) {
      card.classList.add("disabled");
    }
  });

  // Scorro squadra 1: se il nome è INCLUSO in squadra 2, lo disabilito
  elementiSquadraUtente.forEach((card) => {
    if (nomiSquadra2.includes(card.dataset.card)) {
      card.classList.add("disabled");
    } else {
      card.classList.remove("disabled");
    }
  });
}

function gestisciClickCard(e) {
  const cardGiocatoreCliccata = e.target.closest(".card-giocatore");

  /*********controllo sicurezza */
  //se non è una card l'oggetto cliccato oppure la card contiene la classe disabled non può essere cliccata quindi usciamo
  if (
    !cardGiocatoreCliccata ||
    cardGiocatoreCliccata.classList.contains("disabled")
  )
    return;

  /******aggiunta o rimozione della classe selected */
  //se la card è selezionata la deselezioniamo, se invece non è selezionata la selezioniamo
  if (cardGiocatoreCliccata.classList.contains("selected")) {
    cardGiocatoreCliccata.classList.remove("selected");
    //logica per rimuovere il giocatore dal riepilogo scambio

    selezionatiSquadra1 = selezionatiSquadra1.filter(
      (s) => s.giocatore.getNome != cardGiocatoreCliccata.dataset.card,
    );
    selezionatiSquadra2 = selezionatiSquadra2.filter(
      (s) => s.giocatore.getNome != cardGiocatoreCliccata.dataset.card,
    );
  } else {
    cardGiocatoreCliccata.classList.add("selected");
    //salviamo tutto il necessario della card cliccata
    const dettagliGiocatore = {
      giocatore: cbPlayer.find(
        (g) => g.getNome == cardGiocatoreCliccata.dataset.card,
      ), //prendo il riferimento al giocatore,
      costoDiAcquisto: parseInt(
        cardGiocatoreCliccata
          .querySelector(".costo-acquisto .valore")
          .innerHTML.trim(),
      ), //prendo l'intero costo di acquisto
      index: cardGiocatoreCliccata.dataset.index,
    };
    //scopriamo in quale delle due squadre sta

    const giocatoriSquadra1 =
      UTENTELOGGATO.presidenteUtenteLoggato.getTuttiGliSlot;
    const controlloSePresente = giocatoriSquadra1.some((g) => {
      return (
        g != null &&
        g.getDatiGiocatore.getNome == dettagliGiocatore.giocatore.getNome
      );
    });
    if (controlloSePresente) {
      selezionatiSquadra1.push(dettagliGiocatore);
    } else {
      selezionatiSquadra2.push(dettagliGiocatore);
    }
  }
  aggiornaContainerRiepilogoScambi();
  //************************************************** */
  //abilita disabilita scambi
  if (selezionatiSquadra1.length == 0 && selezionatiSquadra2.length == 0) {
    document.getElementById("container-riepilogo-scambio").style.display =
      "none";
  } else {
    document.getElementById("container-riepilogo-scambio").style.display =
      "grid";
  }
}
//funzione che aggiorna il container riepilogo scambio con i giocatori selezionati, e calcola la differenza totale delle quotazioni dei giocatori selezionati, e aggiorna il conteggio dei ruoli
function aggiornaContainerRiepilogoScambi() {
  //ogni volta che viene chiamata questa funzione deve ridisegnare il container riepilogo con i giocatori selezionati

  const boxSquadra1 = document.getElementById(
    "box-riepilogo-giocatori-squadra1",
  );
  const boxSquadra2 = document.getElementById(
    "box-riepilogo-giocatori-squadra2",
  );
  boxSquadra1.innerHTML =
    "<div><div title='Ruolo'>R</div><div title='Nome del Giocatore'>Nome</div><div title='costo di acquisto'>Acq.</div><div title='Quotazione Attuale'>Qt</div></div>"; //reset box squadra 1
  boxSquadra2.innerHTML =
    "<div><div title='Ruolo'>R</div><div title='Nome del Giocatore'>Nome</div><div title='costo di acquisto'>Acq.</div><div title='Quotazione Attuale'>Qt</div></div>"; //reset box squadra 2

  //aggiornamento squadra 1
  let totaleQuotazioniSquadra1 = 0;
  const elementoHtmlContenenteQuotazioneTotaleSquadra1 =
    document.getElementById("valore-totale-quotazioni-squadra1");
  elementoHtmlContenenteQuotazioneTotaleSquadra1.innerHTML = "0";
  selezionatiSquadra1.forEach((s) => {
    const div = document.createElement("div");
    div.innerHTML = `
    <div><span class = "ruolo ${s.giocatore.getRuolo}">${s.giocatore.getRuolo}</span></div>
    <div>${s.giocatore.getNome}</div>
    <div>${s.costoDiAcquisto}</div>
    <div>${s.giocatore.getQuotazione}</div>`;
    boxSquadra1.append(div);
    totaleQuotazioniSquadra1 += s.giocatore.getQuotazione;
  });
  elementoHtmlContenenteQuotazioneTotaleSquadra1.innerHTML =
    totaleQuotazioniSquadra1;

  //aggiornamento squadra 2
  let totaleQuotazioniSquadra2 = 0;
  const elementoHtmlContenenteQuotazioneTotaleSquadra2 =
    document.getElementById("valore-totale-quotazioni-squadra2");
  elementoHtmlContenenteQuotazioneTotaleSquadra2.innerHTML = "0";
  selezionatiSquadra2.forEach((s) => {
    const div = document.createElement("div");
    div.innerHTML = `
    <div><span class = "ruolo ${s.giocatore.getRuolo}">${s.giocatore.getRuolo}</span></div>
    <div>${s.giocatore.getNome}</div>
    <div>${s.costoDiAcquisto}</div>
    <div>${s.giocatore.getQuotazione}</div>`;
    boxSquadra2.append(div);
    totaleQuotazioniSquadra2 += s.giocatore.getQuotazione;
  });
  elementoHtmlContenenteQuotazioneTotaleSquadra2.innerHTML =
    totaleQuotazioniSquadra2;

  //aggiornamento differenza
  const totaleDifferenzaCrediti = document.getElementById(
    "totale-differenza-crediti",
  );
  totaleDifferenzaCrediti.innerHTML =
    totaleQuotazioniSquadra1 > totaleQuotazioniSquadra2
      ? totaleQuotazioniSquadra1 - totaleQuotazioniSquadra2
      : totaleQuotazioniSquadra2 - totaleQuotazioniSquadra1;

  //coloriamo il testo della riga dove viene calcolata la differenza
  // di verde se è <= del valore impostato nelle regole
  //di rosso se è > del valore impostato nelle regole
  const differenza = parseInt(totaleDifferenzaCrediti.innerText);
  const eleDifferenzaCrediti = document.getElementById(
    "totale-differenza-crediti",
  );
  if (differenza > IMPOSTAZIONI.REGOLE_SCAMBI.DIFFERENZA_MAX) {
    eleDifferenzaCrediti.classList.add("errore");
  } else {
    eleDifferenzaCrediti.classList.remove("errore");
  }

  aggiornaConteggioRuoli();
}
//funzione che aggiorna il conteggio dei ruoli in base ai giocatori selezionati e a quelli già presenti nelle squadre, e se viene superato il numero massimo di giocatori per ruolo mette la classe errore al conteggio
function aggiornaConteggioRuoli() {
  const elementi = {
    ps1: document.getElementById("tot-P-s1"),
    ds1: document.getElementById("tot-D-s1"),
    cs1: document.getElementById("tot-C-s1"),
    as1: document.getElementById("tot-A-s1"),
    ps2: document.getElementById("tot-P-s2"),
    ds2: document.getElementById("tot-D-s2"),
    cs2: document.getElementById("tot-C-s2"),
    as2: document.getElementById("tot-A-s2"),
  };
  // for (const conteggio in elementi) {
  //   elementi[conteggio].innerHTML = "0";
  // }

  /**CONTEGGIO RUOLI */
  const squadra1 = UTENTELOGGATO.presidenteUtenteLoggato;

  const squadra2 = cbPresidenti.find((presidentecorrente) => {
    return (
      presidentecorrente.getNomeRosa ==
      document.getElementById("select-scelta-squadra").value
    );
  });
  //  Se non c'è una squadra 2 selezionata, esci o usa valori a zero
  if (!squadra2) {
    // Potresti nascondere i conteggi della squadra 2 o resettarli a "0" qui.
    // Per sicurezza, blocchiamo l'esecuzione della funzione:
    return;
  }

  const elCreditiResiduiS2 = document.getElementById(
    "crediti-residui-squadra-2",
  );
  if (elCreditiResiduiS2) {
    elCreditiResiduiS2.innerHTML = squadra2.getCreditiResidui;
  }

  /* contiamo gli slot occupati della squadra 1 */
  let s1 = {
    P: squadra1.getContaP,
    D: squadra1.getContaD,
    C: squadra1.getContaC,
    A: squadra1.getContaA,
  };
  /* contiamo gli slot occupati della squadra 2 */
  let s2 = {
    P: squadra2.getContaP,
    D: squadra2.getContaD,
    C: squadra2.getContaC,
    A: squadra2.getContaA,
  };

  /*aggiorniamo i conteggi con i cambi*/
  /* inseriamo nella visuale del conteggio il numero di giocatori per ruolo, e aggiungiamo quelli selezionati della squadra 2 e sottraiamo quelli della squadra 1*/
  elementi.ps1.innerHTML =
    s1.P +
    selezionatiSquadra2.filter((s) => s.giocatore.getRuolo == "P").length -
    selezionatiSquadra1.filter((s) => s.giocatore.getRuolo == "P").length;
  elementi.ds1.innerHTML =
    s1.D +
    selezionatiSquadra2.filter((s) => s.giocatore.getRuolo == "D").length -
    selezionatiSquadra1.filter((s) => s.giocatore.getRuolo == "D").length;
  elementi.cs1.innerHTML =
    s1.C +
    selezionatiSquadra2.filter((s) => s.giocatore.getRuolo == "C").length -
    selezionatiSquadra1.filter((s) => s.giocatore.getRuolo == "C").length;
  elementi.as1.innerHTML =
    s1.A +
    selezionatiSquadra2.filter((s) => s.giocatore.getRuolo == "A").length -
    selezionatiSquadra1.filter((s) => s.giocatore.getRuolo == "A").length;

  /* inseriamo nella visuale del conteggio il numero di giocatori per ruolo, e aggiungiamo quelli selezionati della squadra 1 e sottraiamo quelli della squadra 2*/
  elementi.ps2.innerHTML =
    s2.P +
    selezionatiSquadra1.filter((s) => s.giocatore.getRuolo == "P").length -
    selezionatiSquadra2.filter((s) => s.giocatore.getRuolo == "P").length;
  elementi.ds2.innerHTML =
    s2.D +
    selezionatiSquadra1.filter((s) => s.giocatore.getRuolo == "D").length -
    selezionatiSquadra2.filter((s) => s.giocatore.getRuolo == "D").length;
  elementi.cs2.innerHTML =
    s2.C +
    selezionatiSquadra1.filter((s) => s.giocatore.getRuolo == "C").length -
    selezionatiSquadra2.filter((s) => s.giocatore.getRuolo == "C").length;
  elementi.as2.innerHTML =
    s2.A +
    selezionatiSquadra1.filter((s) => s.giocatore.getRuolo == "A").length -
    selezionatiSquadra2.filter((s) => s.giocatore.getRuolo == "A").length;

  /* riferimento al numero massimo di giocatori per ruolo */
  const massimoXRuolo = {
    P: IMPOSTAZIONI.REGOLE.MAX_P,
    D: IMPOSTAZIONI.REGOLE.MAX_D,
    C: IMPOSTAZIONI.REGOLE.MAX_C,
    A: IMPOSTAZIONI.REGOLE.MAX_A,
  };

  /* SE SI E' SUPERATO IL NUMERO MAX GLI METTO LA CLASSE ERRORE */
  parseInt(elementi.ps1.innerHTML) > massimoXRuolo.P
    ? elementi.ps1.parentElement.classList.add("errore")
    : elementi.ps1.parentElement.classList.remove("errore");
  parseInt(elementi.ds1.innerHTML) > massimoXRuolo.D
    ? elementi.ds1.parentElement.classList.add("errore")
    : elementi.ds1.parentElement.classList.remove("errore");
  parseInt(elementi.cs1.innerHTML) > massimoXRuolo.C
    ? elementi.cs1.parentElement.classList.add("errore")
    : elementi.cs1.parentElement.classList.remove("errore");
  parseInt(elementi.as1.innerHTML) > massimoXRuolo.A
    ? elementi.as1.parentElement.classList.add("errore")
    : elementi.as1.parentElement.classList.remove("errore");
  parseInt(elementi.ps2.innerHTML) > massimoXRuolo.P
    ? elementi.ps2.parentElement.classList.add("errore")
    : elementi.ps2.parentElement.classList.remove("errore");
  parseInt(elementi.ds2.innerHTML) > massimoXRuolo.D
    ? elementi.ds2.parentElement.classList.add("errore")
    : elementi.ds2.parentElement.classList.remove("errore");
  parseInt(elementi.cs2.innerHTML) > massimoXRuolo.C
    ? elementi.cs2.parentElement.classList.add("errore")
    : elementi.cs2.parentElement.classList.remove("errore");
  parseInt(elementi.as2.innerHTML) > massimoXRuolo.A
    ? elementi.as2.parentElement.classList.add("errore")
    : elementi.as2.parentElement.classList.remove("errore");
  switchBottoneInvia();
}

//funzione che controlla se ci sono errori nei conteggi
// e disabilita il bottone invia proposta se c'è almeno un errore
// o se non è stata selezionata una squadra 2, altrimenti lo abilita
function switchBottoneInvia() {
  //riferimento al container vista scambi
  const vistaScambi = document.getElementById("vista-scambi");
  //riferimento al bottone invia proposta
  const bottoneInvia = document.getElementById("invia-proposta");

  //controlliamo se ci sono errori
  if (
    vistaScambi.querySelectorAll(".errore").length > 0 ||
    document.getElementById("select-scelta-squadra").value == "0" ||
    selezionatiSquadra1.length + selezionatiSquadra2.length == 0
  ) {
    //c'è un errore disabilita bottone invia proposta
    bottoneInvia.classList.add("disabled");
  } else {
    //non c'è un errore
    // è selezionata almeno una squadra nella select
    // c'è almeno un giocatore selezionato
    // quindi abilitiamo il pulsante errore
    bottoneInvia.classList.remove("disabled");
  }
}

/**
 * funzione che resetta il container squadra 1, pulendolo da eventuali scelte precedenti
 */
function resetContainerSquadra1() {
  const containerSquadraUtente = document.getElementById(
    "container-squadra-utente",
  );
  containerSquadraUtente.innerHTML = "";
}
/**
 * funzione che resetta il container squadra 2, pulendolo da eventuali scelte precedenti
 */
function resetContainerSquadra2() {
  const containerSquadra2 = document.getElementById("container-squadra-2");
  containerSquadra2.innerHTML = "";
}

/**
 * funzione che resetta il conteggio della differenza crediti, e rimuove la classe errore se presente
 */
function resetDifferenzaCrediti() {
  document.getElementById("valore-totale-quotazioni-squadra1").innerHTML = "0";
  document.getElementById("valore-totale-quotazioni-squadra2").innerHTML = "0";

  document.getElementById("totale-differenza-crediti").innerHTML = "0";

  document
    .getElementById("totale-differenza-crediti")
    .classList.remove("errore");
}

function creaSelectSquadre() {
  //creazione select con squadra utente
  const selectMiaSquadra = document.getElementById("select-la-mia-squadra");
  selectMiaSquadra.innerHTML = `<option>${UTENTELOGGATO.nomeSquadraUtenteLoggato}</option>`;

  //creiamo il select per la scelta della squadra
  const selectSceltaSquadra = document.getElementById("select-scelta-squadra");
  let rigaOption = "<option selected value='0'> Seleziona Squadra </option>";
  cbPresidenti.forEach((presidentecorrente) => {
    if (presidentecorrente != UTENTELOGGATO.presidenteUtenteLoggato) {
      rigaOption += `<option value='${presidentecorrente.getNomeRosa}'>${presidentecorrente.getNomeRosa}</option>`;
    }
  });
  //inseriamo le righe create nella select
  selectSceltaSquadra.innerHTML = rigaOption;
}

function aggiornaRuoliECreditiResiduiSquadraUtente() {
  const squadraUtente = UTENTELOGGATO.presidenteUtenteLoggato;
  const elCreditiResiduiS1 = document.getElementById(
    "crediti-residui-squadra-1",
  );
  if (elCreditiResiduiS1) {
    elCreditiResiduiS1.innerHTML = squadraUtente.getCreditiResidui;
  }
  const elementi = {
    ps1: document.getElementById("tot-P-s1"),
    ds1: document.getElementById("tot-D-s1"),
    cs1: document.getElementById("tot-C-s1"),
    as1: document.getElementById("tot-A-s1"),
  };
  elementi.ps1.innerHTML = squadraUtente.getContaP;
  elementi.ds1.innerHTML = squadraUtente.getContaD;
  elementi.cs1.innerHTML = squadraUtente.getContaC;
  elementi.as1.innerHTML = squadraUtente.getContaA;
}
/**
 * * funzione che resetta i conteggi dei ruoli della squadra 1, e rimuove la classe errore se presente
 */
function resetRuoliSquadra1() {
  const elementi = {
    ps1: document.getElementById("tot-P-s1"),
    ds1: document.getElementById("tot-D-s1"),
    cs1: document.getElementById("tot-C-s1"),
    as1: document.getElementById("tot-A-s1"),
  };
  for (const conteggio in elementi) {
    elementi[conteggio].innerHTML = "0";
    elementi[conteggio].parentElement.classList.remove("errore");
  }
}

function aggiornaRuoliECreditiResiduiSquadra2() {
  const squadra2 = cbPresidenti.find((presidentecorrente) => {
    return (
      presidentecorrente.getNomeRosa ==
      document.getElementById("select-scelta-squadra").value
    );
  });

  const elCreditiResiduiS2 = document.getElementById(
    "crediti-residui-squadra-2",
  );
  if (!squadra2) {
    if (elCreditiResiduiS2) elCreditiResiduiS2.innerHTML = "0";

    // AZZERIAMO I FANTASMI A SCHERMO!
    document.getElementById("tot-P-s2").innerHTML = "0";
    document.getElementById("tot-D-s2").innerHTML = "0";
    document.getElementById("tot-C-s2").innerHTML = "0";
    document.getElementById("tot-A-s2").innerHTML = "0";
    return;
  }

  if (!squadra2) {
    elCreditiResiduiS2.innerHTML = "0";
    return;
  }

  if (elCreditiResiduiS2) {
    elCreditiResiduiS2.innerHTML = squadra2.getCreditiResidui;
  }
  const elementi = {
    ps2: document.getElementById("tot-P-s2"),
    ds2: document.getElementById("tot-D-s2"),
    cs2: document.getElementById("tot-C-s2"),
    as2: document.getElementById("tot-A-s2"),
  };
  elementi.ps2.innerHTML = squadra2.getContaP;
  elementi.ds2.innerHTML = squadra2.getContaD;
  elementi.cs2.innerHTML = squadra2.getContaC;
  elementi.as2.innerHTML = squadra2.getContaA;
}
/**
 * funzione che resetta i conteggi dei ruoli della squadra 2, e rimuove la classe errore se presente
 */
function resetRuoliSquadra2() {
  const elementi = {
    ps2: document.getElementById("tot-P-s2"),
    ds2: document.getElementById("tot-D-s2"),
    cs2: document.getElementById("tot-C-s2"),
    as2: document.getElementById("tot-A-s2"),
  };
  for (const conteggio in elementi) {
    elementi[conteggio].innerHTML = "0";
    elementi[conteggio].parentElement.classList.remove("errore");
  }
}

function resetErrori() {
  //rimuove la classe errore da tutti gli elementi che la contengono
  const elementiConErrore = vistaScambi.querySelectorAll(".errore");
  elementiConErrore.forEach((el) => el.classList.remove("errore"));
}

function inviaProposta(e) {
  //controlliamo che il clic provenga sul bottone invia proposta
  if (e.target.name !== "invia-proposta") return;


  //creazione oggetto proposta di scambio con tutte le informazioni necessarie
  const propostaScambio = {
    squadra1: UTENTELOGGATO.presidenteUtenteLoggato,
    squadra2: cbPresidenti.find((presidentecorrente) => {
      return (
        presidentecorrente.getNomeRosa ==
        document.getElementById("select-scelta-squadra").value
      );
    }),
    selezionatiSquadra1: selezionatiSquadra1,
    selezionatiSquadra2: selezionatiSquadra2,
    dataProposta: new Date(),
  };
  if (controlloInvioProposta()) {
    console.log("Proposta inviata con successo");
    console.log(propostaScambio);
  }
}
function controlloInvioProposta() {
  //controlliamo che i dati interni della proposta sono corretti, non ci fidiamo dell'html, potrebbe essere stato manomesso da un utente esperto in informatica, quindi controlliamo
  //differenza crediti che sia <= del valore impostato nelle regole
  const totaleQuotazioniSquadra1 = selezionatiSquadra1.reduce(
    (acc, s) => acc + s.giocatore.getQuotazione,
    0,
  );
  const totaleQuotazioniSquadra2 = selezionatiSquadra2.reduce(
    (acc, s) => acc + s.giocatore.getQuotazione,
    0,
  );
  const differenza = Math.abs(
    totaleQuotazioniSquadra1 - totaleQuotazioniSquadra2,
  );

  if (differenza > IMPOSTAZIONI.REGOLE_SCAMBI.DIFFERENZA_MAX) {
    return false;
  }
  //controlliamo che non ci siano più giocatori per ruolo rispetto al massimo consentito dalle regole

  let conteggioRuoli = {
    P: 0,
    D: 0,
    C: 0,
    A: 0,
  };
  //aggiungiamo al conteggio della squadra 1 i giocatori della squadra 2 che andrebbero ad accupare gli slot della squadra 1
  selezionatiSquadra2.forEach((s) => {
    conteggioRuoli[s.giocatore.getRuolo] += 1;
  });

  return true;
}

function gestisciClickStatisticaGiocatore(e) {
  const nomeGiocatoreCliccata = e.target.closest(".nome-giocatore");
  if (!nomeGiocatoreCliccata) return;
  console.log(
    "Hai cliccato sulla statistica del giocatore: " +
      nomeGiocatoreCliccata.innerText,
  );
  popupStatisticheGiocatore(
    player.find((g) => g.getNome == nomeGiocatoreCliccata.innerText),
  );
}

function gestisciAggiungiRichiediCrediti(e) {
  // 1. FILTRO: Se l'elemento che è cambiato NON si chiama "richiesta-crediti", fermati qui.
  if (e.target.name !== "richiesta-crediti") return;


  // 2. LOGICA: Se siamo arrivati qui, è sicuramente il radio button!
  const valoreScelto = e.target.value; // Sarà "aggiungi" o "richiedi"
  let rigaOption="";

  if(valoreScelto == "aggiungi")
  {
    //popoliamo il select con un numero massimo di crediti residui della squadra
    for(let i=0; i<UTENTELOGGATO.presidenteUtenteLoggato.getCreditiResidui+1; i++)
    {
      rigaOption += `<option value='${i}'>${i}</option>`;    
    }
  }
  else
  {
    // popoliamo la select con il massimo di numeri di crediti della squadra avversaria
    for(let i=0; i<presidenteSquadra2.getCreditiResidui+1; i++)
    {
      rigaOption += `<option value='${i}'>${i}</option>`; 
    }

  }

  document.getElementById("select-richiesta-crediti").innerHTML = rigaOption;

}
