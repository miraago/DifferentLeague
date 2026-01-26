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
containerFiltri.addEventListener("click", gestisciFiltroTeam);
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
  filtroMin: 1,
  filtroMax: 1,
  filtroMinSelezionato: 1,
  filtroMaxSelezionato: 1,
};
let filtroSelezionaCampionato = [];
let filtroSelezionaSquadra = [];

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
  console.log("Tutto caricato");
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

  console.log(
    "📥 File caricato - Righe totali:",
    arrayGiocatori.length,
    "Bytes:",
    datiGiocatori.length,
  );

  let recordInvalidi = 0;

  for (let i = 1; i < arrayGiocatori.length; i++) {
    temp = arrayGiocatori[i].split("|");

    if (temp.length > 1) {
      //temp.length > 1 il record non è vuoto

      // Verifica se il record ha almeno 14 campi
      if (temp.length < 14) {
        console.warn(
          `Record ${i} ha solo ${temp.length} campi:`,
          temp[0],
          temp[1],
        );
        recordInvalidi++;
        continue;
      }

      player.push(
        new Giocatore(
          temp[0], //id
          temp[1], //nome
          temp[2], //squadra di appartenenza
          temp[3], //ruolo
          temp[4], //ruolo mantra
          temp[5], //fuorilista
          temp[6], //quotazione
          temp[7],
          temp[8],
          temp[9],
          temp[10],
          temp[11],
          temp[12],
          temp[13],
        ),
      );
      const qtPlayerAttuale = parseInt(temp[6]);
      //aggiornamento min e max quotazione
      if (filtroMinEMax.filtroMax < qtPlayerAttuale) {
        filtroMinEMax.filtroMaxSelezionato = filtroMinEMax.filtroMax =
          qtPlayerAttuale;
      }
    }
  }
  console.log(
    "✅ Giocatori caricati:",
    player.length,
    "| Record invalidi:",
    recordInvalidi,
  );
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
  creaFiltroTeam();
  creaFiltroFuoriLista();
  stampaRoseComplete();
}
function paginaGiocatori() {
  TAG_H2.textContent = "LISTA GIOCATORI";
  azzeraFiltri();
  azzeraTabelle();
  creaFiltroRuolo();
  creaFiltroQuotazioneMinEMax();
  creaFiltroTeam();
  creaFiltroFuoriLista();
  stampaListaGiocatori();
}

function paginaAppartenenze() {
  TAG_H2.textContent = "LISTA APPARTENENZE";
  azzeraFiltri();
  azzeraTabelle();
  creaFiltroRuolo();
  creaFiltroQuotazioneMinEMax();
  creaFiltroTeam();
  creaFiltroFuoriLista();
  stampaListaAppartenenze();
}

function paginaSvincolati() {
  TAG_H2.textContent = "LISTA SVINCOLATI";
  azzeraFiltri();
  azzeraTabelle();
  creaFiltroRuolo();
  creaFiltroQuotazioneMinEMax();
  creaFiltroTeam();
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
  // azzeraTabelle(); //azzeriamo tutte le tabelle precedenti

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
                <td  class="squadra-di-appartenenza"> <img src="Assets/image/loghi_team_serie_A/${giocatoreCorrente.getDatiGiocatore.getSquadraDiAppartenenza.toLowerCase()}.png"/> 
                ${toCapitalize(
                  giocatoreCorrente.getDatiGiocatore.getSquadraDiAppartenenza,
                )}</td>
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
          <div class="campo-campionato-di-appartenenza">${toCapitalize(rosaCorrente.getCampionatoDiAppartenenza)}</div>
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
  // console.log("Stampa lista giocatori in corso...");
  const arrayFiltrato = applicaFiltriGiocatori();

  //SE DOPO I FILTRI APPLICATI C'è ALMENO UN GIOCATORE
  if (arrayFiltrato.length > 0) {
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
    TAG_H2.textContent = "LISTA GIOCATORI";
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
  //console.log("Stampa lista Svincolati in corso...");
  const arrayFiltrato = applicaFiltriGiocatori();

  TAG_H2.textContent = "LISTA SVINCOLATI";

  azzeraTabelle(); //azzeriamo tutte le tabelle precedenti

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
          : `<td class="squadra-di-appartenenza">${pl.getSquadraDiAppartenenza}</td>`;
      rigaHTML += `          
          <td class="cella-quotazione"><img src="Assets/icone/soldi.png"/>${pl.getQuotazione}</td>
          <td>${pl.getCopieOccupate}/${IMPOSTAZIONI.REGOLE.MAX_POSSEDUTO} - liberi:${pl.getCopieDisponibili}</td>
          <td><img src="Assets/image/ricerca_possessi.png" class="icona-ricerca-possessi" title="${pl.getNome} ha ${pl.getCopieDisponibili} copie disponibili"/> </td>
        </tr>`;
      contaGiocatori++;
    }
  });
  if (contaGiocatori > 0) {
    const theadTemp = `<tr><th colspan="6">LISTA GIOCATORI SVINCOLATI</tr>
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
  } else {
    containerTable.textContent =
      "⚠ ⚠ ⚠ ... Nessun giocatore corrisponde ai filtri impostati";
  }

  //console.log("Stampa lista svincolaticompletata.");
}

function stampaListaCreditiResidui() {
  //console.log("Stampa lista crediti residui in corso...");
  azzeraTabelle(); //azzeriamo tutte le tabelle precedenti
  let tbody = "";
  const arrayTeamsFiltrati = applicaFiltroTeams();
  //ordiniamo la lista da chi ha più crediti a chi ha meno crediti
  const squadreFiltrate = arrayTeamsFiltrati.sort((sqA, sqB) => {
    return sqB.getCreditiResidui - sqA.getCreditiResidui;
  });

  arrayTeamsFiltrati.forEach((teamsAttuale) => {
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
        </tr>
        `;
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
        </tr>`;

  containerTable.appendChild(TAG_TABLE); //inseriamo la tabella nel contenitore
  TAG_TABLE.append(TAG_THEAD, TAG_TBODY); //inseriamo thead e tbody nella tabella

  //console.log("Stampa lista crediti residui Terminata");
}

//FINE STAMPA TABELLA

//FILTRI----------------------------------------------------------------------------------------
//---------------------------------- FILTRI ------------------------------------------------

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
}

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
  filtroMinEMax.filtroMaxSelezionato = filtroMinEMax.filtroMax;
  filtroMinEMax.filtroMinSelezionato = filtroMinEMax.filtroMin;
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

function creaFiltroTeam() {
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

  containerFiltri.insertAdjacentHTML("beforeend", rigadicostruzionefiltrisquadre);
}
function gestisciFiltroTeam(evento) {
  const elemento_cliccato = evento.target;
  const nodo_parente = evento.target.parentElement;

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
    }
    chiamaPaginaCliccata();
  }
}

function creaFiltroQuotazioneMinEMax() {
  console.log(filtroMinEMax);

  //riempiamo i due select in base ai giocatori attualment in memoria
  let popolaMinEMaxHTML=""; //partiamo da 1 fino al maxQuotazione
  for (let i = 0; i < parseInt(filtroMinEMax.filtroMax); i++) {
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
 
    TagSelectMin.value = filtroMinEMax.filtroMinSelezionato;
    TagSelectMax.value = filtroMinEMax.filtroMaxSelezionato;
  
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

function applicaFiltriGiocatori() {
  let arrayFiltrato;

  azzeraTabelle();

  //APPLICAZIONE FILTRI

  arrayFiltrato = player.filter((giocatoreCorrente) => {
    return ruoliFiltrati().includes(giocatoreCorrente.getRuolo);
  });

  //filtra per ruolo
  arrayFiltrato = arrayFiltrato.filter((giocatoreCorrente) => {
    return ruoliFiltrati().includes(giocatoreCorrente.getRuolo);
  });

  //filtro per quotazione
  arrayFiltrato = arrayFiltrato.filter((giocatoreCorrente) => {
    return checkQuotazione(giocatoreCorrente.getQuotazione);
  });

  //filtro per squadra
  arrayFiltrato = arrayFiltrato.filter((giocatoreCorrente) => {
    if (filtroSelezionaSquadra.length == 0) {
      return true;
    } else {
      return filtroSelezionaSquadra.includes(
        giocatoreCorrente.getSquadraDiAppartenenza.toLowerCase(),
      );
    }
  });

  //filto per escludere o meno i fuorilista, se il filtro fuorilista è false applichiamo il filtro escludendo i fuorilista
  if (!filtroCaricaFuoriLista) {
    //escludi i fuorilista
    arrayFiltrato = arrayFiltrato.filter((giocatoreCorrente) => {
      return !giocatoreCorrente.getFuoriLista;
    });
  }

  return arrayFiltrato;
}

function applicaFiltroTeams() {
  azzeraTabelle();

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
