import {
  Giocatore,
  Rosa,
  StatisticaDiGiornata,
  RecordAcquisto,
} from "./ClassiFanta.js";

import { IMPOSTAZIONI } from "./impostazioni.js";

import { toCapitalize } from "./funzioniAgo.js";

let player = [];
let acquisti = [];
let presidenti = [];
logicaPrincipale();
const TAG_H2 = document.querySelector("h2");

//FILTRI
const containerFiltri = document.getElementById("container-filtri");
containerFiltri.addEventListener("click", gestisciFiltroRuolo);
containerFiltri.addEventListener("click", gestisciFiltroSelezionaCampionato2);
containerFiltri.addEventListener("change", gestisciFiltroFuoriLista);
containerFiltri.addEventListener("change", gestisciFiltroQuotazioneMinEMax);

let filtroRuolo = {
  //qui memorizzeremo i cambi stati deli ruoli
  P: false,
  D: false,
  C: false,
  A: false,
};

let filtroMinEMax = {
  filtroMin: 0,
  filtroMax: 0,
  filtroMinSelezionato: 0,
  filtroMaxSelezionato: 0,
};
let filtroSelezionaCampionato = [];

let filtroCaricaFuoriLista = false;

const LI_TAG = document.querySelectorAll("li");
LI_TAG[0].addEventListener("click", paginaPresidenti);
LI_TAG[1].addEventListener("click", paginaRoseComplete);
LI_TAG[2].addEventListener("click", paginaGiocatori);
LI_TAG[3].addEventListener("click", paginaAppartenenze);
LI_TAG[4].addEventListener("click", paginaSvincolati);
LI_TAG[5].addEventListener("click", paginaCreditiResidui);
LI_TAG[6].addEventListener("click", paginaMercato);

const containerTable = document.getElementById("container-table");
containerTable.addEventListener("click", (e) => ordinaTabella(e));

async function logicaPrincipale() {
  const popup = document.getElementById("popup-caricamento");
  const TAG_H3 = popup.querySelector("h3");

  popup.style.display = "visible"; //popup attesa caricamento dati

  try {
    await Promise.all([
      //caricamento dati presidenti
      caricaPresidenti(),
      //caricamento dati giocatori
      caricaGiocatori(),
    ]);
    //gli acquisti vanno caricati solo dopo aver caricato presidenti e giocatori
    await caricaAcquisti();
    popup.style.display = "none";
  } catch (err) {
    console.error(err);
    TAG_H3.innerText =
      "Errore Caricamento Dati, Ricaricare la pagina ... se il problema persiste contattare l'admin. " +
      err;
  }

  //console.log("Logica principale completata.");
}

// caricamento file --------------------------------
async function caricaPresidenti() {
  //console.log("Caricamento presidenti in corso...");
  //let datiPresidenti = get_file_presidenti(); //ottengo il contenuto del file presidenti

  const response = await fetch("Assets/file/presidenti.txt");
  if (!response.ok) {
    throw new Error("Network response was not ok " + response.statusText);
  }
  const datiPresidenti = (await response.text())
    .replaceAll("\t", "|")
    .toUpperCase();

  let temp = [];
  let arrayPresidenti = datiPresidenti.split("\n"); //divido il file in righe

  for (let i = 0; i < arrayPresidenti.length; i++) {
    {
      temp = arrayPresidenti[i].split("|"); //divido ogni riga in colonne
      if (temp.length > 1) {
        //fin quanto l'array è pieno puoi aggiungere
        presidenti.push(new Rosa(temp[0], temp[1], temp[2], temp[3])); //creo un nuovo oggetto presidente e lo aggiungo all'array presidenti
      }
    }
  }
  //console.log("Caricamento presidenti completato.");
}

async function caricaGiocatori() {
  //console.log("Caricamento giocatori in corso...");
  //let datiGiocatori = get_file_giocatori();

  const response = await fetch("Assets/file/quotazioni_gg20.txt");
  if (!response.ok) {
    throw new Error("Network response was not ok " + response.statusText);
  }
  const datiGiocatori = (await response.text())
    .replaceAll("\t", "|")
    .toUpperCase();

  let temp = [];
  let arrayGiocatori = datiGiocatori.split("\n");
  for (let i = 1; i < arrayGiocatori.length; i++) {
    temp = arrayGiocatori[i].split("|");

    if (temp.length > 1) {
      //temp.length > 1 il record non è vuoto

      player.push(
        new Giocatore(
          temp[0],
          temp[1],
          temp[2],
          temp[3],
          temp[4],
          temp[5],
          temp[6],
          temp[7],
          temp[8],
          temp[9],
          temp[10],
          temp[11],
          temp[12],
          temp[13],
        ),
      );
    }
  }
  //console.log("Caricamento giocatori completato.");
}

async function caricaAcquisti() {
  //console.log("Caricamento acquisti in corso...");

  const response = await fetch("Assets/file/file_rose.txt");
  if (!response.ok) {
    throw new Error("Network response was not ok " + response.statusText);
  }
  let datiRose = (await response.text()).toUpperCase(); //leggiamo il file rose e lo trasformiamo in maiuscolo
  datiRose = datiRose.replaceAll("\t", "|"); //sostituiamo tutti i tab con il carattere pipe  (|)

  //esempio : Arsenal	SOMMER	POR	int	8	4,88	18	45	Premier League
  let temp = [];
  let arrayRose = datiRose.split("\n").filter((line) => line.trim()); //in questo array trasformiamo ogni riga in un indice di array, filtrando righe vuote

  for (let i = 0; i < arrayRose.length; i++) {
    {
      temp = arrayRose[i].split("|"); //qui dividiamo ogni riga in colonne
      /*ESEMPIO
      temp[0]=Arsenal	
      temp[1]=SOMMER	
      temp[2]=POR	
      temp[3]=int	
      temp[4]=8	
      temp[5]=4,88	
      temp[6]=18	
      temp[7]=45	
      temp[8]=Premier League*/
      let tempNomeSquadra = temp[0]; //esempio Arsenal
      let tempNomeGiocatore = temp[1]; //esempio Sommer
      let tempPrezzoAcquisto = temp[7]; // Esempio 45

      //registriamo il giocatore in un record
      const record = new RecordAcquisto(
        player.find((p) => {
          return p.getNome == tempNomeGiocatore;
        }),
        11,
        "",
        tempPrezzoAcquisto,
      );

      //record ora contiene il record di acquisto del giocatore

      const presidenteTrovato = presidenti.find((p) => {
        return tempNomeSquadra == p.getNomeRosa;
      });

      //presidente trovato ora contiene l'oggetto presidente a cui dobbiamo aggiungere il giocatore

      if (presidenteTrovato) {
        //se la ricerca dei presidenti è andata a buon fine registriamo il record
        presidenteTrovato.addRecordAcquisto(record);
        const giocatoreTrovato = player.find((p) => {
          return p.getNome == tempNomeGiocatore;
        });
        if (giocatoreTrovato) {
          giocatoreTrovato.aggiungiPossessi(presidenteTrovato);
        }
      }
    } //ora ogni rosa in presidenti ha i suoi giocatori aggiunti ed ogni giocatore ha le sue appartenenze aggiornate
  }
  //console.log("Caricamento acquisti completato.");
}
//---------------------------------------------------------------------------

//pagine azionabili al click sul menu
function paginaPresidenti() {
  TAG_H2.textContent = "LISTA PRESIDENTI";
  azzeraTabelle();
  azzeraFiltri();
  // creaFiltroSelezionaCampionato();
  creaFiltroSelezionaCampionato2();
  stampaListaPresidenti();
}

function paginaRoseComplete() {
  TAG_H2.textContent = "LISTA SQUADRE";
  azzeraFiltri();
  azzeraTabelle();
  // creaFiltroSelezionaCampionato();
  creaFiltroSelezionaCampionato2();
  creaFiltroRuolo();
  creaFiltroQuotazioneMinEMax();
  creaFiltroFuoriLista();
  stampaRoseComplete();
}
function paginaGiocatori() {
  TAG_H2.textContent = "LISTA GIOCATORI";
  azzeraFiltri();
  azzeraTabelle();
  creaFiltroRuolo();
  creaFiltroQuotazioneMinEMax();
  creaFiltroFuoriLista();

  stampaListaGiocatori();
}

function paginaAppartenenze() {
  TAG_H2.textContent = "LISTA APPARTENENZE";
  azzeraFiltri();
  azzeraTabelle();
  creaFiltroRuolo();
  creaFiltroQuotazioneMinEMax();
  //creaFiltroAppartenenzeMax();
  creaFiltroFuoriLista();
  stampaListaAppartenenze();
}

function paginaSvincolati() {
  TAG_H2.textContent = "LISTA SVINCOLATI";
  azzeraFiltri();
  azzeraTabelle();
  azzeraFiltri();
  creaFiltroRuolo();
  creaFiltroQuotazioneMinEMax();
  creaFiltroFuoriLista();
  stampaListaSvincolati();
}

function paginaCreditiResidui() {
  TAG_H2.textContent = "LISTA CREDITI RESIDUI";
  azzeraFiltri();
  azzeraTabelle();
  creaFiltroSelezionaCampionato2();
  stampaListaCreditiResidui();
}

function paginaMercato() {
  //console.log("Pagina mercato in corso...");
  TAG_H2.textContent = "PAGINA MERCATO";
  azzeraTabelle();
  //console.log("Pagina mercato completata.");
}
// fine menu

//STAMPE TABELLE

function stampaListaPresidenti() {
  //console.log("Stampa lista presidenti in corso...");
  TAG_H2.textContent = "LISTA PRESIDENTI";
  azzeraTabelle(); //azzeriamo tutte le tabelle precedenti

  IMPOSTAZIONI.CAMPIONATI.TUTTI.forEach((camp) => {
    //scorri la lista dei campionati

    //se è stato selezionato un filtro controlliamo che il campionato corrente sia uguale al filtro
    if (
      filtroSelezionaCampionato.includes(camp) ||
      filtroSelezionaCampionato.length == 0
    ) {
      //se il filtro è tutti oppure il campionato corrente è uguale al filtro procedi

      const TAG_TABLE = document.createElement("table"); //creiamo l'elemento table
      const TAG_THEAD = document.createElement("thead"); //creiamo l'elemento thead
      const TAG_TBODY = document.createElement("tbody"); //creiamo l'elemento tbody
      let rigaHTML = "";
      // inizializziamo la riga di intestazione delle tabella
      TAG_THEAD.innerHTML = `<tr> <th colspan="2">${toCapitalize(
        camp,
      )}</th></tr class="intestazione-colonne"> 
                            <tr>
                            <th> Squadra </th> 
                            <th> Presidente </th>                           
                            </tr>`;

      //ricaviamoci solo i presidenti del campionato attuale
      const presidentiFiltrati = presidenti.filter(
        (item) => item.getCampionatoDiAppartenenza == camp,
      );

      //scorri la lista presidenti ed inserisci ogni presidente nella tabella
      presidentiFiltrati.forEach((presidente) => {
        rigaHTML += `<tr>
                      <td> ${toCapitalize(presidente.getNomeRosa)} </td>
                      <td> ${toCapitalize(
                        presidente.getNomePresidente,
                      )} </td>                      
                    </tr>`;
      });
      containerTable.appendChild(TAG_TABLE);
      TAG_TBODY.innerHTML = rigaHTML;
      TAG_TABLE.append(TAG_THEAD, TAG_TBODY);
    }
  });

  // console.log("Stampa lista presidenti completata.");
}

function stampaRoseComplete() {
  // console.log("Stampa LISTA ROSE in corso...");

  TAG_H2.textContent = "LISTA SQUADRE";
  azzeraTabelle();

  //andiamo a prelevare tutti i presidenti delle squadre selezionate in filtrocampionato
  const presidentiFiltratiDalCampionato = presidenti.filter((pres) => {
    if (
      filtroSelezionaCampionato.includes(pres.getCampionatoDiAppartenenza) ||
      filtroSelezionaCampionato.length == 0
    ) {
      return true;
    } else {
      return false;
    }
  });

  //scorriamo la lista dei presodenti filtrati dal campionato selezionato  e per ogni presidente verifichiamo tutti gli acquisti
  presidentiFiltratiDalCampionato.forEach((presidenti) => {
    let rigaHtml = "";
    let contaGiocatori = 0;

    //per ogni rosa dobbiamo stampare i record di acquisto e aggiungerli alla rigahtml

    const ruoliSelezionatiDallUtente = ruoliFiltrati(); //prelevo solo i ruoli necessari

    presidenti.getTuttiGliSlot.forEach((rec) => {
      //per ogni presidente mi faccio dare tutti gli slot
      if (rec != null) {
        if (
          ruoliSelezionatiDallUtente.includes(rec.getDatiGiocatore.getRuolo) &&
          checkQuotazione(rec.getDatiGiocatore.getQuotazione) &&
          !(rec.getDatiGiocatore.getFuoriLista && !filtroCaricaFuoriLista)
        ) {
          // se il giocatore ha come fuorilista true, significa che non gioca più in serie a lo flaggo con la classe fuorilista
          // questo permette di farlo diventare in grigio durante la visualizzazione
          const classfuoriLista = rec.getDatiGiocatore.getFuoriLista
            ? "class='fuorilista'"
            : "";
          const asterisco = classfuoriLista.length > 1 ? " (*)" : "";

          rigaHtml += `
              <tr ${classfuoriLista}>
                <td><span class="${rec.getDatiGiocatore.getRuolo}">${rec.getDatiGiocatore.getRuolo}</span></td>
                <td>${toCapitalize(
                  rec.getDatiGiocatore.getNome,
                )}${asterisco}</td>
                <td>${toCapitalize(
                  rec.getDatiGiocatore.getSquadraDiAppartenenza,
                )}</td>
                <td>${rec.getDatiGiocatore.getQuotazione}</td>
                <td>${rec.getCostoDiAcquisto}</td>
                <td>${Math.ceil(
                  (rec.getCostoDiAcquisto +
                    rec.getDatiGiocatore.getQuotazione) /
                    2,
                )}</td>
              </tr>`;
          contaGiocatori++;
        }
      }
    });

    // FINE FOREACH SUGLI ACQUISTI
    //se la tabella contiene almeno un giocatore la fai vedere altrimenti no
    if (contaGiocatori > 0) {
      //CREAZIONI ELEMENTI TABELLA
      //per ogni presifente con almeno un giocatore creiamo una tabella
      const TAG_TABLE = document.createElement("table"); //creazione tabella
      const TAG_TBODY = document.createElement("tbody"); //creazione tbody
      const TAG_THEAD = document.createElement("thead"); //creazione thead
      const TAG_TFOOT = document.createElement("tfoot"); //creazione thead
      TAG_THEAD.innerHTML += `<tr>
      <th colspan="6"> ${toCapitalize(presidenti.getNomeRosa)} </th>
    </tr>
    <tr>
      <th colspan="6"> ${toCapitalize(presidenti.getNomePresidente)} </th>
    </tr>
    <tr>
      <th colspan="6"> ${toCapitalize(
        presidenti.getCampionatoDiAppartenenza,
      )} </th>
    </tr>
    <tr class="intestazione-colonne">
      <th>Ruolo</th><th>Nome</th><th>Squadra</th><th>Qt</th><th>Costo Acq.</th><th>Costo Svi.</th>
    </tr>`;
      TAG_TFOOT.innerHTML = `<tr>
      <td colspan="6">Crediti residui : ${presidenti.getCreditiResidui}</td>
    </tr>
    <tr>
      <td colspan="6"> Giocatori in rosa:${presidenti.contaSlotPieni()}/${
        IMPOSTAZIONI.REGOLE.MAX_NUMERO_GIOCATORI_PER_SQUADRA
      } </td></tr>
      <tr><td colspan="6"> Crediti spesi : ${
        presidenti.getCreditiSpesi
      }</td></tr>
      <tr><td colspan="6"> ValoreRosa : ${presidenti.getValoreRosa}</td></tr>
      <tr><td colspan="6"> Giocatori Caricati : ${contaGiocatori}</td></tr>
    `;
      //INSERIMENTO TABELLA
      TAG_TBODY.innerHTML = rigaHtml;
      TAG_TABLE.append(TAG_THEAD, TAG_TBODY, TAG_TFOOT);
      containerTable.appendChild(TAG_TABLE);
    }
  });

  //console.log("Stampa LISTA ROSE completata.");
}

function stampaListaGiocatori() {
  // console.log("Stampa lista giocatori in corso...");
  azzeraTabelle();

  TAG_H2.textContent = "LISTA GIOCATORI";
  const TAG_TABLE = document.createElement("table"); //creiamo l'elemento table
  const TAG_THEAD = document.createElement("thead"); //creiamo l'elemento thead
  const TAG_TBODY = document.createElement("tbody"); //creiamo l'elemento tbody
  TAG_THEAD.innerHTML = `<tr class="intestazione-colonne">
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

  const ruoli = ruoliFiltrati(); //chiama la funzione che restituisce un array con i ruoli filtrati dall'utente

  let rigaHTML = ""; //azzeriamo la riga che andremo ad inserire successivamente nel body

  ruoli.forEach((ruoloCorrente) => {
    //scorriamo la lista dei ruoli

    const giocatoriFiltratiDalRuolo = player.filter((giocatoriFiltrati) => {
      return giocatoriFiltrati.getRuolo == ruoloCorrente;
    });

    //scorri la lista giocatori ed inserisci ogni giocatore nella tabella
    //FOREACH PLAYER INIZIATA
    giocatoriFiltratiDalRuolo.forEach((p) => {
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
        <td>${toCapitalize(p.getNome)}${asterisco}</td>
        <td>${toCapitalize(p.getSquadraDiAppartenenza)}</td>
        <td>${p.getQuotazione}</td>
        <td>${p.getPresenze}</td>
        <td>${p.getMv}</td>
        <td>${p.getFvm}</td>
        <td>${p.getSommaBonusMalus}</td>
        <td>${p.getMvUltime5}</td>
        <td>${p.getFvmUltime5}</td>
        <td>${p.getSommaBonusMalusUltime5}</td>
        ${rigaSquadre}
      </tr>`;

      if (
        ((p.getFuoriLista && filtroCaricaFuoriLista) || !p.getFuoriLista) &&
        checkQuotazione(p.getQuotazione)
      ) {
        //se il giocatore attuale è un fuorilista e nelle impostazioni caricafuorilista è true
        rigaHTML += riganuova; //caso2 ok
      } else if (!filtroCaricaFuoriLista && p.getFuoriLista) {
        //se nelle impostazioni c'è false in caricafuorilista
        rigaHTML += "";
      }
    });

    //FOREACH PLAYER TERMINATA
  });

  containerTable.appendChild(TAG_TABLE);
  TAG_TBODY.innerHTML = rigaHTML;
  TAG_TABLE.append(TAG_THEAD, TAG_TBODY);

  //console.log("Stampa lista giocatori completata.");
}

function stampaListaAppartenenze() {
  //console.log("Stampa lista Appartenenze in corso...");
  azzeraTabelle();
  const ruoli = ruoliFiltrati(); //preleva i ruoli dal filtro

  //scorriamo per ogni ruolo
  ruoli.forEach((ruoloCorrente) => {
    // adesso se vengono rispettati i filtri si stampa altrimenti no

    let rigaHTML = ""; //azzeriamo la riga che andremo ad inserire successivamente nel body

    let playerRuoloCorrente = player.filter((p) => {
      return p.getRuolo == ruoloCorrente;
    }); //playerRuoloCorrente è un array con tutti i giocatori del ruolo corrente

    playerRuoloCorrente = playerRuoloCorrente.filter((p) => {
      if (filtroCaricaFuoriLista) {
        //se filtro caricafuolista è true puoi caricare
        return true;
      } else {
        //se filtro caricafuolista è true puoi caricare carica solo quelli con fuorilsta false
        return !p.getFuoriLista;
      }
    });

    playerRuoloCorrente = playerRuoloCorrente.filter((pl) => {
      return checkQuotazione(pl.getQuotazione);
    }); // adesso è ulteriormente filtrato per la quotazione in filtro

    //scorriamo il nuovo array filtrato per ruolo e per quotazione e lo inseriamo nella riga che andremo ad inserire nel tbody
    playerRuoloCorrente.forEach((playerCorrente) => {
      let tdSquadre = "";
      playerCorrente.getPossessi.forEach((sqPos) => {
        tdSquadre += toCapitalize(sqPos.getNomeRosa) + ", ";
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
        </td>
        <td>
          ${toCapitalize(playerCorrente.getSquadraDiAppartenenza)}
        </td>
        <td>
         ${playerCorrente.getQuotazione}
        </td>
        <td>
          ${playerCorrente.getCopieOccupate}
        </td>
        <td>
         ${tdSquadre}
        </td>
        
      </tr>
      `;
    });

    //per ogni ruolo con almeno un giocatore creiamo una tabella
    const TAG_TABLE = document.createElement("table");
    const TAG_THEAD = document.createElement("thead");
    const TAG_TBODY = document.createElement("tbody");

    //inseriamo l'intestazione della tabella
    TAG_THEAD.innerHTML = `<tr >
      <th colspan="6">
      ${ruoloCorrente}
      </th>
      </tr>
      <tr  class="intestazione-colonne">
        <th> Ruolo </th>
        <th> Nome  </th>
        <th> Squadra </th>
        <th> Quotazione </th>
        <th> Numero Appartenenze </th>
        <th> In possesso da: </th>
    </tr>`;

    TAG_TBODY.innerHTML = rigaHTML;
    TAG_TABLE.append(TAG_THEAD, TAG_TBODY);
    containerTable.appendChild(TAG_TABLE);
  });
}
function stampaListaSvincolati() {
  //console.log("Stampa lista Svincolati in corso...");

  TAG_H2.textContent = "LISTA SVINCOLATI";

  azzeraTabelle(); //azzeriamo tutte le tabelle precedenti

  const ruoli = ruoliFiltrati();

  ruoli.forEach((ruoloCorrente) => {
    //scorriamo la lista dei ruoli

    //filtriamo per ruolo,  prendiamo solo i giocatori del ruolo corrente
    let giocatoriFiltrati = player.filter((giocatoreCorrente) => {
      return giocatoreCorrente.getRuolo == ruoloCorrente;
    });

    //filtriamo per quotazione, filtriamo ancora per quotazione
    giocatoriFiltrati = giocatoriFiltrati.filter((giocatoreCorrente) => {
      return checkQuotazione(giocatoreCorrente.getQuotazione);
    });

    let rigaHTML = ""; //azzeriamo la riga che andremo ad inserire successivamente nel body

    let contaGiocatori = 0;
    giocatoriFiltrati.forEach((pl) => {
      const classefuorilista = pl.getFuoriLista ? "class='fuorilista'" : "";
      const asterisco = classefuorilista.length > 1 ? "(*)" : "";

      //true - true  - stampa
      //true - false - non stampare
      //false - true   - non stampare
      // false - false  - non stampare

      if ((pl.getFuoriLista && filtroCaricaFuoriLista) || !pl.getFuoriLista) {
        if (pl.getCopieDisponibili > 0) {
          rigaHTML += `<tr ${classefuorilista}>
          <td><span class="${pl.getRuolo}">${pl.getRuolo}</span></td>
          <td>${pl.getNome}${asterisco}</td>
          <td>${pl.getSquadraDiAppartenenza}</td>
          <td>${pl.getQuotazione}</td>
          <td>${pl.getCopieOccupate}/${IMPOSTAZIONI.REGOLE.MAX_POSSEDUTO} - liberi:${pl.getCopieDisponibili}</td>
          <td><img src="Assets/image/ricerca_possessi.png" class="icona-ricerca-possessi" title="${pl.getNome} ha ${pl.getCopieDisponibili} copie disponibili"/> </td>
        </tr>`;
          contaGiocatori++;
        }
      }
    });
    if (contaGiocatori > 0) {
      const theadTemp = `<tr><th colspan="6">${ruoloCorrente}</tr>
      <tr class="intestazione-colonne">
      <th>Ruolo</th>
      <th>Nome</th>
      <th>Squadra</th>
      <th>Quotazione</th>
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
    }
  });

  //console.log("Stampa lista svincolaticompletata.");
}

function stampaListaCreditiResidui() {
  //console.log("Stampa lista crediti residui in corso...");
  azzeraTabelle(); //azzeriamo tutte le tabelle precedenti
  IMPOSTAZIONI.CAMPIONATI.TUTTI.forEach((camp) => {
    if (camp) {
      if (
        filtroSelezionaCampionato.includes(camp) ||
        filtroSelezionaCampionato.length == 0
      ) {
        //scorri la lista dei campionati

        //controlliamo che non sia null

        //per ogni campionato aggiungiamo alla pagina html una tabella
        //creare la tabella, thead, tbody
        const TAG_TABLE = document.createElement("table"); //creiamo l'elemento table
        const TAG_THEAD = document.createElement("thead"); //creiamo l'elemento thead
        const TAG_TBODY = document.createElement("tbody"); //creiamo l'elemento tbody
        TAG_THEAD.innerHTML = `<tr>
        <th colspan="3">${camp}</th>
      </tr>
      <tr class="intestazione-colonne">
        <th>Squadra</th>
        <th>Nome Presidente</th>
        <th>Crediti Residui</th>
      </tr>`;

        //ad ogni campionato dobbiamo trovare le squadre che ne fanno parte
        //camp contiene il nome del campionato di riferimento

        const squadreFiltrate = presidenti.filter(
          (item) => item.getCampionatoDiAppartenenza == camp,
        );
        // a questo punto squadreFiltrate è un array con le squadre del campionato di riferimento

        //ordiniamo la lista da chi ha più crediti a chi ha meno crediti
        squadreFiltrate.sort((sqA, sqB) => {
          return sqB.getCreditiResidui - sqA.getCreditiResidui;
        });

        //costruiamo la riga con tutte le squadre
        squadreFiltrate.forEach((sqAttuale) => {
          TAG_TBODY.innerHTML += `
        <tr>
        <td>${toCapitalize(sqAttuale.getNomeRosa)}</td>
        <td>${toCapitalize(sqAttuale.getNomePresidente)}</td>
        <td>${sqAttuale.getCreditiResidui}</td>
        </tr>
        `;
        });
        //per ogni squadra che fa parte del campionato attuale salviamo una riga con i dati che ci servono
        //cioè Nome squadra | Nome presidente | crediti Residui

        containerTable.appendChild(TAG_TABLE); //inseriamo la tabella nel contenitore
        TAG_TABLE.append(TAG_THEAD, TAG_TBODY); //inseriamo thead e tbody nella tabella
      }
    }
  });

  //console.log("Stampa lista crediti residui Terminata");
}

//FINE STAMPA TABELLE

//FILTRI----------------------------------------------------------------------------------------
//---------------------------------- FILTRI ------------------------------------------------

// function creaFiltroSelezionaCampionato() {
//   //console.log("creazione filtro seleziona campionato in corso...");

//   const containerFiltri = document.getElementById("container-filtri");

//   const TAG_SECTION = document.createElement("section");
//   TAG_SECTION.classList.add("box-filtro"); //ogni filtro va in una section

//   const SELECT_ELEMENT = document.createElement("select"); //creo l'elemento select
//   SELECT_ELEMENT.id = "select-campionato-filter"; //assegno un id all'elemento select

//   const OPTION_ELEMENT = document.createElement("option"); //creo l'opzione
//   OPTION_ELEMENT.value = "TUTTI"; //creo l'opzione tutti
//   OPTION_ELEMENT.textContent = "TUTTI"; //inserisco il testo tutti
//   SELECT_ELEMENT.appendChild(OPTION_ELEMENT);

//   IMPOSTAZIONI.CAMPIONATI.TUTTI.forEach((camp) => {
//     const OPTION_ELEMENT = document.createElement("option");
//     OPTION_ELEMENT.value = camp;
//     OPTION_ELEMENT.textContent = camp;
//     SELECT_ELEMENT.appendChild(OPTION_ELEMENT);
//   });

//   const LABEL_ELEMENT = document.createElement("label");
//   LABEL_ELEMENT.htmlFor = "select-campionato-filter";
//   LABEL_ELEMENT.textContent = "Lega";
//   containerFiltri.append(TAG_SECTION);
//   TAG_SECTION.appendChild(LABEL_ELEMENT);
//   SELECT_ELEMENT.value = filtroCampionato;

//   TAG_SECTION.appendChild(SELECT_ELEMENT);

//console.log("creazione filtro seleziona campionato completata.");
//}
function creaFiltroSelezionaCampionato2() {
  //console.log("creazione filtro seleziona campionato in corso...");

  containerFiltri.insertAdjacentHTML(
    "beforeend",
    `<section class="box-filtro">
          <label>Lega</label>
          <div><img name="${IMPOSTAZIONI.CAMPIONATI.GIR1}"id="logo-premier" class="logo-campionato" src="./Assets/image/logo_leghe/Logo_premier.png" title="Premier League" alt="Premier League" ></div>
          <div><img name="${IMPOSTAZIONI.CAMPIONATI.GIR2}"id="logo-liga"class="logo-campionato" src="./Assets/image/logo_leghe/Logo_liga.png" title="Liga Spagnola" alt="Liga Spagnola"></div>
          <div><img name="${IMPOSTAZIONI.CAMPIONATI.GIR3}"id="logo-bundesliga"class="logo-campionato" src="./Assets/image/logo_leghe/Logo_Bundesliga.png" title="Bundesliga" alt="Bundesliga"></div>
          <div><img name="${IMPOSTAZIONI.CAMPIONATI.GIR4}"id="logo-ligue1"class="logo-campionato" src="./Assets/image/logo_leghe/Logo_ligue1.png" title="Ligue 1" alt="Ligue 1"></div>
          <div><img name="${IMPOSTAZIONI.CAMPIONATI.GIR5}"id="logo-seriea"class="logo-campionato" src="./Assets/image/logo_leghe/Logo_SerieA.png" title="Serie A" alt="Serie A"></div>
    </section>`,
  );

  //console.log("creazione filtro seleziona campionato completata.");
}
function gestisciFiltroSelezionaCampionato2(evento) {
  const elemento_cliccato = evento.target;
  if (elemento_cliccato.className.includes("logo-campionato")) {
    {
      if (filtroSelezionaCampionato.includes(elemento_cliccato.name)) {
        const indice = filtroSelezionaCampionato.indexOf(
          elemento_cliccato.name,
        );
        filtroSelezionaCampionato.splice(indice, 1);
        elemento_cliccato.classList.remove("selected");
      } else {
        filtroSelezionaCampionato.push(elemento_cliccato.name);
        elemento_cliccato.classList.add("selected");
      }
    }
    chiamaPaginaCliccata();
  }
  console.log(filtroSelezionaCampionato);
}

// function gestisciFiltroSelezionaCampionato(evento) {
//   const elementoSelezionato = evento.target;
//   if (elementoSelezionato.id === "select-campionato-filter") {
//     const valoreSelezionato = elementoSelezionato.value;
//     filtroCampionato = valoreSelezionato;

//     chiamaPaginaCliccata();
//   }
// }

function creaFiltroRuolo() {
  containerFiltri.insertAdjacentHTML(
    "beforeend",
    `
  <section class="box-filtro" id="filtro-ruolo">
    <label>Ruolo</label>
      <div class="ruolo P ${filtroRuolo.P ? "selected" : ""}">P</div>
      <div class="ruolo D ${filtroRuolo.D ? "selected" : ""}">D</div>
      <div class="ruolo C ${filtroRuolo.C ? "selected" : ""}">C</div>
      <div class="ruolo A ${filtroRuolo.A ? "selected" : ""}">A</div>
    </section>
  `,
  );
}
function gestisciFiltroRuolo(evento) {
  //capiamo da dove viene il click e gestiamo solo se proviene da un elemento con classe ruolo
  const elemento_cliccato = evento.target;

  if (
    elemento_cliccato.className == "ruolo" ||
    elemento_cliccato.classList.contains("ruolo")
  ) {
    //verifichiamo che l'elemento cliccato sia quello del filtro ruolo
    const ruolo_cliccato = elemento_cliccato.textContent.trim(); //ci memorizziamo il ruolo

    filtroRuolo[ruolo_cliccato] == true
      ? (filtroRuolo[ruolo_cliccato] = false)
      : (filtroRuolo[ruolo_cliccato] = true); // se filtroruolo è true fallo diventare false, altrimenti essendo falso lo fai diventare true
    elemento_cliccato.classList.contains("selected")
      ? elemento_cliccato.classList.remove("selected")
      : elemento_cliccato.classList.add("selected"); // se l'elemento cliccato ha già la classe selected la rimuovi altrimenti la inserisci

    chiamaPaginaCliccata();
  }
}

function creaFiltroFuoriLista() {
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
  //console.log("Azzero tutte le tabelle precedenti...");
  containerTable.innerHTML = "";
  //console.log("Tabelle azzerate.");
}

function azzeraFiltri() {
  filtroRuolo.P = filtroRuolo.D = filtroRuolo.C = filtroRuolo.A = false; //azzero i filtri selezionati
  filtroMinEMax.filtroMaxSelezionato = filtroMinEMax.filtroMinSelezionato = 0;
  //console.log("Azzero tutti i filtri precedenti...");
  containerFiltri.innerHTML = "";
  //console.log("Filtri azzerati.");
  filtroCaricaFuoriLista = false;
  filtroSelezionaCampionato = [];
}

//ORDINAMENTO TABELLE
function ordinaTabella(evento) {
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

function chiamaPaginaCliccata() {
  switch (TAG_H2.textContent) {
    case "LISTA PRESIDENTI":
      stampaListaPresidenti();
      break;
    case "LISTA SQUADRE":
      stampaRoseComplete();
      break;
    case "LISTA CREDITI RESIDUI":
      stampaListaCreditiResidui();
      break;
    case "LISTA GIOCATORI":
      stampaListaGiocatori();
      break;
    case "LISTA APPARTENENZE":
      stampaListaAppartenenze();
      break;
    case "LISTA SVINCOLATI":
      stampaListaSvincolati();
      break;
    default:
      break;
  }
}

function ruoliFiltrati() {
  let ruoli = [];
  let contatoreFiltroRuoloAttivi = 0;
  for (let key in filtroRuolo) {
    if (filtroRuolo[key]) {
      ruoli.push(key);
      contatoreFiltroRuoloAttivi++;
    }
  }
  if (contatoreFiltroRuoloAttivi == 0) {
    ruoli = ["P", "D", "C", "A"];
  }
  return ruoli;
}

function creaFiltroQuotazioneMinEMax() {
  if (filtroMinEMax.filtroMax == 0) {
    let set_quotazioni = new Set();
    // se FiltroMax è = a 0 significa che non è  stato popolato
    player.forEach((playerCorrente) => {
      set_quotazioni.add(playerCorrente.getQuotazione);
    });

    let arrayOrdinato = Array.from(set_quotazioni).sort(
      (qtCorrente, qtProssima) => {
        return qtCorrente > qtProssima;
      },
    );
    filtroMinEMax.filtroMinSelezionato = filtroMinEMax.filtroMin =
      arrayOrdinato[0];
    filtroMinEMax.filtroMaxSelezionato = filtroMinEMax.filtroMax =
      arrayOrdinato[arrayOrdinato.length - 1];
  }

  //riempiamo i due select in base ai giocatori attualment in memoria
  let popolaMinEMaxHTML = 1; //partiamo da 1 fino al maxQuotazione
  for (let i = 1; i < filtroMinEMax.filtroMax + 1; i++) {
    popolaMinEMaxHTML += "<option>" + i + "</option>";
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
  const OPTIONMIN = TagSelectMin.options;
  const TagSelectMax = document.getElementById("select-qt-max");
  const OPTIONMAX = TagSelectMax.options;

  //imposta il valore minimo selezionato (se non presente usa il primo)
  if (filtroMinEMax.filtroMinSelezionato == 0) {
    TagSelectMin.value = filtroMinEMax.filtroMinSelezionato =
      OPTIONMIN[0].value;
  } else {
    TagSelectMin.value = filtroMinEMax.filtroMinSelezionato.toString();
  }

  //se è la prima volta che lo crea inseriamo nel valore massimo il valore massimo
  //altrimenti inseriamo il valore max selezionato
  if (filtroMinEMax.filtroMaxSelezionato == 0) {
    TagSelectMax.value = filtroMinEMax.filtroMaxSelezionato =
      OPTIONMAX[OPTIONMAX.length - 1].value;
  } else {
    TagSelectMax.value = filtroMinEMax.filtroMaxSelezionato.toString();
  }
}

function gestisciFiltroQuotazioneMinEMax(event) {
  //capiamo se il change proviene dal select min o max

  const TAG = event.target;
  const TAGMAX = document.getElementById("select-qt-max");
  const TAGMIN = document.getElementById("select-qt-min");

  if (TAG.id == "select-qt-max" || TAG.id == "select-qt-min") {
    if (TAG.id == "select-qt-max") {
      //se è stato cambiato il val max
      TAGMAX.value = filtroMinEMax.filtroMaxSelezionato = parseInt(TAG.value);
    } //se è stato cambiato il val min
    else {
      TAGMIN.value = filtroMinEMax.filtroMinSelezionato = parseInt(TAG.value);
    }

    if (
      filtroMinEMax.filtroMinSelezionato > filtroMinEMax.filtroMaxSelezionato ||
      filtroMinEMax.filtroMaxSelezionato < filtroMinEMax.filtroMinSelezionato
    ) {
      TAGMAX.value = filtroMinEMax.filtroMaxSelezionato =
        filtroMinEMax.filtroMax;
    }

    chiamaPaginaCliccata();
  }
}

function checkQuotazione(quotazione = 0) {
  if (
    quotazione >= filtroMinEMax.filtroMinSelezionato &&
    quotazione <= filtroMinEMax.filtroMaxSelezionato
  ) {
    return true;
  } else {
    return false;
  }
}

// function creaFiltroAppartenenzeMax() {
//   let options = "";
//   for (let i = 0; i < IMPOSTAZIONI.REGOLE.MAX_POSSEDUTO + 1; i++) {
//     options += `<option value="${i}"> ${i} </option>`;
//   }

//   containerFiltri.innerHTML += `
//   <section class="box-filtro">
//     <label>Appartenenze Max</label>
//     <select id="select-appartenenze">
//       ${options}
//     </select>
//   </section>`;
//   document.getElementById("select-appartenenze").value=filtroAppartenenzeMax;
// }
// function gestisciFiltroAppartenenze(event) {

//   //capiamo se il change proviene dal select min o max

//   const TAG = event.target;

//   if(TAG.id == "select-appartenenze")
//   {
//     filtroAppartenenzeMax = TAG.value;
//   }
//   console.log(filtroAppartenenzeMax);

// }
