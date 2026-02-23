import {
  stampaLaMiaSquadra,
  gestisciFiltroSelezionaSquadraDaSelect,
} from "./laMiaSquadra.js";

import {
  stampaListaGiocatori,
  stampaListaAppartenenze,
  stampaListaSvincolati,
} from "./vistaGiocatori.js";

import {
  STATO_FILTRI,
  containerFiltri,
  creaFiltroSelezionaCampionato,
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
  creaFiltroQuotazioneMinEMax,
  creaFiltroFuoriLista,
  creaFiltroRuolo,
  creaFiltroRicercaGiocatore,
  creaFiltroTeam,
} from "./filtri.js";

import { caricaTuttiIDati } from "./caricamentoDati.js";

import { IMPOSTAZIONI } from "./impostazioni.js";

import { toCapitalize } from "./funzioniAgo.js";

let player = []; //lista giocatori
let acquisti = [];
let presidenti = []; //lista presidenti
const TAG_H2 = document.querySelector("h2");

containerFiltri.addEventListener("click", (evento) => {
  gestisciFiltroRuolo(evento);
  gestisciFiltroSelezionaCampionato(evento);
  gestisciFiltroTeam(evento);
  chiamaPaginaCliccata();
});

containerFiltri.addEventListener("change", (evento) => {
  gestisciFiltroFuoriLista(evento);
  gestisciFiltroQuotazioneMinEMax(evento);
  gestisciFiltroPresenzeMinime(evento);
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
    // 1. Chiediamo TUTTI i dati al nostro nuovo modulo
    const datiScaricati = await caricaTuttiIDati();

    // 2. Popoliamo le variabili globali di script.js
    presidenti = datiScaricati.presidenti;
    player = datiScaricati.giocatori;
    acquisti = datiScaricati.acquisti;

    inizializzaFiltri(player);

    popup.style.display = "none";
    console.log("✅ Dati caricati e pronti all'uso!");
  } catch (err) {
    console.error(err);
    TAG_H3.innerText = "Errore Caricamento Dati. Contattare l'admin. " + err;
  }
}

//

//STAMPE TABELLE
function stampaDashboard() {
  paginaDaRendereVisibile("dashboard");
  TAG_H2.textContent = "Fantacalcio Different League";
}

function stampaInfoSquadre() {
  paginaDaRendereVisibile("dati");
  if (TAG_H2.dataset.action != "apri-info-squadre") {
    //se viene da un'altra pagina possiamo azzerare i filtri
    azzeraFiltri();
  }
  TAG_H2.textContent = "INFO SQUADRE";
  TAG_H2.dataset.action = "apri-info-squadre";

  azzeraTabelle();

  if (containerFiltri.querySelectorAll(".box-filtro").length == 0) {
    creaFiltroSelezionaCampionato();
  }

  let tbody = "";
  const arrayTeamsFiltrati = applicaFiltroTeams(presidenti);
  //ordiniamo la lista da chi ha più crediti a chi ha meno crediti
  const squadreFiltrate = arrayTeamsFiltrati.sort((sqA, sqB) => {
    return sqB.getCreditiResidui - sqA.getCreditiResidui;
  });

  arrayTeamsFiltrati.forEach((teamsAttuale) => {
    const numeroPortieri = teamsAttuale.getContaP;
    const numeroDifensori = teamsAttuale.getContaD;
    const numeroCentrocampisti = teamsAttuale.getContaC;
    const numeroAttaccanti = teamsAttuale.getContaA;

    //scorri la lista dei teams
    //teamAttuales contiene la squadra del campionato filtrato
    //costruiamo la riga con tutte le squadre
    //per ogni squadra  salviamo una riga con i dati che ci servono
    //cioè Nome squadra | Nome presidente | crediti Residui
    tbody += `
        <tr>
        <td>${toCapitalize(teamsAttuale.getNomeRosa)}</td>
        <td>${toCapitalize(teamsAttuale.getNomePresidente)}</td>
        <td>${toCapitalize(teamsAttuale.getCampionatoDiAppartenenza)}</td>
        <td>${teamsAttuale.getCreditiResidui}</td>
        <td>${teamsAttuale.getValoreRosa}</td>
        <td>${teamsAttuale.getCreditiSpesi}</td>
        `;
    tbody +=
      numeroPortieri < IMPOSTAZIONI.REGOLE.MAX_P
        ? `<td class="ruoloMancante">${numeroPortieri}</td>`
        : `<td>${numeroPortieri}</td>`;
    tbody +=
      numeroDifensori < IMPOSTAZIONI.REGOLE.MAX_D
        ? `<td class="ruoloMancante">${numeroDifensori}</td>`
        : `<td>${numeroDifensori}</td>`;
    tbody +=
      numeroCentrocampisti < IMPOSTAZIONI.REGOLE.MAX_C
        ? `<td class="ruoloMancante">${numeroCentrocampisti}</td>`
        : `<td>${numeroCentrocampisti}</td>`;
    tbody +=
      numeroAttaccanti < IMPOSTAZIONI.REGOLE.MAX_A
        ? `<td class="ruoloMancante">${numeroAttaccanti}</td>`
        : `<td>${numeroAttaccanti}</td>`;
    tbody += `</tr>`;
  });

  //creare la tabella, thead, tbody
  const TAG_TABLE = document.createElement("table"); //creiamo l'elemento table
  const TAG_THEAD = document.createElement("thead"); //creiamo l'elemento thead
  const TAG_TBODY = document.createElement("tbody"); //creiamo l'elemento tbody
  TAG_TBODY.innerHTML = tbody;
  TAG_THEAD.innerHTML = `
        <tr class="intestazione-colonne">
          <th>Squadra</th>
          <th>Nome Presidente</th>
          <th>Lega di Appartenenza </th>
          <th>Crediti Residui</th>
          <th>Valore Rosa</th>
          <th>Crediti Spesi</th>
          <th>P</th>
          <th>D</th>
          <th>C</th>
          <th>A</th>
        </tr>`;

  containerTable.appendChild(TAG_TABLE); //inseriamo la tabella nel contenitore
  TAG_TABLE.append(TAG_THEAD, TAG_TBODY); //inseriamo thead e tbody nella tabella

  //console.log("Stampa lista crediti residui Terminata");
}

function stampaRose() {
  paginaDaRendereVisibile("dati");
  azzeraTabelle();
  if (TAG_H2.dataset.action != "apri-tutte-le-rose") {
    //se viene da un'altra pagina possiamo azzerare i filtri
    azzeraFiltri();
    creaFiltroRicercaGiocatore();
    creaFiltroSelezionaCampionato();
    creaFiltroRuolo();
    creaFiltroQuotazioneMinEMax();
    creaFiltroTeam(player); //
    creaFiltroFuoriLista();
  }

  TAG_H2.textContent = "LISTA SQUADRE";
  TAG_H2.dataset.action = "apri-tutte-le-rose";

  let arrayTeams = applicaFiltroTeams(presidenti); //preleviamo solo i team del campionato selezionato
  let giocatoriFiltrati = applicaFiltriGiocatori(player); //preleviamo tutti i giocatori filtrati
  const arrayNomiGiocatori = giocatoriFiltrati.map((gio) => gio.getNome);

  //scorriamo tutte le rose
  arrayTeams.forEach((rosaCorrente) => {
    let contaGiocatori = 0;
    let rigaHtml = "";
    //ad ogni rosa dobbiamo stampare tutti gli slot controllando che il giocatore della rosa sia incluso nei giocatori filtrati
    rosaCorrente.getTuttiGliSlot.forEach((giocatoreCorrente) => {
      if (giocatoreCorrente != null) {
        // se il giocatore ha come fuorilista true, significa che non gioca più in serie a lo flaggo con la classe fuorilista
        // questo permette di farlo diventare in grigio durante la visualizzazione

        if (
          arrayNomiGiocatori.includes(
            giocatoreCorrente.getDatiGiocatore.getNome,
          )
        ) {
          const classfuoriLista = giocatoreCorrente.getDatiGiocatore
            .getFuoriLista
            ? "class='fuorilista'"
            : "";
          const asterisco = classfuoriLista.length > 1 ? " (*)" : "";

          rigaHtml += `
              <tr ${classfuoriLista}>
                <td><span class="${giocatoreCorrente.getDatiGiocatore.getRuolo}">${giocatoreCorrente.getDatiGiocatore.getRuolo}</span></td>
                <td>${toCapitalize(
                  giocatoreCorrente.getDatiGiocatore.getNome,
                )}${asterisco}</td>                
                <td  class="squadra-di-appartenenza">`;
          if (
            giocatoreCorrente.getDatiGiocatore.getSquadraDiAppartenenza == ""
          ) {
            rigaHtml += `</td>`;
          } else {
            rigaHtml += `<img src="Assets/image/loghi_team_serie_A/${giocatoreCorrente.getDatiGiocatore.getSquadraDiAppartenenza.toLowerCase()}.png"/>
                ${toCapitalize(
                  giocatoreCorrente.getDatiGiocatore.getSquadraDiAppartenenza,
                )}</td>`;
          }

          rigaHtml += `
                <td class="cella-quotazione"><img src="Assets/icone/soldi.png"/>${giocatoreCorrente.getDatiGiocatore.getQuotazione}</td>
                <td>${giocatoreCorrente.getCostoDiAcquisto}</td>
                <td>${Math.ceil(
                  (giocatoreCorrente.getCostoDiAcquisto +
                    giocatoreCorrente.getDatiGiocatore.getQuotazione) /
                    2,
                )}</td>
              </tr>`;
          contaGiocatori++;
        }
      }
    });
    if (contaGiocatori > 0) {
      //<div class="campo-campionato-di-appartenenza">${toCapitalize(rosaCorrente.getCampionatoDiAppartenenza)}</div>
      //CREAZIONI ELEMENTI TABELLA
      //per ogni presifente con almeno un giocatore creiamo una tabella
      const TAG_TABLE = document.createElement("table"); //creazione tabella
      const TAG_TBODY = document.createElement("tbody"); //creazione tbody
      const TAG_THEAD = document.createElement("thead"); //creazione thead
      const TAG_TFOOT = document.createElement("tfoot"); //creazione thead
      TAG_THEAD.innerHTML += `<tr>
        <th colspan="6"> 
          <section class="box-thead">
            <div id="contenitore-nome">
              <div class="campo-nome-squadra">${toCapitalize(rosaCorrente.getNomeRosa)}</div>
              <div class="campo-nome-presidente">${toCapitalize(rosaCorrente.getNomePresidente)}</div>
            </div>
            <div class="campo-campionato-di-appartenenza">
              <img class="logo_lega" src="Assets/image/logo_leghe/Logo_${rosaCorrente.getCampionatoDiAppartenenza.toLowerCase().replace(" ", "_")}.png">
            </div>
          </section> 
        </th>
      </tr>
          <tr class="intestazione-colonne">
      <th>Ruolo</th><th>Nome</th><th>Squadra</th><th>Qt</th><th>Costo Acq.</th><th>Costo Svi.</th>
    </tr>`;
      TAG_TFOOT.innerHTML = `<tr>
      <td colspan="6">Crediti residui : ${rosaCorrente.getCreditiResidui}</td>
    </tr>
    <tr>
      <td colspan="6"> Giocatori in rosa:${rosaCorrente.contaSlotPieni()}/${
        IMPOSTAZIONI.REGOLE.MAX_NUMERO_GIOCATORI_PER_SQUADRA
      } </td></tr>
      <tr><td colspan="6"> Crediti spesi : ${
        rosaCorrente.getCreditiSpesi
      }</td></tr>
      <tr><td colspan="6"> ValoreRosa : ${rosaCorrente.getValoreRosa}</td></tr>
      <tr><td colspan="6"> Giocatori Caricati : ${contaGiocatori}</td></tr>
    `;
      //INSERIMENTO TABELLA
      TAG_TBODY.innerHTML = rigaHtml;
      TAG_TABLE.append(TAG_THEAD, TAG_TBODY, TAG_TFOOT);
      containerTable.appendChild(TAG_TABLE);
    }

    //console.log("Stampa LISTA ROSE completata.");
  });
}

function stampaListaGiocatoriDaSvincolare() {
  paginaDaRendereVisibile("dati");
  azzeraTabelle(); //azzeriamo tutte le tabelle precedenti
  creaFiltroRosa(presidenti);
  TAG_H2.dataset.action = "apri-da-svincolare";
  TAG_H2.textContent = "GIOCATORI FUORI LISTA";

  let rigaHTML = ""; //azzeriamo la riga che andremo ad inserire successivamente nel body
  let contaGiocatori = 0;
  presidenti.forEach((teamCorrente) => {
    if (
      teamCorrente == STATO_FILTRI.rosaPresidente ||
      STATO_FILTRI.rosaPresidente == "Tutte le rose"
    ) {
      //scorriamo tutte le squadre del campionato
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
    }
  });

  //creiamo una tabella
  const TAG_TABLE = document.createElement("table");
  const TAG_THEAD = document.createElement("thead");
  const TAG_TBODY = document.createElement("tbody");

  //inseriamo l'intestazione della tabella
  TAG_THEAD.innerHTML = `
      <tr  class="intestazione-colonne">
        <th> Squadra </th>
        <th> Ruolo </th>
        <th> Nome  </th>
        <th> Quotazione </th>
        <th> Costo Pagato </th>
        <th> Costo di svincolo </th>    
    </tr>`;

  TAG_TBODY.innerHTML = rigaHTML;
  TAG_TABLE.append(TAG_THEAD, TAG_TBODY);
  containerTable.appendChild(TAG_TABLE);
}

function azzeraTabelle() {
  console.log("function azzeraTabelle()");
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

  console.log(chiamante);
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
        TAG_H2, // 1
        paginaDaRendereVisibile, // 2
        azzeraFiltri, // 3
        () => creaFiltriPaginaGiocatoriSeMancante(player), // 4
        azzeraTabelle, // 5
        () => applicaFiltriGiocatori(player), // 6
        acquisti, // 7
        containerTable,
      );
      break;
    case "apri-mercato":
      stampaListaSvincolati(
        TAG_H2, // 1
        paginaDaRendereVisibile, // 2
        azzeraFiltri, // 3
        () => creaFiltriPaginaGiocatoriSeMancante(player), // 4
        azzeraTabelle, // 5
        () => applicaFiltriGiocatori(player), // 6
        containerTable,
      );
      break;
    case "apri-appartenenze":
      stampaListaAppartenenze(
        TAG_H2, // 1
        paginaDaRendereVisibile, // 2
        azzeraFiltri, // 3
        () => creaFiltriPaginaGiocatoriSeMancante(player), // 4
        azzeraTabelle, // 5
        () => applicaFiltriGiocatori(player), // 6
        containerTable,
      );
      break;
    case "apri-svincolati":
      stampaListaSvincolati(
        TAG_H2, // 1
        paginaDaRendereVisibile, // 2
        azzeraFiltri, // 3
        () => creaFiltriPaginaGiocatoriSeMancante(player), // 4
        azzeraTabelle, // 5
        () => applicaFiltriGiocatori(player), // 6
        containerTable,
      );
      break;
    case "apri-da-svincolare":
      stampaListaGiocatoriDaSvincolare();
      break;
    default:
      stampaDashboard();
      break;
  }
}

/*
@param paginaDaRendereVisibile
*/
function paginaDaRendereVisibile(pagina = "") {
  const PAGINE = document.querySelectorAll(".pagina"); //otteniamo tutti gli elementi pagina

  if (pagina == "dashboard") {
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
