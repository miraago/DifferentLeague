// ... altri import ...
import { controllaAccesso, UTENTELOGGATO, logout } from "./gestioneUtente.js";
import { stampaInfoSquadre, stampaRose } from "./squadre.js";
import {
  stampaLaMiaSquadra,
  gestisciFiltroSelezionaSquadraDaSelect,
} from "./laMiaSquadra.js";

import { inizializzaScambi, scambiaGiocatore } from "./vistaScambi.js";

import { mercatoSvincola, inizializzaMercato } from "./vistaMercato.js";

import {
  stampaListaGiocatori,
  stampaListaAppartenenze,
  stampaListaSvincolati,
} from "./vistaGiocatori.js";

import {
  containerFiltri,
  gestisciFiltroSelezionaCampionato,
  applicaFiltriGiocatori,
  applicaFiltroTeams,
  inizializzaFiltri,
  creaFiltroRosa,
  gestisciFiltroRosa,
  gestisciFiltroPresenzeMinime,
  gestisciFiltroTeam,
  gestisciFiltroQuotazioneMinEMax,
  gestisciFiltroRuolo,
  gestisciFiltroFuoriLista,
  azzeraFiltri,
  creaFiltriPaginaGiocatoriSeMancante,
  creaFiltriPaginaSvincolatiSeMancante,
  gestisciFiltroGoalMinimi,
  gestisciFiltroAssistMinimi,
} from "./filtri.js";

import { caricaTuttiIDati } from "./caricamentoDati.js";

import { toCapitalize } from "./funzioniAgo.js";
import { gestisciClickNomeGiocatore } from "./popupStatisticheGiocatori.js";

//Ogni click nel main viene catturato e se contiene una riga con un dataset.nome di un giocatore,
// //compare un popup delle statistiche del giocatore
document
  .querySelector("main")
  .addEventListener("click", gestisciClickNomeGiocatore);

export let player = []; //lista giocatori
export let acquisti = [];
export let presidenti = []; //lista presidenti

const TAG_H2 = document.querySelector("h2");

containerFiltri.addEventListener("click", (evento) => {
  if (evento.target.tagName != "SELECT") {
    gestisciFiltroRuolo(evento);
    gestisciFiltroSelezionaCampionato(evento);
    gestisciFiltroTeam(evento);
    chiamaPaginaCliccata();
  }
});

containerFiltri.addEventListener("change", (evento) => {
  gestisciFiltroFuoriLista(evento);
  gestisciFiltroQuotazioneMinEMax(evento);
  gestisciFiltroPresenzeMinime(evento);
  gestisciFiltroGoalMinimi(evento);
  gestisciFiltroAssistMinimi(evento);
  gestisciFiltroRosa(evento);
  chiamaPaginaCliccata();
});

containerFiltri.addEventListener("input", chiamaPaginaCliccata);

const tagVistaLaMiaSquadra = document.getElementById("vista-la-mia-squadra");
tagVistaLaMiaSquadra.addEventListener("change", (e) => {
  gestisciFiltroSelezionaSquadraDaSelect(e, chiamaPaginaCliccata);
});

const containerMenu = document.getElementById("contenitore-menu");
containerMenu.addEventListener("click", chiamaPaginaCliccata);

const containerTable = document.getElementById("container-table");
containerTable.addEventListener("click", (e) => ordinaTabella(e));

//AVVIO PROGRAMMA
logicaPrincipale();

async function logicaPrincipale() {
  console.log("Avvio Logica Principale...");
  const popup = document.getElementById("popup-caricamento");
  const TAG_H3 = popup.querySelector("h3");
  popup.style.display = "flex";

  try {
    // 1. Carichiamo i dati
    const datiScaricati = await caricaTuttiIDati();
    presidenti = datiScaricati.presidenti;
    player = datiScaricati.giocatori;
    acquisti = datiScaricati.acquisti;

    inizializzaFiltri(player);

    popup.style.display = "none";
    console.log("✅ Dati caricati!");

    // 2. CONTROLLO LOGIN
    // Passiamo una "callback" (una funzione) che verrà eseguita SOLO dopo che l'utente ha cliccato "Entra"
    const utenteGiaLoggato = controllaAccesso(presidenti, () => {
      // Questa parte viene eseguita se l'utente fa il login ORA
      console.log("Login effettuato ora.");
      avviaApplicazione();
    });

    if (utenteGiaLoggato) {
      // Questa parte viene eseguita se l'utente era GIÀ loggato da ieri
      avviaApplicazione();
    }
  } catch (err) {
    console.error(err);
    TAG_H3.innerText = "Errore: " + err;
  }
}

// Funzione che fa partire la prima schermata
function avviaApplicazione() {
  // Qui puoi decidere: mostriamo la dashboard o direttamente la "Mia Squadra"?
  console.log(
    "Benvenuto presidente di: " + UTENTELOGGATO.nomeSquadraUtenteLoggato,
  );

  // Esempio: Se vuoi aprire direttamente la TUA squadra
  // Possiamo forzare l'apertura della pagina "la mia squadra"
  // document.querySelector("li[data-action='apri-la-mia-squadra']").click();

  // Oppure standard dashboard:
  //ricaviamo il nome del presidente
  let nomePresidente = "";
  presidenti.forEach((presidenteCorrente) => {
    if (
      presidenteCorrente.getNomeRosa == UTENTELOGGATO.nomeSquadraUtenteLoggato
    ) {
      nomePresidente = presidenteCorrente.getNomePresidente;
      return;
    }
  });
  document.getElementById("nome-presidente").textContent =
    UTENTELOGGATO.nomeSquadraUtenteLoggato + " di " + nomePresidente;
  stampaDashboard();
  inizializzaScambi(player, presidenti);
  inizializzaMercato(player, presidenti, (ruoloCercato) => {
    // 1. Troviamo la TUA VERA pagina che contiene le tabelle (data-pagina="dati")
    const vistaDati = document.querySelector('.pagina[data-pagina="dati"]');

    if (vistaDati) {
      // La trasformiamo nel popup!
      vistaDati.classList.add("modal-attivo");
      vistaDati.style.display = "block"; // La forziamo ad apparire
      containerFiltri.style.display = "flex"; // Riaccendiamo anche i filtri
    }

    // 2. Chiamiamo il "mostro" a 8 parametri usando le tue variabili GLOBALI
    stampaListaSvincolati(
      () => {}, // MAGIA: passiamo una funzione vuota così non distrugge il mercato!
      azzeraFiltri,
      () => creaFiltriPaginaGiocatoriSeMancante(player),
      azzeraTabelle,
      () => applicaFiltriGiocatori(player),
      ruoloCercato, // Il parametro che ci manda vistaMercato.js
    );
  });
}

//

//STAMPE TABELLE
function stampaDashboard() {
  paginaDaRendereVisibile("dashboard");
  TAG_H2.textContent = "Fantacalcio Different League";
}

function stampaListaGiocatoriDaSvincolare() {
  paginaDaRendereVisibile("dati");
  azzeraTabelle(); //azzeriamo tutte le tabelle precedenti
  creaFiltroRosa(presidenti);

  TAG_H2.dataset.action = "apri-da-svincolare";
  TAG_H2.textContent = "GIOCATORI FUORI LISTA";

  let rigaHTML = ""; //azzeriamo la riga che andremo ad inserire successivamente nel body
  let contaGiocatori = 0;
  // const arrayFiltrato = STATO_FILTRI.rosaPresidente== "Tutte le rose" ? presidenti : presidenti.filter(presidenteCorrente => presidenteCorrente.getNomeRosa == STATO_FILTRI.rosaPresidente);
  const arrayFiltrato = applicaFiltroTeams(presidenti);

  arrayFiltrato.forEach((teamCorrente) => {
    //scorriamo tutte le squadre del campionato o quella scelta
    teamCorrente.getTuttiGliSlot.forEach((playerCorrente) => {
      //scorriamo tutti i giocatori e individuiamo i fuori lista della squadra corrente
      if (playerCorrente.getDatiGiocatore.getFuoriLista) {
        contaGiocatori++;
        rigaHTML += `
      <tr>
        <td> ${teamCorrente.getNomeRosa} </td>
        <td> ${playerCorrente.getDatiGiocatore.getRuolo}  </td>
        <td> ${toCapitalize(playerCorrente.getDatiGiocatore.getNome)}</td>
        <td class="cella-quotazione"><img src="Assets/icone/soldi.png"/> ${playerCorrente.getDatiGiocatore.getQuotazione} </td> 
        <td> ${playerCorrente.getCostoDiAcquisto} </td>
        
        <td> ${Math.ceil(
          (playerCorrente.getCostoDiAcquisto +
            playerCorrente.getDatiGiocatore.getQuotazione) /
            2,
        )} </td>
      </tr>
      `;
      }
    });
  });

  //creiamo una tabella
  const TAG_TABLE = document.createElement("table");
  const TAG_THEAD = document.createElement("thead");
  const TAG_TBODY = document.createElement("tbody");

  //inseriamo l'intestazione della tabella
  TAG_THEAD.innerHTML = `
      <tr  class="intestazione-colonne">        
        <th title="Ruolo"> R </th>
        <th title="Nome Giocatore"> Nome  </th>
        <th title="Squadra"> Squadra </th>
        <th title="Quotazione Attuale"> Qt </th>
        <th title="Costo Pagato"> C.P. </th>
        <th title="Costo Svincolo"> C.S. </th>    
    </tr>`;

  TAG_TBODY.innerHTML = rigaHTML;
  TAG_TABLE.append(TAG_THEAD, TAG_TBODY);
  containerTable.appendChild(TAG_TABLE);
}

export function azzeraTabelle() {
  containerTable.innerHTML = "";
}

//ORDINAMENTO TABELLE
function ordinaTabella(evento) {
  console.log("function ordinaTabella(evento)");
  const th = evento.target.closest("th");

  // Se il click non è avvenuto su un'intestazione, interrompi
  if (!th) return;

  // 2. Trova la tabella e il corpo (tbody)
  const table = th.closest("table");
  const tbody = table.tBodies[0];
  const colIndex = th.cellIndex; // Indice della colonna (0, 1, 2...)

  // 3. Determina la direzione (asc/desc)
  const currentOrder = th.getAttribute("data-order") === "asc" ? "desc" : "asc";

  // Reset degli attributi su tutti i TH della tabella (opzionale, per pulizia)
  table
    .querySelectorAll("th")
    .forEach((header) => header.removeAttribute("data-order"));
  th.setAttribute("data-order", currentOrder);

  // 4. Logica di ordinamento
  const rows = Array.from(tbody.rows);

  rows.sort((rowA, rowB) => {
    const valA = rowA.cells[colIndex].textContent.trim();
    const valB = rowB.cells[colIndex].textContent.trim();

    // Ordinamento naturale (gestisce stringhe e numeri correttamente)
    return currentOrder === "asc"
      ? valA.localeCompare(valB, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      : valB.localeCompare(valA, undefined, {
          numeric: true,
          sensitivity: "base",
        });
  });

  // 5. Aggiorna il DOM con le righe ordinate
  tbody.append(...rows);
}

function chiamaPaginaCliccata(evento) {
  let chiamante;

  if (evento) {
    const controllo = evento.target.closest("li");
    if (controllo) {
      chiamante = controllo.dataset.action; //se la pagina è stata chiamata da un click del menu vedi chi lo ha chiamato)
    } else {
      // se l'evento non proviene dal menu (es. input di ricerca), mantieni la pagina corrente
      chiamante = TAG_H2.dataset.action;
    }
  } else {
    chiamante = TAG_H2.dataset.action; //altrimenti vedi su che pagina stavi
  }

  switch (chiamante) {
    case "apri-info-squadre":
      stampaInfoSquadre();
      break;
    case "apri-squadre":
      stampaInfoSquadre();
      break;
    case "apri-la-mia-squadra":
      stampaLaMiaSquadra(
        presidenti,
        tagVistaLaMiaSquadra,
        TAG_H2,
        azzeraFiltri,
        paginaDaRendereVisibile,
        containerTable,
      );
      break;
    case "apri-tutte-le-rose":
      stampaRose();
      break;

    case "apri-lista-giocatori":
      stampaListaGiocatori(
        paginaDaRendereVisibile, // 2
        azzeraFiltri, // 3
        () => creaFiltriPaginaGiocatoriSeMancante(player), // 4
        azzeraTabelle, // 5
        () => applicaFiltriGiocatori(player), // 6
      );
      break;
    case "apri-lista-svincolati":
      stampaListaSvincolati(
        paginaDaRendereVisibile, // 2
        azzeraFiltri, // 3
        () => creaFiltriPaginaSvincolatiSeMancante(player), // 4
        azzeraTabelle, // 5
        () => applicaFiltriGiocatori(player), // 6
      );
      break;
    case "apri-mercato-svincola":
      mercatoSvincola();
      break;
    case "apri-scambi-classici":
      scambiaGiocatore();
      break;
    case "apri-appartenenze":
      stampaListaAppartenenze(
        paginaDaRendereVisibile, // 2
        azzeraFiltri, // 3
        () => creaFiltriPaginaGiocatoriSeMancante(player), // 4
        azzeraTabelle, // 5
        () => applicaFiltriGiocatori(player), // 6
      );
      break;

    case "apri-svincolati":
      stampaListaSvincolati(
        paginaDaRendereVisibile, // 2
        azzeraFiltri, // 3
        () => creaFiltriPaginaSvincolatiSeMancante(player), // 4
        azzeraTabelle, // 5
        () => applicaFiltriGiocatori(player), // 6
      );
      break;
    case "apri-da-svincolare":
      stampaListaGiocatoriDaSvincolare();
      break;
    case "apri-login":
      localStorage.removeItem("fanta_squadra_corrente");
      location.reload();
      break;
    default:
      stampaDashboard();
      break;
  }
}

/*
@param paginaDaRendereVisibile
*/
export function paginaDaRendereVisibile(pagina = "") {
  const PAGINE = document.querySelectorAll(".pagina"); //otteniamo tutti gli elementi pagina

  //i filtri vanno solo se si stampa i giocatori
  if (pagina == "dashboard" || pagina == "mercato") {
    containerFiltri.style.display = "none";
  } else {
    containerFiltri.style.display = "flex";
  }

  if (pagina != "" && PAGINE) {
    PAGINE.forEach((paginacorrente) => {
      if (paginacorrente.dataset.pagina == pagina) {
        paginacorrente.style.display = "flex";
      } else {
        paginacorrente.style.display = "none";
      }
    });
  }
}
