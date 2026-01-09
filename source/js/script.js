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
let filtroCampionato = "TUTTI";
containerFiltri.addEventListener("change", gestisciFiltroCampionato);
containerFiltri.addEventListener("click", gestisciFiltroRuolo);

let filtroRuolo = {
  //qui memorizzeremo i cambi stati deli ruoli
  P: true,
  D: true,
  C: true,
  A: true,
};

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

  const response = await fetch("Assets/file/quotazioni_gg19.txt");
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
          temp[13]
        )
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
        tempPrezzoAcquisto
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
  filtroCampionato = "TUTTI";
  TAG_H2.textContent = "LISTA PRESIDENTI";
  azzeraTabelle();
  azzeraFiltri();
  creaFiltroSelezionaCampionato();
  stampaListaPresidenti();
}

function paginaRoseComplete() {
  filtroCampionato = "TUTTI";
  TAG_H2.textContent = "ROSE COMPLETE";
  azzeraFiltri();
  azzeraTabelle();
  creaFiltroSelezionaCampionato();
  creaFiltroRuolo();
  stampaRoseComplete();
}
function paginaGiocatori() {
  TAG_H2.textContent = "PAGINA GIOCATORI";
  azzeraFiltri();
  azzeraTabelle();
  creaFiltroRuolo();
  stampaListaGiocatori();
}

function paginaAppartenenze() {
  filtroCampionato = "TUTTI";
  TAG_H2.textContent = "LISTA APPARTENENZE";
  azzeraFiltri();
  azzeraTabelle();
  creaFiltroRuolo();
  stampaListaAppartenenze();
}

function paginaSvincolati() {
  TAG_H2.textContent = "LISTA SVINCOLATI";
  azzeraFiltri();
  azzeraTabelle();
  azzeraFiltri();
  creaFiltroRuolo();
  stampaListaSvincolati();
}

function paginaCreditiResidui() {
  filtroCampionato = "TUTTI";
  TAG_H2.textContent = "LISTA CREDITI RESIDUI";
  azzeraFiltri();
  azzeraTabelle();
  creaFiltroSelezionaCampionato();
  stampaListaCreditiResidui();
}

function paginaMercato() {
  filtroCampionato = "TUTTI";
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
    if (filtroCampionato == "TUTTI" || filtroCampionato == camp) {
      //se il filtro è tutti oppure il campionato corrente è uguale al filtro procedi

      const TAG_TABLE = document.createElement("table"); //creiamo l'elemento table
      const TAG_THEAD = document.createElement("thead"); //creiamo l'elemento thead
      const TAG_TBODY = document.createElement("tbody"); //creiamo l'elemento tbody
      let rigaHTML = "";
      // inizializziamo la riga di intestazione delle tabella
      TAG_THEAD.innerHTML = `<tr> <th colspan="2">${toCapitalize(
        camp
      )}</th></tr> 
                            <tr>
                            <th> Squadra </th> 
                            <th> Presidente </th>                           
                            </tr>`;

      //ricaviamoci solo i presidenti del campionato attuale
      const presidentiFiltrati = presidenti.filter(
        (item) => item.getCampionatoDiAppartenenza == camp
      );

      //scorri la lista presidenti ed inserisci ogni presidente nella tabella
      presidentiFiltrati.forEach((presidente) => {
        rigaHTML += `<tr>
                      <td> ${toCapitalize(presidente.getNomeRosa)} </td>
                      <td> ${toCapitalize(
                        presidente.getNomePresidente
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
 // console.log("Stampa rose complete in corso...");

  TAG_H2.textContent = "ROSE COMPLETE";
  azzeraTabelle();

  //scorriamo la lista dei presodenti e per ogni presidente verifichiamo tutti gli acquisti
  presidenti.forEach((presidenti) => {
    const TAG_TABLE = document.createElement("table"); //creazione tabella
    const TAG_TBODY = document.createElement("tbody"); //creazione tbody
    const TAG_THEAD = document.createElement("thead"); //creazione thead
    const TAG_TFOOT = document.createElement("tfoot"); //creazione thead
    TAG_TABLE.append(TAG_THEAD, TAG_TBODY, TAG_TFOOT);
    let rigaHtml = "";
    //per ogni presidente mi creo una tabella
    //verifica dei presidenti
    if (
      filtroCampionato == "TUTTI" ||
      presidenti.getCampionatoDiAppartenenza == filtroCampionato
    ) {
      //aggiungo fli elementi thead e tbody e tfoot all'interno della tabella

      //in thead ci vado a mettere il nome della squadra
      // il nome del presidente
      // il nome del campionato di appartenenza

      TAG_THEAD.innerHTML = `<tr>
      <th colspan="6"> ${toCapitalize(presidenti.getNomeRosa)} </th>
    </tr>
    <tr>
      <th colspan="6"> ${toCapitalize(presidenti.getNomePresidente)} </th>
    </tr>
    <tr>
      <th colspan="6"> ${toCapitalize(
        presidenti.getCampionatoDiAppartenenza
      )} </th>
    </tr>
    <tr>
      <th>Ruolo</th><th>Nome</th><th>Squadra</th><th>Qt</th><th>Costo Acq.</th><th>Costo Svi.</th>
    </tr>`;
      //aggiungo la tabella al nodo passato
      containerTable.appendChild(TAG_TABLE);

      //PASSO 2

      //per ogni rosa dobbiamo stampare i record di acquisto e aggiungerli alla rigahtml
      presidenti.getTuttiGliSlot.forEach((rec) => {
        if (rec == null) {
          rigaHtml += "<tr><tr>";
        } else {
          // se il giocatore ha come fuorilista true, significa che non gioca più in serie a lo flaggo con la classe fuorilista
          // questo permette di farlo diventare in grigio durante la visualizzazione
          const fuorilista = rec.getDatiGiocatore.getFuoriLista
            ? "class='fuorilista'"
            : "";
          rigaHtml += `
              <tr ${fuorilista}>
                <td>${rec.getDatiGiocatore.getRuolo}</td>
                <td>${toCapitalize(rec.getDatiGiocatore.getNome)}</td>
                <td>${toCapitalize(
                  rec.getDatiGiocatore.getSquadraDiAppartenenza
                )}</td>
                <td>${rec.getDatiGiocatore.getQuotazione}</td>
                <td>${rec.getCostoDiAcquisto}</td>
                <td>${Math.ceil(
                  (rec.getCostoDiAcquisto +
                    rec.getDatiGiocatore.getQuotazione) /
                    2
                )}</td>
              </tr>`;
        }
      });
    }

    // FINE FOREACH SUGLI ACQUISTI

    TAG_TBODY.innerHTML = rigaHtml;
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
    `;
  });
  //console.log("Stampa rose complete completata.");
}

function stampaListaGiocatori() {
 // console.log("Stampa lista giocatori in corso...");
  azzeraTabelle();

  TAG_H2.textContent = "LISTA GIOCATORI";
  const TAG_TABLE = document.createElement("table"); //creiamo l'elemento table
  const TAG_THEAD = document.createElement("thead"); //creiamo l'elemento thead
  const TAG_TBODY = document.createElement("tbody"); //creiamo l'elemento tbody
  TAG_THEAD.innerHTML = `<tr>
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

  const ruoli = ["P", "D", "C", "A"];
  let rigaHTML = ""; //azzeriamo la riga che andremo ad inserire successivamente nel body

  ruoli.forEach((ruoloCorrente) => {
    //scorriamo la lista dei ruoli

    // inizializziamo la riga di intestazione delle tabella

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
      let riganuova="";
      const caricoFuoriLista =
      IMPOSTAZIONI.OPZIONI_LEGHE.CARICAMENTO_FUORI_LISTA; //true carica , false non caricare

      
      
      riganuova = `<tr ${classefuorilista}>
        <td>${p.getRuolo}</td>
        <td>${toCapitalize(p.getNome)}</td>
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

      //test1
      //caricoFuoriLista = true
      //p.getFuoriLista = false

      //test2
      //caricoFuoriLista = true
      //p.getFuoriLista = true

      //test3
      //caricoFuoriLista = false
      //p.getFuoriLista = false

      //test4
      //caricoFuoriLista = false
      //p.getFuoriLista = true

      //true- false
      if((p.getFuoriLista && caricoFuoriLista)||(!p.getFuoriLista )) //se il giocatore attuale è un fuorilista e nelle impostazioni caricafuorilista è true
      {
          rigaHTML+=riganuova; //caso2 ok
      }      
      else if(!caricoFuoriLista && p.getFuoriLista)  //se nelle impostazioni c'è false in caricafuorilista
      {
          rigaHTML+=""; //caso 3 ok
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

  const ruoli = ["P", "D", "C", "A"];

  //scorriamo per ruolo
  ruoli.forEach((ruoloCorrente) => {
    let rigaHTML = ""; //azzeriamo la riga che andremo ad inserire successivamente nel body

    //per ogni ruolo creiamo una tabella
    const TAG_TABLE = document.createElement("table");
    const TAG_THEAD = document.createElement("thead");
    const TAG_TBODY = document.createElement("tbody");

    //inseriamo l'intestazione della tabella
    TAG_THEAD.innerHTML = `<tr >
      <th colspan="5">
      ${ruoloCorrente}
      </th>
      </tr>
      <tr>
        <th>
          Ruolo
        </th>
        <th>
          Nome
        </th>
        <th>
        Squadra
        </th>
        <th>
        Numero Appartenenze
        </th>
        <th>
        Squadre che lo possegono
        </th>
    </tr>`;

    //adesso scorriamo la lista dei giocatori, e per ogni giocatore preleviamo le squadre che lo posseggono
    let playerRuoloCorrente = player.filter((p) => {
      return p.getRuolo == ruoloCorrente;
    }); //playerRuoloCorrente è un array con tutti i giocatori del ruolo corrente

    //scorriamo il nuovo array filtrato per ruolo e lo inseriamo nella riga che andremo ad inserire nel tbody
    playerRuoloCorrente.forEach((playerCorrente) => {
      let tdSquadre = "";
      playerCorrente.getPossessi.forEach((sqPos) => {
        tdSquadre += toCapitalize(sqPos.getNomeRosa) + ", ";
      });

      rigaHTML += `
      <tr>
        <td>
          ${playerCorrente.getRuolo}
        </td>
        <td>
          ${toCapitalize(playerCorrente.getNome)}
        </td>
        <td>
          ${toCapitalize(playerCorrente.getSquadraDiAppartenenza)}
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

    TAG_TBODY.innerHTML = rigaHTML;
    TAG_TABLE.append(TAG_THEAD, TAG_TBODY);
    containerTable.appendChild(TAG_TABLE);
  });
}
function stampaListaSvincolati() {
  //console.log("Stampa lista Svincolati in corso...");

  TAG_H2.textContent = "LISTA SVINCOLATI";

  azzeraTabelle(); //azzeriamo tutte le tabelle precedenti

  const ruoli = ["P", "D", "C", "A"];

  ruoli.forEach((ruoloCorrente) => {
    //scorriamo la lista dei ruoli
    const theadTemp = `<tr><th colspan="6">${ruoloCorrente}</tr>
    <tr>
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
    let rigaHTML = ""; //azzeriamo la riga che andremo ad inserire successivamente nel body

    const giocatoriFiltratiDalRuolo = player.filter((giocatoriFiltrati) => {
      return giocatoriFiltrati.getRuolo == ruoloCorrente;
    });

    giocatoriFiltratiDalRuolo.forEach((pl) => {
      if (pl.getCopieDisponibili > 0 && pl.getRuolo == ruoloCorrente) {
        rigaHTML += `<tr>
          <td>${pl.getRuolo}</td>
          <td>${pl.getNome}</td>
          <td>${pl.getSquadraDiAppartenenza}</td>
          <td>${pl.getQuotazione}</td>
          <td>${pl.getCopieOccupate}/${IMPOSTAZIONI.REGOLE.MAX_POSSEDUTO} - liberi:${pl.getCopieDisponibili}</td>
          <td><img src="Assets/image/ricerca_possessi.png" class="icona-ricerca-possessi" title="${pl.getNome} ha ${pl.getCopieDisponibili} copie disponibili"/> </td>
        </tr>`;
      }
    });

    containerTable.appendChild(TAG_TABLE); //aggiungiamo la tabella nel contenitore passato
    TAG_TBODY.innerHTML = rigaHTML; //inseriamo il contenuto del tbody
    TAG_TABLE.append(TAG_THEAD, TAG_TBODY); //inseriamo thead e tbody nella tabella
  });

  //console.log("Stampa lista svincolaticompletata.");
}
function stampaListaCreditiResidui() {
  //console.log("Stampa lista crediti residui in corso...");
  azzeraTabelle(); //azzeriamo tutte le tabelle precedenti
  IMPOSTAZIONI.CAMPIONATI.TUTTI.forEach((camp) => {
    if (camp) {
      if (filtroCampionato == "TUTTI" || filtroCampionato == camp) {
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
      <tr>
        <th>Squadra</th>
        <th>Nome Presidente</th>
        <th>Crediti Residui</th>
      </tr>`;

        //ad ogni campionato dobbiamo trovare le squadre che ne fanno parte
        //camp contiene il nome del campionato di riferimento

        const squadreFiltrate = presidenti.filter(
          (item) => item.getCampionatoDiAppartenenza == camp
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

function creaFiltroSelezionaCampionato() {
  //console.log("creazione filtro seleziona campionato in corso...");

  const containerFiltri = document.getElementById("container-filtri");

  const TAG_SECTION = document.createElement("section");
  TAG_SECTION.classList.add("box-filtro"); //ogni filtro va in una section

  const SELECT_ELEMENT = document.createElement("select"); //creo l'elemento select
  SELECT_ELEMENT.id = "select-campionato-filter"; //assegno un id all'elemento select

  const OPTION_ELEMENT = document.createElement("option"); //creo l'opzione
  OPTION_ELEMENT.value = "TUTTI"; //creo l'opzione tutti
  OPTION_ELEMENT.textContent = "TUTTI"; //inserisco il testo tutti
  SELECT_ELEMENT.appendChild(OPTION_ELEMENT);

  IMPOSTAZIONI.CAMPIONATI.TUTTI.forEach((camp) => {
    const OPTION_ELEMENT = document.createElement("option");
    OPTION_ELEMENT.value = camp;
    OPTION_ELEMENT.textContent = camp;
    SELECT_ELEMENT.appendChild(OPTION_ELEMENT);
  });

  const LABEL_ELEMENT = document.createElement("label");
  LABEL_ELEMENT.htmlFor = "select-campionato-filter";
  LABEL_ELEMENT.textContent = "Lega";
  containerFiltri.append(TAG_SECTION);
  TAG_SECTION.appendChild(LABEL_ELEMENT);
  SELECT_ELEMENT.value = filtroCampionato;

  TAG_SECTION.appendChild(SELECT_ELEMENT);

  //console.log("creazione filtro seleziona campionato completata.");
}

function gestisciFiltroCampionato(evento) {
  const elementoSelezionato = evento.target;
  if (elementoSelezionato.id === "select-campionato-filter") {
    const valoreSelezionato = elementoSelezionato.value;
    filtroCampionato = valoreSelezionato;

    chiamaPaginaCliccata();
  }
}

function creaFiltroRuolo() {
  containerFiltri.innerHTML += `
  <section class="box-filtro" id="filtro-ruolo">
    <label>Ruolo</label>
      <div class="ruolo selected" >P</div>
      <div class="ruolo" >D</div>
      <div class="ruolo" >C</div>
      <div class="ruolo" >A</div>
    </section>
  `;
}

function gestisciFiltroRuolo(evento) {
  //capiamo da dove viene il click e gestiamo solo se proviene da un elemento con classe ruolo

  if (evento.target.className == "ruolo") {
    evento.target.classList.forEach((classe) => {
      if (classe == "selected") {
        classe.classList.remove("selected");
      }
    });
  }

  //console.log(evento.target.classList[1]);
}

function caricaGiornateinHTML() {
  //console.log("Caricamento giornate in HTML in corso...");

  const CONTAINER_GIORNATE = document.getElementById("container-giornate");

  for (let i = 1; i <= IMPOSTAZIONI.OPZIONI_LEGHE.NUMERO_GIORNATE; i++) {
    const DIV_GIORNATA = document.createElement("div");
    CONTAINER_GIORNATE.appendChild(DIV_GIORNATA);
    DIV_GIORNATA.innerHTML = i;
  }

  //console.log("Caricamento giornate in HTML completato.");
}

function azzeraTabelle() {
  //console.log("Azzero tutte le tabelle precedenti...");
  containerTable.innerHTML = "";
  //console.log("Tabelle azzerate.");
}

function azzeraFiltri() {
  //console.log("Azzero tutti i filtri precedenti...");
  containerFiltri.innerHTML = "";
  //console.log("Filtri azzerati.");
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
    case "ROSE COMPLETE":
      stampaRoseComplete();
      break;
    case "LISTA CREDITI RESIDUI":
      stampaListaCreditiResidui();
      break;
    default:
      break;
  }
}
