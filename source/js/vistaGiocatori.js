import { Giocatore, Rosa, RecordAcquisto } from "./classiFanta.js";
import { IMPOSTAZIONI } from "./impostazioni.js";
import { toCapitalize } from "./funzioniAgo.js";
import { STATO_FILTRI } from "./filtri.js";
import { SQUADRA_UTENTE } from "./gestioneUtente.js";
import { player, acquisti, presidenti } from "../js/script.js";

const containerTable = document.getElementById("container-table");

const TAG_H2 = document.querySelector("h2");

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
  //TAG_H2.textContent = "LISTA GIOCATORI";

  //creiamo i filtri per la pagina giocatori
  cbCreaFiltriPaginaGiocatoriSeMancante();
  cbAzzeraTabelle();

  // console.log("Stampa lista giocatori in corso...");
  const arrayDaStampare = cbApplicaFiltriGiocatori();
  creaTabellaGiocatori(arrayDaStampare, "Lista Giocatori");
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

  let arrayFiltrato = cbApplicaFiltriGiocatori();

  /************************************PRENDIAMO IL RIFERIMENTO ALLA SQUADRA LOGGATA
   * SE LA SQUADRA LOGGATA HA UN GIOCATORE DALLA LISTA SVINCOLATI, LO ESCLUDIAMO
   */
  const presidenteLoggato = presidenti.find((presidenteCorrente) => {
    return presidenteCorrente.getNomeRosa == SQUADRA_UTENTE;
  });
  //presidenteLoggato è il riferimento al presidente

  let arrayGiocatoriPresidente = [];
  presidenteLoggato.getTuttiGliSlot.forEach((giocatoreCorrente) => {
    if (giocatoreCorrente != null) {
      arrayGiocatoriPresidente.push(giocatoreCorrente.getDatiGiocatore);
    }
  });
  //********************************************************************************** */

  let arrayFiltratoSoloSvincolati = [];
  arrayFiltrato.forEach((giocatoreCorrente) => {
    if (
      //se c'è almeno una copia disponibile e non è un fuori lista e non è presente nella squadra loggata puoi salvare
      giocatoreCorrente.getCopieDisponibili > 0 &&
      giocatoreCorrente.getFuoriLista == false &&
      !arrayGiocatoriPresidente.includes(giocatoreCorrente)
    ) {
      arrayFiltratoSoloSvincolati.push(giocatoreCorrente);
    }
  });

  creaTabellaGiocatori(arrayFiltratoSoloSvincolati, "Lista Svincolati");
}

function creaTabellaGiocatori(arrayFiltrato, titoloTabella = "Lista") {
  //TAG_H2.textContent = `${titoloTabella} - Giocatori caricati:  ${arrayFiltrato.length}`;

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
        riganuova += `<td class="cella-squadra-di-appartenenza"><img src="Assets/image/loghi_team_serie_A/${p.getSquadraDiAppartenenza.toLowerCase()}.png"/> <span class="nome-squadra">${toCapitalize(p.getSquadraDiAppartenenza)}</span></td>`;
      }
      riganuova += `<td class="cella-quotazione"><img src="Assets/icone/soldi.png"/>${p.getQuotazione}</td>
        <td>${p.getPresenze}</td>
        <td>${p.getGoalTotali}</td>
        <td>${p.getAssistTotali}</td>
        <td>${p.getMv}</td>
        <td>${p.getFvm}</td>
        <td>${p.getSommaBonusMalus}</td>
        <td class="colonna-pre5">${p.getPresenzeUltime5}</td>
        <td class="colonna-MV5">${p.getMvUltime5}</td>
        <td class="colonna-FMV5">${p.getFvmUltime5}</td>
        <td class="colonna-BM5">${p.getSommaBonusMalusUltime5}</td>
        <td class="colonna-possesso">${p.getCopieOccupate}/${IMPOSTAZIONI.REGOLE.MAX_POSSEDUTO} - liberi:${p.getCopieDisponibili}</td>
        ${rigaSquadre}
      </tr>`;

      //se il giocatore attuale è un fuorilista e nelle impostazioni caricafuorilista è true
      rigaHTML += riganuova; //caso2 ok
    });

    //CREAZIONE TABELLA

    const TAG_TABLE = document.createElement("table"); //creiamo l'elemento table
    const TAG_CAPTION = document.createElement("caption"); //creiamo il titolo della tabella
    const TAG_THEAD = document.createElement("thead"); //creiamo l'elemento thead
    const TAG_TBODY = document.createElement("tbody"); //creiamo l'elemento tbody
    const thead = `<tr class="intestazione-colonne">
        <th title="Ruolo del giocatore">R</th>
        <th title="Nome del giocatore">Nome</th>
        <th title="Squadra di appartenenza">Squ</th>
        <th title="Quotazione">Qt</th>
        <th title="Presenze">Pre</th>
        <th title="Goal totali">Gol</th>
        <th title="Assist totali">Ass</th>
        <th title="Media Voto">MV</th>
        <th title="Forma Media Voto">Fmv</th>
        <th title="Somma Bonus/Malus">Sm B/M </th>
        <th class="colonna-pre5" title="Presenze ultime 5 giornate"> PRE 5 </th>
        <th class="colonna-MV5" title="Media Voto Ultime 5 giornate">MV 5</th>
        <th class="colonna-FMV5" title="Fanta Media Voto Ultime 5 giornate">FMV 5</th>
        <th class="colonna-BM5" title="Somma Bonus/Malus Ultime 5 giornate">BM 5 </th>
        <th class="colonna-possesso" title="Squadre che lo posseggono">Posseduto</th>
        </tr>`;
    TAG_THEAD.innerHTML = thead;

    TAG_CAPTION.innerHTML = `${titoloTabella} - Giocatori caricati:  ${arrayFiltrato.length}`;

    containerTable.appendChild(TAG_TABLE);
    TAG_TBODY.innerHTML = rigaHTML;
    TAG_TABLE.append(TAG_CAPTION, TAG_THEAD, TAG_TBODY);
  } else {
    containerTable.textContent =
      "⚠ ⚠ ⚠ ... Nessun giocatore corrisponde ai filtri impostati";
  }
}
