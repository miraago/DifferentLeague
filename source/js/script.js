import {
  stampaLaMiaSquadra,
  gestisciFiltroSelezionaSquadraDaSelect,
} from "./laMiaSquadra.js";

import { 
  stampaListaGiocatori,
  stampaListaAppartenenze,
  stampaListaSvincolati,
 } from "./vistaGiocatori.js";

import { caricaTuttiIDati } from "./caricamentoDati.js";

import { IMPOSTAZIONI } from "./impostazioni.js";

import { toCapitalize } from "./funzioniAgo.js";

let player = []; //lista giocatori
let acquisti = [];
let presidenti = []; //lista presidenti
const TAG_H2 = document.querySelector("h2");

//GESTIONE FILTRI
const STATO_FILTRI = {
  qt:{ //filtro quotazioni 
    min:1, //quotazione minima
    max:1, //quotazione massima
    minSelezionato:1, //quotazione minima selezionata nel filtro
    maxSelezionato:1  //quotazione massima selezionata nel filtro    
  },
  presenze:{ //filtro presenze
    min:0,
    max:0,
    minSelezionato:0
  },
  ruolo : [], //filtro ruolo
  lega : [], //filtro lega, tiene traccia del campionato cliccato
  squadraSA:[], //filtro squadra serie A selezionata
  caricaFuoriLista:false, //  tiene traccia se mostrare o meno i fuori lista. se è true significa che è selezionato tutti
  rosaPresidente:"" // tiene traccia del presidente selezionato
};

const containerFiltri = document.getElementById("container-filtri");

containerFiltri.addEventListener("click", (evento) => {
  gestisciFiltroRuolo(evento);
  gestisciFiltroSelezionaCampionato(evento);
  gestisciFiltroTeam(evento);
});

containerFiltri.addEventListener("change", (evento) => {
  gestisciFiltroFuoriLista(evento);
  gestisciFiltroQuotazioneMinEMax(evento);
  gestisciFiltroPresenzeMinime(evento);
  gestisciFiltroRosa(evento);
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

    inizializzaFiltri();

    popup.style.display = "none";
    console.log("✅ Dati caricati e pronti all'uso!");
  } catch (err) {
    console.error(err);
    TAG_H3.innerText = "Errore Caricamento Dati. Contattare l'admin. " + err;
  }
}

//

function inizializzaFiltri() {
  //inizializzazione filtro quotazione min e max

  player.forEach((playerCorrente) => {
    const quotazione = playerCorrente.getQuotazione;//quotazione del giocatore corrente
    const presenze = playerCorrente.getPresenze;//presenze del giocatore corrente

    if (quotazione > STATO_FILTRI.qt.max) {
      STATO_FILTRI.qt.max = quotazione;
    }
    if (STATO_FILTRI.presenze.max < presenze) {
      STATO_FILTRI.presenze.max = presenze;  //presenze massime del giocatore
    }
  });



  STATO_FILTRI.qt.maxSelezionato = STATO_FILTRI.qt.max;

}

//STAMPE TABELLE
function stampaDashboard() {
  paginaDaRendereVisibile("dashboard");
  TAG_H2.textContent = "Fantacalcio Different League";
}

function stampaInfoSquadre() {
  console.log("function stampaInfoSquadre");
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
  const arrayTeamsFiltrati = applicaFiltroTeams();
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
  // console.log("Stampa LISTA ROSE in corso...");
  paginaDaRendereVisibile("dati");
  console.log("function stampaRose()");

  if (TAG_H2.dataset.action != "apri-tutte-le-rose") {
    //se viene da un'altra pagina possiamo azzerare i filtri
    azzeraFiltri();
  }

  TAG_H2.textContent = "LISTA SQUADRE";
  TAG_H2.dataset.action = "apri-tutte-le-rose";

  if (containerFiltri.querySelectorAll(".box-filtro").length == 0) {
    azzeraFiltri();
    creaFiltroRicercaGiocatore();
    creaFiltroSelezionaCampionato();
    creaFiltroRuolo();
    creaFiltroQuotazioneMinEMax();
    creaFiltroTeam();
    creaFiltroFuoriLista();
  }
  azzeraTabelle();
  let arrayTeams = applicaFiltroTeams(); //preleviamo solo i team del campionato selezionato
  let giocatoriFiltrati = applicaFiltriGiocatori(); //preleviamo tutti i giocatori filtrati
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
  console.log("function stampaListaGiocatoriDaSvincolare()");
  paginaDaRendereVisibile("dati");
  azzeraTabelle(); //azzeriamo tutte le tabelle precedenti
  creaFiltroRosa();
  TAG_H2.dataset.action = "apri-da-svincolare";
  TAG_H2.textContent = "GIOCATORI FUORI LISTA";

  let rigaHTML = ""; //azzeriamo la riga che andremo ad inserire successivamente nel body
  let contaGiocatori = 0;
  presidenti.forEach((teamCorrente) => {
    if (teamCorrente == STATO_FILTRI.rosaPresidente || STATO_FILTRI.rosaPresidente == "Tutte le rose") {
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

function creaFiltriPaginaGiocatoriSeMancante() {
  if (containerFiltri.querySelectorAll(".box-filtro").length == 0) {
    creaFiltroRicercaGiocatore();
    creaFiltroRuolo();
    creaFiltroQuotazioneMinEMax();
    creaFiltroTeam();
    creaFiltroPresenzeMinime();
    creaFiltroFuoriLista();
  }
}


//FINE STAMPA TABELLA

//FILTRI----------------------------------------------------------------------------------------
//---------------------------------- FILTRI ------------------------------------------------

function creaFiltroSelezionaCampionato() {
  //console.log("creazione filtro seleziona campionato in corso...");
  console.log("function creaFiltroSelezionaCampionato()");

  containerFiltri.insertAdjacentHTML(
    "beforeend",
    `<section class="box-filtro">
          <label>Lega</label>
          <div><img name="${IMPOSTAZIONI.CAMPIONATI.GIR1}"id="logo-premier" class="logo-campionato" src="./Assets/image/logo_leghe/Logo_${IMPOSTAZIONI.CAMPIONATI.GIR1.toLowerCase().replace(" ", "_")}.png" title="Premier League" alt="Premier League" ></div>
          <div><img name="${IMPOSTAZIONI.CAMPIONATI.GIR2}"id="logo-liga"class="logo-campionato" src="./Assets/image/logo_leghe/Logo_${IMPOSTAZIONI.CAMPIONATI.GIR2.toLowerCase().replace(" ", "_")}.png" title="Liga Spagnola" alt="Liga Spagnola"></div>
          <div><img name="${IMPOSTAZIONI.CAMPIONATI.GIR3}"id="logo-bundesliga"class="logo-campionato" src="./Assets/image/logo_leghe/Logo_${IMPOSTAZIONI.CAMPIONATI.GIR3.toLowerCase().replace(" ", "_")}.png" title="Bundesliga" alt="Bundesliga"></div>
          <div><img name="${IMPOSTAZIONI.CAMPIONATI.GIR4}"id="logo-ligue1"class="logo-campionato" src="./Assets/image/logo_leghe/Logo_${IMPOSTAZIONI.CAMPIONATI.GIR4.toLowerCase().replace(" ", "_")}.png" title="Ligue 1" alt="Ligue 1"></div>
          <div><img name="${IMPOSTAZIONI.CAMPIONATI.GIR5}"id="logo-seriea"class="logo-campionato" src="./Assets/image/logo_leghe/Logo_${IMPOSTAZIONI.CAMPIONATI.GIR5.toLowerCase().replace(" ", "_")}.png" title="Serie A" alt="Serie A"></div>
    </section>`,
  );

  //console.log("creazione filtro seleziona campionato completata.");
}
function gestisciFiltroSelezionaCampionato(evento) {
  console.log("function gestisciFiltroSelezionaCampionato(evento)");
  const elemento_cliccato = evento.target;

  if (elemento_cliccato.className.includes("logo-campionato")) {
    if (STATO_FILTRI.lega.includes(elemento_cliccato.name)) {
      //se il campionato è già incluso nel filtro, lo rimuoviamo
      const indice = STATO_FILTRI.lega.indexOf(elemento_cliccato.name); //troviamo l'indice del campionato da rimuovere
      STATO_FILTRI.lega.splice(indice, 1); //rimuoviamo il campionato dal filtro
      elemento_cliccato.classList.remove("selected");
    } else {
      //altrimenti lo aggiungiamo al filtro
      STATO_FILTRI.lega.push(elemento_cliccato.name); //aggiungiamo il campionato al filtro
      elemento_cliccato.classList.add("selected"); //aggiungiamo la classe selected per evidenziare il filtro selezionato
    }
  }
  chiamaPaginaCliccata();
}

function creaFiltroRuolo() {

  containerFiltri.insertAdjacentHTML(
    "beforeend",
    `  
    <section class="box-filtro" id="filtro-ruolo">
    <label>Ruolo</label>
      <div data-tipo-ruolo="P" class="ruolo ${STATO_FILTRI.ruolo.includes("P") ? "selected" : ""}">P</div>
      <div data-tipo-ruolo="D" class="ruolo ${STATO_FILTRI.ruolo.includes("D") ? "selected" : ""}">D</div>
      <div data-tipo-ruolo="C" class="ruolo ${STATO_FILTRI.ruolo.includes("C") ? "selected" : ""}">C</div>
      <div data-tipo-ruolo="A" class="ruolo ${STATO_FILTRI.ruolo.includes("A") ? "selected" : ""}">A</div>
    </section>
  `,
  );
}
function gestisciFiltroRuolo(evento) {
  console.log("function gestisciFiltroRuolo(evento)");
  //capiamo da dove viene il click e gestiamo solo se proviene da un elemento con classe ruolo
  const elemento_cliccato = evento.target;

  if (elemento_cliccato.dataset.tipoRuolo != undefined) {
    const ruolo_cliccato = elemento_cliccato.dataset.tipoRuolo; //ci memorizziamo il ruolo

    if (STATO_FILTRI.ruolo.includes(ruolo_cliccato)) {
      //se il ruolo è già incluso nel filtro lo rimuoviamo
      const indice = STATO_FILTRI.ruolo.indexOf(ruolo_cliccato);
      STATO_FILTRI.ruolo.splice(indice, 1);
    } else {
      STATO_FILTRI.ruolo.push(ruolo_cliccato);
    } // se filtroruolo è true fallo diventare false, altrimenti essendo falso lo fai diventare true

    if (
      elemento_cliccato.classList.contains("selected")
    ) // se l'elemento cliccato ha già la classe selected la rimuovi altrimenti la inserisci
    {
      elemento_cliccato.classList.remove("selected");
    } else {
      elemento_cliccato.classList.add("selected");
    }

    chiamaPaginaCliccata();
  }
}

function creaFiltroFuoriLista() {
  console.log("function creaFiltroFuoriLista()");
  containerFiltri.insertAdjacentHTML(
    "beforeend",
    `
        <section class="box-filtro" id="container-filtro-fuoriLista"> 
          <label>Fuori Lista</label>
          <input type="radio" name="carica-FuoriLista" value="si"  ${
            STATO_FILTRI.caricaFuoriLista ? "checked" : ""
          }> si
          <input type="radio" name="carica-FuoriLista" value="no"  ${
            STATO_FILTRI.caricaFuoriLista ? "" : "checked"
          }> no 
        </section>
        `,
  );
  // filtro fuori lista aggiunto senza ricreare il contenuto esistente
}

function gestisciFiltroFuoriLista(evento) {
  console.log("function gestisciFiltroFuoriLista(evento)");
  //capiamo da dove viene il click e gestiamo solo se proviene da un elemento proveniente dal radiobutton con nome carica-FuoriLista

  if (evento.target.name == "carica-FuoriLista") {
    // se e si controlliamo il valore se e si o se e no, e ne cambiamo lo stato
    if (evento.target.value == "si") {
      STATO_FILTRI.caricaFuoriLista = true;
    } else {
      STATO_FILTRI.caricaFuoriLista = false;
    }
    chiamaPaginaCliccata();
  }
}

function azzeraTabelle() {
  console.log("function azzeraTabelle()");
  containerTable.innerHTML = "";
}

function azzeraFiltri() {
  console.log("function azzeraFiltri()");
  STATO_FILTRI.ruolo = []; //azzero i filtri selezionati
  STATO_FILTRI.qt.maxSelezionato = STATO_FILTRI.qt.max;
  STATO_FILTRI.qt.minSelezionato = STATO_FILTRI.qt.min;
  STATO_FILTRI.caricaFuoriLista = false;
  STATO_FILTRI.lega = [];
  STATO_FILTRI.squadraSA = [];
  STATO_FILTRI.presenze.minSelezionato = 0;
  containerFiltri.innerHTML = "";
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
  console.log("function chiamaPaginaCliccata(evento)");
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
        creaFiltriPaginaGiocatoriSeMancante, // 4
        azzeraTabelle, // 5
        applicaFiltriGiocatori, // 6
        acquisti, // 7
        containerTable, // 8
      );
      break;
    case "apri-mercato":
      stampaListaSvincolati();
      break;
    case "apri-appartenenze":
      stampaListaAppartenenze(
        TAG_H2, // 1
        paginaDaRendereVisibile, // 2
        azzeraFiltri, // 3
        creaFiltriPaginaGiocatoriSeMancante, // 4
        azzeraTabelle, // 5
        applicaFiltriGiocatori, // 6
        containerTable, // 7
      );
      break;
    case "apri-svincolati":
      stampaListaSvincolati(
        TAG_H2, // 1
        paginaDaRendereVisibile, // 2
        azzeraFiltri, // 3
        creaFiltriPaginaGiocatoriSeMancante, // 4
        azzeraTabelle, // 5
        applicaFiltriGiocatori, // 6
        containerTable // 7
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

function ruoliFiltrati() {
  console.log("function ruoliFiltrati()");
  if (STATO_FILTRI.ruolo.length == 0) {
    return ["P", "D", "C", "A"];
  }
  return STATO_FILTRI.ruolo;
}

function creaFiltroTeam() {
  console.log("function creaFiltroTeam()");
  let tuttiTeam = new Set();

  player.forEach((giocatoreCorrente) => {
    if (giocatoreCorrente.getSquadraDiAppartenenza != "") {
      tuttiTeam.add(giocatoreCorrente.getSquadraDiAppartenenza.toLowerCase());
    }
  });

  let teamsOrdinati = [...tuttiTeam].sort((a, b) => a.localeCompare(b));

  let rigadicostruzionefiltrisquadre = `<section class='box-filtro' id="id-box-team"> <label> Squadra</label>`;
  for (let i = 0; i < teamsOrdinati.length; i++) {
    rigadicostruzionefiltrisquadre += `<div class="box-team" name="${teamsOrdinati[i]}">
      <img src="Assets/image/loghi_team_serie_A/${teamsOrdinati[i]}.png" 
      alt="${teamsOrdinati[i]}" 
      name="${teamsOrdinati[i]}"/>
      <p name="${teamsOrdinati[i]}">${teamsOrdinati[i].slice(0, 3).toUpperCase()}</p>
    </div>`;
  }
  rigadicostruzionefiltrisquadre += "</section>";

  containerFiltri.insertAdjacentHTML(
    "beforeend",
    rigadicostruzionefiltrisquadre,
  );
}
function gestisciFiltroTeam(evento) {
  console.log("function gestisciFiltroTeam(evento)");
  const elemento_cliccato = evento.target;

  const nodo_parente = elemento_cliccato.parentElement;

  if (nodo_parente.className.includes("box-team")) {
    {
      const nomeSquadra = nodo_parente.getAttribute("name");

      if (STATO_FILTRI.squadraSA.includes(nomeSquadra)) {
        const indice = STATO_FILTRI.squadraSA.indexOf(nomeSquadra);
        STATO_FILTRI.squadraSA.splice(indice, 1);
        nodo_parente.classList.remove("selected");
      } else {
        STATO_FILTRI.squadraSA.push(nomeSquadra);
        nodo_parente.classList.add("selected");
      }
      chiamaPaginaCliccata();
    }
  }
}

function creaFiltroQuotazioneMinEMax() {
  console.log("function creaFiltroQuotazioneMinEMax()");
  //riempiamo i due select in base ai giocatori attualment in memoria
  let popolaMinEMaxHTML = ""; //partiamo da 1 fino al maxQuotazione
  for (let i = 0; i < parseInt(STATO_FILTRI.qt.max); i++) {
    popolaMinEMaxHTML += "<option>" + (i + 1) + "</option>";
  }

  //inseriamo il filtro nel box (inserimento senza riconstruire tutto il contenuto precedente)
  containerFiltri.insertAdjacentHTML(
    "beforeend",
    `<section class="box-filtro">
    <label>Qt Min e Max</label>
    <select id="select-qt-min">
      ${popolaMinEMaxHTML}      
    </select>    
    <select id="select-qt-max">
      ${popolaMinEMaxHTML}  
    </select>
    </section>`,
  );

  //selezionamo il min ed il max nel filtro

  const TagSelectMin = document.getElementById("select-qt-min");
  const TagSelectMax = document.getElementById("select-qt-max");

  //imposta il valore minimo selezionato (se non presente usa il primo)

  TagSelectMin.value = STATO_FILTRI.qt.minSelezionato;
  TagSelectMax.value = STATO_FILTRI.qt.maxSelezionato;
}
function gestisciFiltroQuotazioneMinEMax(event) {
  console.log("function gestisciFiltroQuotazioneMinEMax(event)");
  //capiamo se il change proviene dal select min o max

  const TAG = event.target;
  const TAGMAX = document.getElementById("select-qt-max");
  const TAGMIN = document.getElementById("select-qt-min");

  if (TAG.id == "select-qt-max" || TAG.id == "select-qt-min") {
    if (TAG.id == "select-qt-max") {
      //se è stato cambiato il val max
      TAGMAX.value = STATO_FILTRI.qt.maxSelezionato = parseInt(TAG.value);

      //gestione filtro attivo
      if (STATO_FILTRI.qt.maxSelezionato != STATO_FILTRI.qt.max) {
      } else {
      }
    } //se è stato cambiato il val min
    else {
      TAGMIN.value = STATO_FILTRI.qt.minSelezionato = parseInt(TAG.value);

      //gestione filtro attivo
      if (STATO_FILTRI.qt.minSelezionato != STATO_FILTRI.qt.min) {
      } else {
      }
    }

    if (
      STATO_FILTRI.qt.minSelezionato >
        STATO_FILTRI.qt.maxSelezionato ||
      STATO_FILTRI.qt.maxSelezionato <
        STATO_FILTRI.qt.minSelezionato
    ) {
      TAGMAX.value = STATO_FILTRI.qt.maxSelezionato =
        STATO_FILTRI.qt.max;
    }

    chiamaPaginaCliccata();
  }
}

function creaFiltroRicercaGiocatore() {
  console.log("function creaFiltroRicercaGiocatore()");
  containerFiltri.insertAdjacentHTML(
    "beforeend",
    `
  <section class="box-filtro">
          <input type="search" id="input-ricerca-giocatore" placeholder="Cerca Giocatore" />
          <label>Ricerca Giocatore</label>
        </section>`,
  );
}

function checkQuotazione(quotazione = 0) {
  console.log("function checkQuotazione(quotazione = 0)");
  if (
    quotazione >= STATO_FILTRI.qt.minSelezionato &&
    quotazione <= STATO_FILTRI.qt.maxSelezionato
  ) {
    return true;
  } else {
    return false;
  }
}

function applicaFiltriGiocatori() {
  console.log("function applicaFiltriGiocatori())");
  let arrayFiltrato;
  // APPLICAZIONE FILTRI

  const contaElementiFiltroBox =
    document.querySelectorAll(".box-filtro").length; // conta gli elementi nel contenitore di filtri

  // Se non sono presenti filtri, restituisci l'array completo (copia)
  if (contaElementiFiltroBox === 0) return player.slice();

  // filtra per ruolo
  arrayFiltrato = player.filter((giocatoreCorrente) => {
    return ruoliFiltrati().includes(giocatoreCorrente.getRuolo);
  });

  // filtro ricerca giocatore (solo se esiste il controllo e contiene testo)
  const TAG_RICERCA = document.getElementById("input-ricerca-giocatore");
  if (TAG_RICERCA && TAG_RICERCA.value && TAG_RICERCA.value.trim() !== "") {
    const regex = new RegExp(TAG_RICERCA.value.trim(), "i");
    arrayFiltrato = arrayFiltrato.filter((giocatoreCorrente) => {
      return regex.test(giocatoreCorrente.getNome);
    });
  }

  // filtro per quotazione
  arrayFiltrato = arrayFiltrato.filter((giocatoreCorrente) => {
    return checkQuotazione(giocatoreCorrente.getQuotazione);
  });

  // filtro per squadra
  arrayFiltrato = arrayFiltrato.filter((giocatoreCorrente) => {
    if (STATO_FILTRI.squadraSA.length == 0) return true;
    return STATO_FILTRI.squadraSA.includes(
      giocatoreCorrente.getSquadraDiAppartenenza.toLowerCase(),
    );
  });

  // filtro per presenze minime
  arrayFiltrato = arrayFiltrato.filter((giocatoreCorrente) => {
    return giocatoreCorrente.getPresenze >= STATO_FILTRI.presenze.minSelezionato;
  });

  // filto per escludere o meno i fuorilista
  if (!STATO_FILTRI.caricaFuoriLista) {
    arrayFiltrato = arrayFiltrato.filter((giocatoreCorrente) => {
      return !giocatoreCorrente.getFuoriLista;
    });
  }

  azzeraTabelle();
  return arrayFiltrato;
}

function applicaFiltroTeams() {
  console.log("function applicaFiltroTeams()");

  let arraySquadre = presidenti.filter((teamsCorrente) => {
    return STATO_FILTRI.lega.includes(
      teamsCorrente.getCampionatoDiAppartenenza,
    );
  });

  if (arraySquadre.length == 0) {
    //se non è applicato nessun filtro deve caricare tutte le rose
    arraySquadre = presidenti.map((squadraCorrente) => squadraCorrente);
  }

  return arraySquadre;
}

function creaFiltroPresenzeMinime() {


  let selectPresenzeHTML = ""; //partiamo da 0 fino al max presenze tra i giocatori
  for (let i = 0; i <= STATO_FILTRI.presenze.max; i++) {
    selectPresenzeHTML += `<option>${i}</option>`;
  }
  containerFiltri.insertAdjacentHTML(
    "beforeend",
    `<section class="box-filtro">    
      <label title="Presenze Minime">Pres. Min.</label>
        <select id="select-presenze-minime">
          ${selectPresenzeHTML}
        </select>          
    </section>`,
  );
}
function creaFiltroRosa() {
  console.log("function creaFiltroRosa()");
  let optionsRosaHTML = "";

  //SE già esiste il filtro rosa lo azzeriamo
  const filtroRosaEsistente = document.getElementById("select-scegli-rosa");
  if (filtroRosaEsistente) {
    filtroRosaEsistente.parentNode.remove();
  }

  optionsRosaHTML += `<option value="tutte">Tutte le rose</option>`;

  presidenti.forEach((teamCorrente) => {
    if (STATO_FILTRI.rosaPresidente == teamCorrente.getNomeRosa.toLowerCase()) {
      optionsRosaHTML += `<option value="${teamCorrente.getNomeRosa.toLowerCase()}" selected>${toCapitalize(teamCorrente.getNomeRosa)}</option>`;
    } else {
      optionsRosaHTML += `<option value="${teamCorrente.getNomeRosa.toLowerCase()}">${toCapitalize(teamCorrente.getNomeRosa)}</option>`;
    }
  });

  containerFiltri.insertAdjacentHTML(
    "beforeend",
    `
  <section class="box-filtro">
          <label>Scegli la rosa</label>
          <select id="select-scegli-rosa">
            ${optionsRosaHTML}
        </section>`,
  );
}

function gestisciFiltroRosa(event) {
  console.log("function gestisciFiltroRosa(event)");
  const TAG = event.target;

  if (TAG.id == "select-scegli-rosa") {
    STATO_FILTRI.rosaPresidente = TAG.value;
    chiamaPaginaCliccata();
  }
}

function gestisciFiltroPresenzeMinime(event) {
  console.log("function gestisciFiltroPresenzeMinime(event)");
  const TAG = event.target;
  if (TAG.id == "select-presenze-minime") {
    //verifichiamo che il change provenga dal filtro presenze minime
    STATO_FILTRI.presenze.minSelezionato = parseInt(TAG.value);
    chiamaPaginaCliccata();
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
