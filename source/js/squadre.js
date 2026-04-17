
import { IMPOSTAZIONI } from "./impostazioni.js";
import { toCapitalize } from "./funzioniAgo.js";
import { player, acquisti, presidenti, azzeraTabelle,paginaDaRendereVisibile} from "./script.js";
import { applicaFiltroTeams,creaFiltroSelezionaCampionato, applicaFiltriGiocatori,azzeraFiltri } from "./filtri.js";

const TAG_H2 = document.querySelector("h2");
 const containerFiltri = document.getElementById("container-filtri");
  const containerTable = document.getElementById("container-table");

/* info di tutte le squadre */
export function stampaInfoSquadre() {
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
    const campionato = toCapitalize(teamsAttuale.getCampionatoDiAppartenenza);
    const immagineCampionato = `./Assets/image/logo_leghe/Logo_${campionato.toLowerCase().replace(" ", "_")}.png`;
    tbody += `
        <tr>
        <td>${toCapitalize(teamsAttuale.getNomeRosa)}</td>
        <td>${toCapitalize(teamsAttuale.getNomePresidente)}</td>
        <td><img src="${immagineCampionato}"/>${campionato}</td>
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
  TAG_TABLE.classList.add("tabella-info-squadre");
  const TAG_CAPTION = document.createElement("caption");
  TAG_CAPTION.innerText = "Informazioni squadre";
  const TAG_THEAD = document.createElement("thead"); //creiamo l'elemento thead
  const TAG_TBODY = document.createElement("tbody"); //creiamo l'elemento tbody
  TAG_TBODY.innerHTML = tbody;
  TAG_THEAD.innerHTML = `
        <tr class="intestazione-colonne">
          <th title="nome Squadra">Squ.</th>
          <th title="nome Presidente">Pres.</th>
          <th title="Lega di Appartenenza">Lega </th>
          <th title="Crediti Residui">C.R.</th>
          <th title="Valore Rosa">V.R.</th>
          <th title="Crediti Spesi">C.S.</th>
          <th title="Portieri in rosa">P</th>
          <th title="Difensori in rosa">D</th>
          <th title="Centrocampisti in rosa">C</th>
          <th title="Attaccanti in rosa">A</th>
        </tr>`;

  containerTable.appendChild(TAG_TABLE); //inseriamo la tabella nel contenitore
  TAG_TABLE.append(TAG_CAPTION, TAG_THEAD, TAG_TBODY); //inseriamo thead e tbody nella tabella

  //console.log("Stampa lista crediti residui Terminata");
}




/* stampa tutte le rose */
export function stampaRose() {
  paginaDaRendereVisibile("dati");
  azzeraTabelle();
  if (TAG_H2.dataset.action != "apri-tutte-le-rose") {
    //se viene da un'altra pagina possiamo azzerare i filtri
    azzeraFiltri();

    creaFiltroSelezionaCampionato();
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
              <tr ${classfuoriLista} data-nome="${toCapitalize(giocatoreCorrente.getDatiGiocatore.getNome)}">
                <td><span class="${giocatoreCorrente.getDatiGiocatore.getRuolo}">${giocatoreCorrente.getDatiGiocatore.getRuolo}</span></td>
                <td>${toCapitalize(
                  giocatoreCorrente.getDatiGiocatore.getNome,
                )}${asterisco}</td>                
                <td class="squadra-di-appartenenza">`;
          if (
            giocatoreCorrente.getDatiGiocatore.getSquadraDiAppartenenza == ""
          ) {
            rigaHtml += `</td>`;
          } else {
            rigaHtml += `
              
                <img src="Assets/image/loghi_team_serie_A/${giocatoreCorrente.getDatiGiocatore.getSquadraDiAppartenenza.toLowerCase()}.png"/>
             
              
                ${toCapitalize(
                  giocatoreCorrente.getDatiGiocatore.getSquadraDiAppartenenza,
                )}
                
              </td>`;
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
      TAG_TABLE.classList.add("tabella-squadra"); // gestibile nel css listaSquadre.css
      const TAG_TBODY = document.createElement("tbody"); //creazione tbody
      const TAG_THEAD = document.createElement("thead"); //creazione thead
      const TAG_CAPTION = document.createElement("caption"); //caption Tabella
      const TAG_TFOOT = document.createElement("tfoot"); //creazione thead

      //SECTION
      TAG_CAPTION.innerHTML += `        
          <section class="box-thead">
            <div id="contenitore-nome">
              <div class="campo-nome-squadra">${toCapitalize(rosaCorrente.getNomeRosa)}</div>
              <div class="campo-nome-presidente">${toCapitalize(rosaCorrente.getNomePresidente)}</div>
            </div>
            <div class="campo-campionato-di-appartenenza">
              <img class="logo_lega" src="Assets/image/logo_leghe/Logo_${rosaCorrente.getCampionatoDiAppartenenza.toLowerCase().replace(" ", "_")}.png">
            </div>
          </section> `;
      //THEAD
      TAG_THEAD.innerHTML = `
      <tr  class="intestazione-colonne">        
        <th title="Ruolo"> R </th>
        <th title="Nome Giocatore"> Nome  </th>
        <th title="Squadra"> Squadra </th>
        <th title="Quotazione Attuale"> Qt </th>
        <th title="Costo Pagato"> C.P. </th>
        <th title="Costo Svincolo"> C.S. </th>    
      </tr>`;

      //TFOOT
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
      TAG_TABLE.append(TAG_CAPTION, TAG_THEAD, TAG_TBODY, TAG_TFOOT);
      containerTable.appendChild(TAG_TABLE);
    }

    //console.log("Stampa LISTA ROSE completata.");
  });
}