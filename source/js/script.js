import {
  Giocatore,
  Rosa,
  StatisticaDiGiornata,
  RecordAcquisto,
} from "./ClassiFanta.js";
import {
  stampaLaMiaSquadra,
  gestisciFiltroSelezionaSquadraDaSelect,
} from "./laMiaSquadra.js";

import { caricaTuttiIDati } from "./caricamentoDati.js";

import { IMPOSTAZIONI } from "./impostazioni.js";
// import { inizializzaMercato } from "./mercato.js"
import { toCapitalize } from "./funzioniAgo.js";

let player = [];
let acquisti = [];
let presidenti = [];
logicaPrincipale();
const TAG_H2 = document.querySelector("h2");

//FILTRI
const containerFiltri = document.getElementById("container-filtri");
containerFiltri.addEventListener("click", gestisciFiltroRuolo);
containerFiltri.addEventListener("click", gestisciFiltroSelezionaCampionato);
containerFiltri.addEventListener("click", gestisciFiltroTeam);
containerFiltri.addEventListener("change", gestisciFiltroFuoriLista);
containerFiltri.addEventListener("change", gestisciFiltroQuotazioneMinEMax);
containerFiltri.addEventListener("change", gestisciFiltroPresenzeMinime);
containerFiltri.addEventListener("input", chiamaPaginaCliccata);
containerFiltri.addEventListener("change", gestisciFiltroRosa);

let filtroRuolo = [];

let filtroQtMinEMax = {
  filtroMin: 1,
  filtroMax: 1,
  filtroMinSelezionato: 1,
  filtroMaxSelezionato: 1,
};
let filtroSelezionaCampionato = []; //se è vuoto significa che è selezionato tutti
let filtroSelezionaSquadra = []; //se è vuoto significa che è selezionato tutti
let filtroPresenzeMinimo = 0; //se è 0 significa che è selezionato tutti
let filtroPresenzeMinimoSelezionato = 0; //se è 0 significa che è selezionato tutti
let filtroCaricaFuoriLista = false; //se è true significa che è selezionato tutti
let filtroRosa = "";

const tagVistaLaMiaSquadra = document.getElementById("vista-la-mia-squadra");
tagVistaLaMiaSquadra.addEventListener("change", (e) => {
  gestisciFiltroSelezionaSquadraDaSelect(e, chiamaPaginaCliccata);
});

const containerMenu = document.getElementById("contenitore-menu");
containerMenu.addEventListener("click", chiamaPaginaCliccata);

const containerTable = document.getElementById("container-table");
containerTable.addEventListener("click", (e) => ordinaTabella(e));

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

    // 3. Popoliamo i filtri con i massimali calcolati dal modulo!
    filtroQtMinEMax.filtroMax = datiScaricati.maxQuotazione;
    filtroQtMinEMax.filtroMaxSelezionato = datiScaricati.maxQuotazione;
    
    filtroPresenzeMinimo = datiScaricati.maxPresenze;
    // filtroPresenzeMinimoSelezionato parte da 0, quindi va bene così.

    popup.style.display = "none";
    console.log("✅ Dati caricati e pronti all'uso!");

  } catch (err) {
    console.error(err);
    TAG_H3.innerText = "Errore Caricamento Dati. Contattare l'admin. " + err;
  }
}

// fine menu

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

function stampaListaGiocatori() {
  console.log("function stampaListaGiocatori()");
  paginaDaRendereVisibile("dati");
  if (TAG_H2.dataset.action != "apri-lista-giocatori") {
    //se viene da un'altra pagina possiamo azzerare i filtri
    azzeraFiltri();
  }
  TAG_H2.dataset.action = "apri-lista-giocatori";
  TAG_H2.textContent = "LISTA GIOCATORI";
  //creiamo i filtri per la pagina giocatori

  if (containerFiltri.querySelectorAll(".box-filtro").length == 0) {
    creaFiltroRicercaGiocatore();
    creaFiltroRuolo();
    creaFiltroQuotazioneMinEMax();
    creaFiltroTeam();
    creaFiltroPresenzeMinime();
    creaFiltroFuoriLista();
  }
  azzeraTabelle();

  // console.log("Stampa lista giocatori in corso...");

  const arrayFiltrato = applicaFiltriGiocatori();

  //SE DOPO I FILTRI APPLICATI C'è ALMENO UN GIOCATORE
  if (arrayFiltrato.length !== 0) {
    let rigaHTML = ""; //azzeriamo la riga che andremo ad inserire successivamente nel body

    //SCORIAMO LA LISTA DI TUTTI I GIOCATORI FILTRATI
    arrayFiltrato.forEach((p) => {
      let rigaSquadre = "";

      //per ogni giocatore andiamo a controllare le squadre che lo posseggono
      acquisti.forEach((record) => {
        if (record.getRifNomeGiocatore == p.getNome) {
          rigaSquadre += `<td> ${toCapitalize(record.getRifNomeRosa)} (${
            record.getCostoDiAcquisto
          })</td>`;
        }
      });

      const classefuorilista = p.getFuoriLista ? "class='fuorilista'" : "";
      const asterisco = classefuorilista.length > 1 ? "(*)" : "";
      let riganuova = "";

      riganuova = `<tr ${classefuorilista}>
        <td><span class="${p.getRuolo}">${p.getRuolo}</span></td>
        <td>${toCapitalize(p.getNome)}${asterisco}</td>`;

      if (p.getFuoriLista) {
        riganuova += "<td></td>";
      } else {
        riganuova += `<td class="squadra-di-appartenenza"><img src="Assets/image/loghi_team_serie_A/${p.getSquadraDiAppartenenza.toLowerCase()}.png"/> ${toCapitalize(p.getSquadraDiAppartenenza.slice(0, 3))}</td>`;
      }
      riganuova += `<td class="cella-quotazione"><img src="Assets/icone/soldi.png"/>${p.getQuotazione}</td>
        <td>${p.getPresenze}</td>
        <td>${p.getMv}</td>
        <td>${p.getFvm}</td>
        <td>${p.getSommaBonusMalus}</td>
        <td>${p.getMvUltime5}</td>
        <td>${p.getFvmUltime5}</td>
        <td>${p.getSommaBonusMalusUltime5}</td>
        ${rigaSquadre}
      </tr>`;

      //se il giocatore attuale è un fuorilista e nelle impostazioni caricafuorilista è true
      rigaHTML += riganuova; //caso2 ok
    });

    //CREAZIONE TABELLA

    const TAG_TABLE = document.createElement("table"); //creiamo l'elemento table
    const TAG_THEAD = document.createElement("thead"); //creiamo l'elemento thead
    const TAG_TBODY = document.createElement("tbody"); //creiamo l'elemento tbody
    const thead = `<tr class="intestazione-colonne">
        <th>Ruolo</th>
        <th>Nome</th>
        <th>Squadra</th>
        <th>Quotazione</th>
        <th>Presenze</th>
        <th>MediaVoto</th>
        <th>FantaMedia</th>
        <th>Somma Bonus/Malus </th>
        <th>MediaVoto Recente</th>
        <th>FantaMedia Recente</th>
        <th>Bonus Malus ultime 5 </th>
        </tr>`;
    TAG_THEAD.innerHTML = thead;
    containerTable.appendChild(TAG_TABLE);
    TAG_TBODY.innerHTML = rigaHTML;
    TAG_TABLE.append(TAG_THEAD, TAG_TBODY);
  } else {
    containerTable.textContent =
      "⚠ ⚠ ⚠ ... Nessun giocatore corrisponde ai filtri impostati";
  }

  //console.log("Stampa lista giocatori completata.");
}

function stampaListaAppartenenze() {
  console.log("function stampaListaAppartenenze()");
  paginaDaRendereVisibile("dati");
  if (TAG_H2.dataset.action != "apri-appartenenze") {
    //se viene da un'altra pagina possiamo azzerare i filtri
    azzeraFiltri();
  }

  TAG_H2.dataset.action = "apri-appartenenze";
  TAG_H2.textContent = "LISTA APPARTENENZE";

  if (containerFiltri.querySelectorAll(".box-filtro").length == 0) {
    creaFiltroRicercaGiocatore();
    creaFiltroRuolo();
    creaFiltroQuotazioneMinEMax();
    creaFiltroTeam();
    creaFiltroPresenzeMinime();
    creaFiltroFuoriLista();
  }

  azzeraTabelle();
  //console.log("Stampa lista Appartenenze in corso...");
  const arrayFiltrato = applicaFiltriGiocatori();

  let rigaHTML = ""; //azzeriamo la riga che andremo ad inserire successivamente nel body

  //scorriamo l'array filtratoe lo inseriamo nella riga che andremo ad inserire nel tbody

  arrayFiltrato.forEach((playerCorrente) => {
    let tdSquadre1 = "";
    let tdSquadre2 = "";
    let tdSquadre3 = "";
    let tdSquadre4 = "";
    let tdSquadre5 = "";

    playerCorrente.getPossessi.forEach((sqPos) => {
      const campionato = sqPos.getCampionatoDiAppartenenza;
      switch (campionato) {
        case IMPOSTAZIONI.CAMPIONATI.GIR1:
          tdSquadre1 += sqPos.getNomeRosa + " ";
          break;
        case IMPOSTAZIONI.CAMPIONATI.GIR2:
          tdSquadre2 += sqPos.getNomeRosa + " ";
          break;
        case IMPOSTAZIONI.CAMPIONATI.GIR3:
          tdSquadre3 += sqPos.getNomeRosa + " ";
          break;
        case IMPOSTAZIONI.CAMPIONATI.GIR4:
          tdSquadre4 += sqPos.getNomeRosa + " ";
          break;
        case IMPOSTAZIONI.CAMPIONATI.GIR5:
          tdSquadre5 += sqPos.getNomeRosa + " ";
          break;
      }
    });

    // se è fuori lista aggiungo la classe alla riga
    const classFuoriLista = playerCorrente.getFuoriLista
      ? 'class="fuorilista"'
      : "";
    const asterisco = classFuoriLista.length > 1 ? "(*)" : "";

    rigaHTML += `
      <tr ${classFuoriLista}>
        <td><span class="${playerCorrente.getRuolo}"</span>
          ${playerCorrente.getRuolo}
        </td>
        <td>
          ${toCapitalize(playerCorrente.getNome)}${asterisco}
        </td>`;
    if (playerCorrente.getSquadraDiAppartenenza == "") {
      rigaHTML += `<td></td>`;
    } else {
      rigaHTML += `

        <td class="squadra-di-appartenenza"> 
          <img src="Assets/image/loghi_team_serie_A/${playerCorrente.getSquadraDiAppartenenza.toLowerCase()}.png"/> 
          ${toCapitalize(playerCorrente.getSquadraDiAppartenenza.slice(0, 3))}          
        </td>`;
    }

    rigaHTML += `
        <td  class="cella-quotazione"><img src="Assets/icone/soldi.png"/>
         ${playerCorrente.getQuotazione}
        </td>
        <td>
          ${playerCorrente.getCopieOccupate}
        </td>
        <td>
         ${toCapitalize(tdSquadre1)}
        </td>
        <td>
         ${toCapitalize(tdSquadre2)}
        </td>
        <td>
         ${toCapitalize(tdSquadre3)}
        </td>
        <td>
         ${toCapitalize(tdSquadre4)}
        </td>
        <td>
         ${toCapitalize(tdSquadre5)}
        </td>
        
      </tr>
      `;
  });

  //creiamo una tabella
  const TAG_TABLE = document.createElement("table");
  const TAG_THEAD = document.createElement("thead");
  const TAG_TBODY = document.createElement("tbody");

  //inseriamo l'intestazione della tabella
  TAG_THEAD.innerHTML = `
      <tr  class="intestazione-colonne">
        <th> Ruolo </th>
        <th> Nome  </th>
        <th> Squadra </th>
        <th> Quotazione </th>
        <th> Numero Appartenenze </th>
        <th> ${toCapitalize(IMPOSTAZIONI.CAMPIONATI.GIR1)} </th>
        <th> ${toCapitalize(IMPOSTAZIONI.CAMPIONATI.GIR2)} </th>
        <th> ${toCapitalize(IMPOSTAZIONI.CAMPIONATI.GIR3)} </th>
        <th> ${toCapitalize(IMPOSTAZIONI.CAMPIONATI.GIR4)} </th>
        <th> ${toCapitalize(IMPOSTAZIONI.CAMPIONATI.GIR5)} </th>
    </tr>`;

  TAG_TBODY.innerHTML = rigaHTML;
  TAG_TABLE.append(TAG_THEAD, TAG_TBODY);
  containerTable.appendChild(TAG_TABLE);
}
function stampaListaSvincolati() {
  console.log("function stampaListaSvincolati()");
  paginaDaRendereVisibile("dati");
  //console.log("Stampa lista Svincolati in corso..."
  // );

  if (TAG_H2.dataset.action != "apri-svincolati") {
    azzeraFiltri();
  }

  TAG_H2.dataset.action = "apri-svincolati";
  TAG_H2.textContent = "LISTA SVINCOLATI";
  if (containerFiltri.querySelectorAll(".box-filtro").length == 0) {
    creaFiltroRicercaGiocatore();
    creaFiltroRuolo();
    creaFiltroQuotazioneMinEMax();
    creaFiltroTeam();
    creaFiltroPresenzeMinime();
    creaFiltroFuoriLista();
  }

  azzeraTabelle();

  const arrayFiltrato = applicaFiltriGiocatori();

  let rigaHTML = ""; //azzeriamo la riga che andremo ad inserire successivamente nel body

  let contaGiocatori = 0;
  arrayFiltrato.forEach((pl) => {
    const classefuorilista = pl.getFuoriLista ? "class='fuorilista'" : "";
    const asterisco = classefuorilista.length > 1 ? "(*)" : "";

    //true - true  - stampa
    //true - false - non stampare
    //false - true   - non stampare
    // false - false  - non stampare

    if (pl.getCopieDisponibili > 0) {
      rigaHTML += `<tr ${classefuorilista}>
          <td><span class="${pl.getRuolo}">${pl.getRuolo}</span></td>
          <td>${pl.getNome}${asterisco}</td>`;
      rigaHTML +=
        pl.getSquadraDiAppartenenza == ""
          ? "<td></td>"
          : `<td class="squadra-di-appartenenza"><img src="Assets/image/loghi_team_serie_A/${pl.getSquadraDiAppartenenza.toLowerCase()}.png"/> ${toCapitalize(pl.getSquadraDiAppartenenza.slice(0, 3))}</td>`;
      rigaHTML += `          
          <td class="cella-quotazione"><img src="Assets/icone/soldi.png"/>${pl.getQuotazione}</td>
          <td>${pl.getPresenze}</td>
          <td>${pl.getMv}</td>
          <td>${pl.getFvm}</td>
          <td>${pl.getSommaBonusMalus}</td>
          <td>${pl.getCopieOccupate}/${IMPOSTAZIONI.REGOLE.MAX_POSSEDUTO} - liberi:${pl.getCopieDisponibili}</td>
          <td><img src="Assets/image/ricerca_possessi.png" class="icona-ricerca-possessi" title="${pl.getNome} ha ${pl.getCopieDisponibili} copie disponibili"/> </td>
        </tr>`;
      contaGiocatori++;
    }
  });
  if (contaGiocatori > 0) {
    const theadTemp = `<tr><th colspan="10">LISTA GIOCATORI SVINCOLATI</tr>
      <tr class="intestazione-colonne">
      <th>Ruolo</th>
      <th>Nome</th>
      <th>Squadra</th>
      <th>Quotazione</th>
      <th>Presenze</th>
      <th>MV</th>
      <th>FVM</th>
      <th>Somma Bonus/Malus</th>
      <th>Posseduto</th>
      <th>Info</th>
      </tr>`;
    //per ogni ruolo creiamo una tabella
    const TAG_TABLE = document.createElement("table"); //creiamo l'elemento table
    const TAG_THEAD = document.createElement("thead"); //creiamo l'elemento thead
    TAG_THEAD.innerHTML = theadTemp;
    const TAG_TBODY = document.createElement("tbody"); //creiamo l'elemento tbody

    containerTable.appendChild(TAG_TABLE); //aggiungiamo la tabella nel contenitore passato
    TAG_TBODY.innerHTML = rigaHTML; //inseriamo il contenuto del tbody
    TAG_TABLE.append(TAG_THEAD, TAG_TBODY); //inseriamo thead e tbody nella tabella
  } else {
    containerTable.textContent =
      "⚠ ⚠ ⚠ ... Nessun giocatore corrisponde ai filtri impostati";
  }

  //console.log("Stampa lista svincolaticompletata.");
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
    if (teamCorrente == filtroRosa || filtroRosa == "Tutte le rose") {
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
    if (filtroSelezionaCampionato.includes(elemento_cliccato.name)) {
      //se il campionato è già incluso nel filtro, lo rimuoviamo
      const indice = filtroSelezionaCampionato.indexOf(elemento_cliccato.name); //troviamo l'indice del campionato da rimuovere
      filtroSelezionaCampionato.splice(indice, 1); //rimuoviamo il campionato dal filtro
      elemento_cliccato.classList.remove("selected");
    } else {
      //altrimenti lo aggiungiamo al filtro
      filtroSelezionaCampionato.push(elemento_cliccato.name); //aggiungiamo il campionato al filtro
      elemento_cliccato.classList.add("selected"); //aggiungiamo la classe selected per evidenziare il filtro selezionato
    }
  }
  chiamaPaginaCliccata();
}

function creaFiltroRuolo() {
  console.log("function creaFiltroRuolo()");
  //<section class="box-filtro" id="filtro-ruolo">
  //  <label>Ruolo</label>
  //  <div class="ruolo P ${filtroRuolo.P ? "selected" : ""}">P</div>
  //<div class="ruolo D ${filtroRuolo.D ? "selected" : ""}">D</div>
  //<div class="ruolo C ${filtroRuolo.C ? "selected" : ""}">C</div>
  //<div class="ruolo A ${filtroRuolo.A ? "selected" : ""}">A</div>
  //</section>

  containerFiltri.insertAdjacentHTML(
    "beforeend",
    `  
    <section class="box-filtro" id="filtro-ruolo">
    <label>Ruolo</label>
      <div data-tipo-ruolo="P" class="ruolo ${filtroRuolo.includes("P") ? "selected" : ""}">P</div>
      <div data-tipo-ruolo="D" class="ruolo ${filtroRuolo.includes("D") ? "selected" : ""}">D</div>
      <div data-tipo-ruolo="C" class="ruolo ${filtroRuolo.includes("C") ? "selected" : ""}">C</div>
      <div data-tipo-ruolo="A" class="ruolo ${filtroRuolo.includes("A") ? "selected" : ""}">A</div>
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

    if (filtroRuolo.includes(ruolo_cliccato)) {
      //se il ruolo è già incluso nel filtro lo rimuoviamo
      const indice = filtroRuolo.indexOf(ruolo_cliccato);
      filtroRuolo.splice(indice, 1);
    } else {
      filtroRuolo.push(ruolo_cliccato);
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
            filtroCaricaFuoriLista ? "checked" : ""
          }> si
          <input type="radio" name="carica-FuoriLista" value="no"  ${
            filtroCaricaFuoriLista ? "" : "checked"
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
      filtroCaricaFuoriLista = true;
    } else {
      filtroCaricaFuoriLista = false;
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
  filtroRuolo = []; //azzero i filtri selezionati
  filtroQtMinEMax.filtroMaxSelezionato = filtroQtMinEMax.filtroMax;
  filtroQtMinEMax.filtroMinSelezionato = filtroQtMinEMax.filtroMin;
  filtroCaricaFuoriLista = false;
  filtroSelezionaCampionato = [];
  filtroSelezionaSquadra = [];
  filtroPresenzeMinimoSelezionato = 0;
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
      stampaListaGiocatori();
      break;
    case "apri-lista-giocatori":
      stampaListaGiocatori();
      break;
    case "apri-mercato":
      stampaListaSvincolati();
      break;
    case "apri-appartenenze":
      stampaListaAppartenenze();
      break;
    case "apri-svincolati":
      stampaListaSvincolati();
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
  if (filtroRuolo.length == 0) {
    return ["P", "D", "C", "A"];
  }
  return filtroRuolo;
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

      if (filtroSelezionaSquadra.includes(nomeSquadra)) {
        const indice = filtroSelezionaSquadra.indexOf(nomeSquadra);
        filtroSelezionaSquadra.splice(indice, 1);
        nodo_parente.classList.remove("selected");
      } else {
        filtroSelezionaSquadra.push(nomeSquadra);
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
  for (let i = 0; i < parseInt(filtroQtMinEMax.filtroMax); i++) {
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

  TagSelectMin.value = filtroQtMinEMax.filtroMinSelezionato;
  TagSelectMax.value = filtroQtMinEMax.filtroMaxSelezionato;
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
      TAGMAX.value = filtroQtMinEMax.filtroMaxSelezionato = parseInt(TAG.value);

      //gestione filtro attivo
      if (filtroQtMinEMax.filtroMaxSelezionato != filtroQtMinEMax.filtroMax) {
      } else {
      }
    } //se è stato cambiato il val min
    else {
      TAGMIN.value = filtroQtMinEMax.filtroMinSelezionato = parseInt(TAG.value);

      //gestione filtro attivo
      if (filtroQtMinEMax.filtroMinSelezionato != filtroQtMinEMax.filtroMin) {
      } else {
      }
    }

    if (
      filtroQtMinEMax.filtroMinSelezionato >
        filtroQtMinEMax.filtroMaxSelezionato ||
      filtroQtMinEMax.filtroMaxSelezionato <
        filtroQtMinEMax.filtroMinSelezionato
    ) {
      TAGMAX.value = filtroQtMinEMax.filtroMaxSelezionato =
        filtroQtMinEMax.filtroMax;
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
    quotazione >= filtroQtMinEMax.filtroMinSelezionato &&
    quotazione <= filtroQtMinEMax.filtroMaxSelezionato
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
    if (filtroSelezionaSquadra.length == 0) return true;
    return filtroSelezionaSquadra.includes(
      giocatoreCorrente.getSquadraDiAppartenenza.toLowerCase(),
    );
  });

  // filtro per presenze minime
  arrayFiltrato = arrayFiltrato.filter((giocatoreCorrente) => {
    return giocatoreCorrente.getPresenze >= filtroPresenzeMinimoSelezionato;
  });

  // filto per escludere o meno i fuorilista
  if (!filtroCaricaFuoriLista) {
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
    return filtroSelezionaCampionato.includes(
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
  console.log("creaFiltroPresenzeMinime()");

  let selectPresenzeHTML = ""; //partiamo da 0 fino al max presenze tra i giocatori
  for (let i = 0; i <= filtroPresenzeMinimo; i++) {
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
    if (filtroRosa == teamCorrente.getNomeRosa.toLowerCase()) {
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
    filtroRosa = TAG.value;
    chiamaPaginaCliccata();
  }
}

function gestisciFiltroPresenzeMinime(event) {
  console.log("function gestisciFiltroPresenzeMinime(event)");
  const TAG = event.target;
  if (TAG.id == "select-presenze-minime") {
    //verifichiamo che il change provenga dal filtro presenze minime
    filtroPresenzeMinimoSelezionato = parseInt(TAG.value);
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
