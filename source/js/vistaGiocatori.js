import { Giocatore, Rosa, RecordAcquisto } from "./classiFanta.js";
import { IMPOSTAZIONI } from "./impostazioni.js";
import { toCapitalize } from "./funzioniAgo.js";
import { STATO_FILTRI } from "./filtri.js";
import { SQUADRA_UTENTE } from "./gestioneUtente.js";
import { player, acquisti, presidenti } from "../js/script.js";

const containerTable = document.getElementById("container-table");
containerTable.addEventListener("click", gestisciClickRigaGiocatore);
const TAG_H2 = document.querySelector("h2");
let modalStatistiche = null;

export function stampaListaGiocatori(
  cbPaginaDaRendereVisibile,
  cbAzzeraFiltri,
  cbCreaFiltriPaginaGiocatoriSeMancante,
  cbAzzeraTabelle,
  cbApplicaFiltriGiocatori,
) {
  cbPaginaDaRendereVisibile("dati");
  if (TAG_H2.dataset.action != "apri-lista-giocatori") {
    //se viene da un'altra pagina possiamo azzerare i filtri
    cbAzzeraFiltri();
  }
  TAG_H2.dataset.action = "apri-lista-giocatori";
  TAG_H2.textContent = "LISTA GIOCATORI";

  //creiamo i filtri per la pagina giocatori
  cbCreaFiltriPaginaGiocatoriSeMancante();
  cbAzzeraTabelle();

  // console.log("Stampa lista giocatori in corso...");

  const arrayFiltrato = cbApplicaFiltriGiocatori();
  TAG_H2.textContent = `LISTA GIOCATORI - Giocatori caricati ${arrayFiltrato.length}`;

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

      riganuova = `<tr ${classefuorilista} data-nome="${p.getNome}" data-squadra="${p.getSquadraDiAppartenenza}">
        <td><span class="${p.getRuolo}">${p.getRuolo}</span></td>
        <td>${toCapitalize(p.getNome)}${asterisco}</td>`;

      if (p.getFuoriLista) {
        riganuova += "<td></td>";
      } else {
        riganuova += `<td class="squadra-di-appartenenza"><img src="Assets/image/loghi_team_serie_A/${p.getSquadraDiAppartenenza.toLowerCase()}.png"/> ${toCapitalize(p.getSquadraDiAppartenenza)}</td>`;
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

export function stampaListaAppartenenze(
  cbPaginaDaRendereVisibile,
  cbAzzeraFiltri,
  cbCreaFiltriPaginaGiocatoriSeMancante,
  cbAzzeraTabelle,
  cbApplicaFiltriGiocatori,
  containerTable,
) {
  cbPaginaDaRendereVisibile("dati");
  if (TAG_H2.dataset.action != "apri-appartenenze") {
    //se viene da un'altra pagina possiamo azzerare i filtri
    cbAzzeraFiltri();
  }

  TAG_H2.dataset.action = "apri-appartenenze";
  TAG_H2.textContent = "LISTA APPARTENENZE";

  cbCreaFiltriPaginaGiocatoriSeMancante();
  cbAzzeraTabelle();
  //console.log("Stampa lista Appartenenze in corso...");
  const arrayFiltrato = cbApplicaFiltriGiocatori();
  TAG_H2.textContent = `LISTA GIOCATORI appartenenti ad almeno una squadra - Giocatori caricati ${arrayFiltrato.length}`;

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
          tdSquadre1 += sqPos.getNomeRosa + "| ";
          break;
        case IMPOSTAZIONI.CAMPIONATI.GIR2:
          tdSquadre2 += sqPos.getNomeRosa + "| ";
          break;
        case IMPOSTAZIONI.CAMPIONATI.GIR3:
          tdSquadre3 += sqPos.getNomeRosa + "| ";
          break;
        case IMPOSTAZIONI.CAMPIONATI.GIR4:
          tdSquadre4 += sqPos.getNomeRosa + "| ";
          break;
        case IMPOSTAZIONI.CAMPIONATI.GIR5:
          tdSquadre5 += sqPos.getNomeRosa + "| ";
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
          ${toCapitalize(playerCorrente.getSquadraDiAppartenenza)}          
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
export function stampaListaSvincolati(
  cbPaginaDaRendereVisibile,
  cbAzzeraFiltri,
  cbCreaFiltriPaginaSvincolatiSeMancante,
  cbAzzeraTabelle,
  cbApplicaFiltriGiocatori,
  ruoloGiocatore,
) {
  cbPaginaDaRendereVisibile("dati");

  if (TAG_H2.dataset.action != "apri-lista-svincolati") {
    cbAzzeraFiltri();
  }

  TAG_H2.dataset.action = "apri-lista-svincolati";

  cbCreaFiltriPaginaSvincolatiSeMancante();
  //se ruolo è presente significa che viene chiamata dal mercato
  if (ruoloGiocatore) {
    STATO_FILTRI.ruolo.push(ruoloGiocatore);
    const filtroRuolo = document.getElementById("filtro-ruolo");
    filtroRuolo.classList.add("bloccaFiltro");
    const temp = filtroRuolo.querySelector(
      `.ruolo[data-tipo-ruolo=${ruoloGiocatore}]`,
    );

    temp.classList.add("selected");
  }

  cbAzzeraTabelle();

  const arrayFiltrato = cbApplicaFiltriGiocatori();


  /************************************PRENDIAMO IL RIFERIMENTO ALLA SQUADRA LOGGATA 
   * SE LA SQUADRA LOGGATA HA UN GIOCATORE DALLA LISTA SVINCOLATI, LO ESCLUDIAMO
  */
  const presidenteLoggato=presidenti.find((presidenteCorrente) => {
    return presidenteCorrente.getNomeRosa == SQUADRA_UTENTE;
  });
  //presidenteLoggato è il riferimento al presidente
   let arrayGiocatoriPresidente=[];
   presidenteLoggato.getTuttiGliSlot.forEach((giocatoreCorrente) => {
    if (giocatoreCorrente != null)
    {
      arrayGiocatoriPresidente.push(giocatoreCorrente.getDatiGiocatore);
    }
  });
//********************************************************************************** */


  let rigaHTML = ""; //azzeriamo la riga che andremo ad inserire successivamente nel body

  let contaGiocatori = 0; //contatore giocatori

  arrayFiltrato.forEach((pl) => {
    if (pl.getCopieDisponibili > 0 && pl.getFuoriLista == false && !arrayGiocatoriPresidente.includes(pl)) { //se c'è almeno una copia disponibile e non è un fuori lista e non è presente nella squadra loggata puoi stampare

      
      rigaHTML += `<tr data-nome="${pl.getNome}" data-squadra="${pl.getSquadraDiAppartenenza}">
          <td><span class="${pl.getRuolo}">${pl.getRuolo}</span></td>
          <td data-name="${pl.getNome}">${pl.getNome}</td>`;
      rigaHTML +=
        pl.getSquadraDiAppartenenza == ""
          ? "<td></td>"
          : `<td class="squadra-di-appartenenza"><img src="Assets/image/loghi_team_serie_A/${pl.getSquadraDiAppartenenza.toLowerCase()}.png"/> ${toCapitalize(pl.getSquadraDiAppartenenza)}</td>`;
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
  TAG_H2.textContent = `LISTA GIOCATORI SVINCOLATI- Giocatori caricati ${contaGiocatori}`;
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

function gestisciClickRigaGiocatore(e) {
  const trCliccata = e.target.closest("tr");
  if (!trCliccata && trCliccata.dataset.nome!=null) return; //se non è stato cliccato su una tr esci

  popupStatisticheGiocatore(nomeToGiocatore(trCliccata.dataset.nome));

  //logica per chiamare la card del giocatore
}

export function popupStatisticheGiocatore(giocatore) {
  console.log(giocatore);
  if (!giocatore) return; //controllo sicurezza

  // 1. Controlliamo se il popup esiste già nel documento
  modalStatistiche = document.getElementById("modal-statistiche");
  let popupStatistiche = document.getElementById("popup-statistiche");
  if (!modalStatistiche) // se non esiste lo creiamo
  {
    modalStatistiche = document.createElement("div");
    modalStatistiche.id = "modal-statistiche";
    document.querySelector("body").append(modalStatistiche);
    modalStatistiche.addEventListener("click", gestisciClickAnnulla);
    modalStatistiche.addEventListener("keydown", gestisciClickAnnulla);
    modalStatistiche.setAttribute("tabindex", "-1");
    modalStatistiche.focus();

    //adesso creiamo il popup vero è proprio
    popupStatistiche = document.createElement("div");
    popupStatistiche.id = "popup-statistiche";
    modalStatistiche.append(popupStatistiche);
  } else {
    //se esiste lo rendiamo visibile
    modalStatistiche.style.display = "flex";
  }

  //ci ricaviamo i possessi che andremo a mettere in una tabella
  let righeTabella = "";
  let tabella="";


  const contaPossessi = giocatore.getPossessi.length;
  if(contaPossessi>0)
  {
  giocatore.getPossessi.forEach((possessoCorrente) => {
    righeTabella += `<tr>
                        <td> ${possessoCorrente.getNomeRosa}</td> 
                        <td> ${possessoCorrente.getCampionatoDiAppartenenza}</td>
                        <td> ${possessoCorrente.giocatoreToCosto(giocatore)}</td>  
                        
                      </tr>`;
  });

  //costruiamo la tabella
  tabella = `<table>
                  <thead>
                    <th>Squadra</th>
                    <th>Campionato</th>
                    <th>Costo</th>
                  </thead>
                  <tbody>
                    ${righeTabella}
                  </tbody>
                </table>`;
  }
  else
  {
    // se i possessi sono 0 avvisiamo che non è posseduto
    tabella=` Nessuna squadra possiede ${giocatore.getNome}`;
  }

  

  popupStatistiche.innerHTML = `
    <div>
      <div class="x"> X </div>
      <div>Nome: ${giocatore.getNome}</div>
      <div>Squadra: ${giocatore.getSquadraDiAppartenenza}</div>
      <div>Quotazione: ${giocatore.getQuotazione}</div>
      <hr></hr>
      <div>Presenze: ${giocatore.getPresenze}</div>
      <div> Media Voto:  ${giocatore.getMv}</div>
      <div> Fanta Media Voto :  ${giocatore.getFvm} </div>
      <hr></hr>
      
      <div> Squadre che lo posseggono </div>
      ${tabella}
    </div>`;
}
/**
 * passando una stringa con il nome del giocatore restituisce il riferimento al giocatore
 * @param {string} nomeGiocatore
 * @returns {Giocatore} ritorna il giocatore di riferimento
 */
function nomeToGiocatore(nomeGiocatore) {
  if (!nomeGiocatore) return;
  nomeGiocatore = nomeGiocatore.toUpperCase(); //trasformiamo il nome in maiuscolo
  const giocatoreTrovato = player.find((giocatoreCorrente) => {
    return giocatoreCorrente.getNome == nomeGiocatore;
  });
  return giocatoreTrovato;
}

function gestisciClickAnnulla(e) {
  console.log(e);
  if (!e.target.closest(".x") && e.key != "Escape") return; //controllo sicurezza


  const popupStatistiche = document.getElementById("popup-statistiche");
  if (!popupStatistiche) return;

  popupStatistiche.innerHTML = ""; //pulisco il box
  popupStatistiche.parentNode.style.display = "none"; //nascondo il modal
}


