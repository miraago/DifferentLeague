import { UTENTELOGGATO } from "./gestioneUtente.js";
import { paginaDaRendereVisibile } from "./script.js";
import {
  creaCardGiocatore,
  creaCardGiocatoreVuotoSostituibile,
} from "./cardGiocatore.js";

const vistaMercato = document.getElementById("vista-mercato");

vistaMercato.addEventListener("click", gestisciClickDaSvincolare);
vistaMercato.addEventListener("click", gestisciClickDapromettere);
vistaMercato.addEventListener("click", gestisciClickDaAnnullare);
vistaMercato.addEventListener("click", gestisciOffertaSlotVuoto);

let cbPlayer = [];
let cbPresidenti = [];
let presidenteUtenteLoggato = "";
let containerInfoSquadra = null;

let containerGiocatori = null;
let containerRiepilogo = null;
let apriPopupSvincolatiEsterno = cbApriPopupSvincolati;

export let operazioneInCorso = null;

export function inizializzaMercato(players, presidenti, cbApriPopup) {
  cbPlayer = players;
  cbPresidenti = presidenti;
  apriPopupSvincolatiEsterno = cbApriPopup; // La salviamo per usarla dopo!z

  //ricavo tutte le info del presidente loggato
  presidenteUtenteLoggato = cbPresidenti.find((squadraAttuale) => {
    return (
      squadraAttuale.getNomeRosa.toUpperCase() ==
      UTENTELOGGATO.nomeSquadraUtenteLoggato.toUpperCase()
    );
  });
}

//crea la
function creaContainer() {
  //creiamo i tre contenitori

  //contenitore info squadra
  containerInfoSquadra = document.createElement("section");
  containerInfoSquadra.id = "container-info-squadra";
  containerInfoSquadra.innerHTML = `
  <div id="box-info">
    <div id='nome-squadra'>
      ${UTENTELOGGATO.nomeSquadraUtenteLoggato} 
    </div>
    <div id="nome-presidente">${presidenteUtenteLoggato.getNomePresidente} </div>
  </div>
    <div  id="box-calcoli">
      <div>
        <div class="etichetta"> Crediti Residui </div>
        <div id="crediti-residui" class="valore"> ${presidenteUtenteLoggato.getCreditiResidui}</div>
      </div>
      <div>  
        <div class="etichetta"> Crediti Svincolati </div>
        <div id="crediti-recuperati" class="valore"> 0 </div>    
      </div>
      <div>  
        <div class="etichetta"> Totale </div>
        <div id="crediti-totale" class="valore"> ${presidenteUtenteLoggato.getCreditiResidui} </div>    
      </div>
    </div>
    
  </div>
  
      `;
  vistaMercato.append(containerInfoSquadra);

  // //contenitore bottone invia
  // containerBottoni = document.createElement("section");
  // containerBottoni.id = "container-bottoni";
  // vistaMercato.append(containerBottoni);

  //contenitore giocatori
  containerGiocatori = document.createElement("section");
  containerGiocatori.id = "container-giocatori";
  vistaMercato.append(containerGiocatori);
  containerGiocatori.innerHTML = `<h3> LISTA GIOCATORI ${UTENTELOGGATO.nomeSquadraUtenteLoggato} </h3>`;

  //contenitore riepilogo
  containerRiepilogo = document.createElement("section");
  containerRiepilogo.id = "container-riepilogo";
  vistaMercato.append(containerRiepilogo);
  containerRiepilogo.innerHTML = `<h3> Riepilogo Mercato ${UTENTELOGGATO.nomeSquadraUtenteLoggato}</h2>`;
}

export function mercatoSvincola() {
  const TAG_H2 = document.querySelector("h2");
  if (TAG_H2.dataset.action != "apri-mercato") {
    TAG_H2.innerText = "MERCATO - Svincola Giocatori";
    TAG_H2.dataset.action = "apri-mercato";
    paginaDaRendereVisibile("mercato");
  }

  vistaMercato.innerText = ""; //Azzeriamo la vista e la ricostruiamo

  creaContainer();

  presidenteUtenteLoggato.getTuttiGliSlot.forEach((element, index) => {
    let temp = 0;
    if (index >= 0 && index < 3) {
      temp = "P";
    } else if (index >= 3 && index < 11) {
      temp = "D";
    } else if (index >= 11 && index < 19) {
      temp = "C";
    } else {
      temp = "A";
    }

    //creiamo il box contenente la card
    const boxSlot = document.createElement("section");
    boxSlot.classList.add("box-slot");
    boxSlot.dataset.ruolo = temp; //data ruolo
    boxSlot.dataset.index = index; //data Index
    boxSlot.style.order = index; //order per il flexBox per tenerle sempre in ordine di slot

    if (element) {
      // se element esiste e non è null crea card giocatore
      boxSlot.append(creaCardGiocatore(element, index, 3)); //opzione 3 crea con bottone svincola promessa annulla
    } else {
      //situazione di slot vuoto
      boxSlot.append(creaCardGiocatoreVuotoSostituibile(temp, index));
    }

    containerGiocatori.append(boxSlot);
  });
}

//gestisce il bottone svincola
function gestisciClickDaSvincolare(e) {
  const iconaCliccata = e.target.closest(".bottone-svincola"); // se è stato fatto click sull'icona cestino

  if (!iconaCliccata) return; // se non ho cliccato sul pulsante cestino esci

  const cardCliccata = e.target.closest(".card-giocatore"); //prendiamo il riferimento alla card cliccata
  const slotCliccato = e.target.closest(".box-slot");

  const nomeGiocatore = cardCliccata.dataset.card; //prendiamo il nome del giocatore

  const giocatoreDiRiferimento = cbPlayer.find((giocatoreCorrente) => {
    //ricaviamo le info del giocatore
    return giocatoreCorrente.getNome == nomeGiocatore;
  });

  cardCliccata.classList.add("in-svincolo"); //aggiungiamo la classe in svincolo

  //PRENDIAMO LA CARD E LA METTIAMO nel container riepilogo
  containerRiepilogo.append(cardCliccata);

  const ruoloDiRiferimento = giocatoreDiRiferimento.getRuolo;

  //togliamo i pulsanti di svincola e di sostituisci, il giocatore
  cardCliccata.querySelector(".bottone-svincola").style.display = "none";
  cardCliccata.querySelector(".bottone-promessa").style.display = "none";
  cardCliccata.querySelector(".bottone-annulla").style.display = "block";

  const cardSostituibile = creaCardGiocatoreVuotoSostituibile(
    ruoloDiRiferimento,
    cardCliccata.dataset.index,
  );

  slotCliccato.append(cardSostituibile);

  aggiornaValoriNelBoxInfo();
}

//gestisce il bottone promessa
function gestisciClickDapromettere(e) {
  const iconaCliccata = e.target.closest(".bottone-promessa"); // se è stato fatto click sull'icona promessa

  if (!iconaCliccata) return; // se non ho cliccato sul pulsante promessa esci

  const cardCliccata = e.target.closest(".card-giocatore"); //prendiamo il riferimento alla card cliccata
  const slotCliccato = e.target.closest(".box-slot"); //prendiamo il riferimento allo slot dove si trova la card

  const nomeGiocatore = cardCliccata.dataset.card; //prendiamo il nome del giocatore

  const giocatoreDiRiferimento = cbPlayer.find((giocatoreCorrente) => {
    //ricaviamo le info del giocatore
    return giocatoreCorrente.getNome == nomeGiocatore;
  });

  cardCliccata.classList.add("in-promessa"); //aggiungiamo la classe in promessa

  //PRENDIAMO LA CARD E LA METTIAMO nel container riepilogo
  containerRiepilogo.append(cardCliccata);

  const ruoloDiRiferimento = giocatoreDiRiferimento.getRuolo;

  //togliamo i pulsanti di svincola e di sostituisci, il giocatore
  cardCliccata.querySelector(".bottone-svincola").style.display = "none";
  cardCliccata.querySelector(".bottone-promessa").style.display = "none";
  cardCliccata.querySelector(".bottone-annulla").style.display = "block";

  const cardVuota = creaCardGiocatoreVuotoSostituibile(
    ruoloDiRiferimento,
    cardCliccata.dataset.index,
  );

  operazioneInCorso = {
    tipo: "PROMESSA",
    ruoloCercato: ruoloDiRiferimento,
    giocatoreDaTagliare: nomeGiocatore,
    slotDiRiferimento: slotCliccato,
  };

  //qui dobbiamo aprire una finestra popup con la lista dei giocatori, salviamo le info che ci servono
  if (apriPopupSvincolatiEsterno) {
    apriPopupSvincolatiEsterno(ruoloDiRiferimento);
  }

  slotCliccato.append(cardVuota);

  aggiornaValoriNelBoxInfo();
}

//gestisce il bottone annulla
function gestisciClickDaAnnullare(e) {
  const iconaCliccata = e.target.closest(".bottone-annulla"); // se è stato fatto click sull'icona annulla

  if (!iconaCliccata) return; // se non ho cliccato sul pulsante annulla esci
  const cardCliccata = e.target.closest(".card-giocatore"); //prendiamo il riferimento alla card cliccata

  //cerchiamo lo slot del giocatore
  const tuttiGliSlot = containerGiocatori.querySelectorAll(".box-slot"); //prendiamo tutti gli slot

  let slotDaRimpiazzare;
  tuttiGliSlot.forEach((slotCorrente) => {
    if (slotCorrente.dataset.index == cardCliccata.dataset.index) {
      slotDaRimpiazzare = slotCorrente;
      return;
    }
  });

  if (slotDaRimpiazzare.querySelector(".card-giocatore.sostituibile")) {
    //se c'è una card sostituibile la rimuovi ed inserisci la card annullata

    //rimettiamo la card in rosa
    cardCliccata.classList.remove("in-svincolo"); //rimuoviamo la classe in svincolo

    //rimettiamo i pulsanti di svincola e di sostituisci, il giocatore
    cardCliccata.querySelector(".bottone-svincola").style.display = "block";
    cardCliccata.querySelector(".bottone-promessa").style.display = "block";
    cardCliccata.querySelector(".bottone-annulla").style.display = "none";

    //rimuovi card SOSTITUIBILE
    slotDaRimpiazzare.querySelector(".card-giocatore.sostituibile").remove();
    //inserisci la card annullata
    slotDaRimpiazzare.append(cardCliccata);
  } else {
    //lo slot è occupato da una card
    //logica per avvisare l'utente a dover eliminare prima la card
  }

  aggiornaValoriNelBoxInfo();
}

/**
 * calcola il valore di svincolo
 * @param {*} giocatore
 * @returns {number} ritorna il valore di svincolo
 */

function calcolaCostoSvincolo(giocatore) {
  const quotazioneAttuale = giocatore.getDatiGiocatore.getQuotazione;

  const prezzoPagato = giocatore.getCostoDiAcquisto;

  return Math.ceil((prezzoPagato + quotazioneAttuale) / 2);
}

function aggiornaValoriNelBoxInfo() {
  const elementoCreditiResidui = document.getElementById("crediti-residui");
  let valoreCreditiResidui = parseInt(elementoCreditiResidui.innerText.trim());

  const elementoValoreSvincolati =
    document.getElementById("crediti-recuperati");
  let valoreSvincolati = 0;

  const elementoValoreTotale = document.getElementById("crediti-totale");
  let valoreTotale = parseInt(elementoValoreTotale.innerText.trim());

  const elementiDaSvincolare = vistaMercato.querySelectorAll(".in-svincolo");

  elementiDaSvincolare.forEach((cardAttuale) => {
    valoreSvincolati += parseInt(cardAttuale.dataset.valore);
  });

  valoreTotale = valoreCreditiResidui + valoreSvincolati;

  elementoValoreSvincolati.innerText = valoreSvincolati;
  elementoValoreTotale.innerText = valoreTotale;

  //inserisciBottoneInvia();
}

function gestisciOffertaSlotVuoto(e) {
  const cardVuota = e.target.closest(".card-vuota");
  if (!cardVuota) return;

  const ruoloDiRiferimento = cardVuota.dataset.ruolo;
  const slotCliccato = cardVuota.closest(".box-slot");

  // 1. SALVIAMO L'INTENZIONE NELL'INTERRUTTORE
  operazioneInCorso = {
    tipo: "ACQUISTO_LIBERO",
    ruoloCercato: ruoloDiRiferimento,
    slotDiRiferimento: slotCliccato,
  };

  // 2. CHIAMIAMO LA FUNZIONE PONTE
  if (apriPopupSvincolatiEsterno) {
    apriPopupSvincolatiEsterno(ruoloDiRiferimento);
  }
}

// import { stampaListaSvincolati } from "./vistaGiocatori.js";

function cbApriPopupSvincolati(ruolo) {
  const ruoloDiRiferimento = ruolo;

  // 1. SALVIAMO L'INTENZIONE (Importantissimo per sapere poi chi comprare)
  operazioneInCorso = {
    tipo: "PROMESSA",
    ruoloCercato: ruoloDiRiferimento,
    giocatoreDaTagliare: nomeGiocatore,
    slotDiRiferimento: slotCliccato,
  };

  // 2. CHIAMIAMO LA FUNZIONE PONTE (Passandogli solo il ruolo!)
  if (apriPopupSvincolatiEsterno) {
    apriPopupSvincolatiEsterno(ruoloDiRiferimento);
  }
}
