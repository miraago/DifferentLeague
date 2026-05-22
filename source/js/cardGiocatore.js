/**
 *crea una card giocatore vuota con i parametri che servono
 * @param {string} ruoloDaAccupare la stringa contenente il ruolo dello slot mancante
 * @param {number} posizioneSlot è la posizione dello slot
 * @returns card vuota
 */

import { toCapitalize } from "./funzioniAgo.js";
export function creaSlotVuoto(ruoloDaAccupare, posizioneSlot) {
  const slotVuoto = document.createElement("div");
  slotVuoto.classList.add("slot-vuoto");
  slotVuoto.dataset.index = posizioneSlot;
  slotVuoto.dataset.valore = 0;
  slotVuoto.dataset.ruolo = ruoloDaAccupare;
  slotVuoto.style.order = posizioneSlot;

  slotVuoto.innerHTML = `<div>      
                            ${ruoloDaAccupare}               
                        </div>`;

  return slotVuoto;
}

export function creaCardGiocatoreVuotoSostituibile() {
  //logica per creare una card vuota con una + utile
}

export function creaCardGiocatore(giocatore, index, option = 0) {
  //option = 0 cardGiocatore semplice
  //option = 1 cardGiocatore disabled
  //option = 3 cardGiocatore per svincolo

  if (giocatore) {
    const costoSvincolo = Math.ceil(
      (giocatore.getCostoDiAcquisto +
        giocatore.getDatiGiocatore.getQuotazione) /
        2,
    );
    const dati = giocatore.getDatiGiocatore;
    const card = document.createElement("div");
    card.classList.add("card-giocatore");
    if (option == 1) {
      card.classList.add("disabled");
    }
    card.dataset.card = dati.getNome; //nome giocatore
    card.dataset.index = index; //index giocatoree
    card.classList.add(dati.getRuolo);
    if (option == 3) card.classList.add("option-svincolo"); //aggiunge questa classe per aggiungere le icone di svincolo

    //creiamo il div con i tre bottoni
    const tagDivConBottoniHTML = `<div class='container-icona'>
                                    <img class='bottone-svincola' title="Svincola Giocatore" alt="->"src='/Assets/image/card/icona-bidone.png'/>
                                    <img class='bottone-annulla' title="Annulla Operazione"alt="❌" src='/Assets/image/card/icona-annulla.png'/>
                                    <img class='bottone-promessa' title="Prometti Svincolo" alt="-><-" src='/Assets/image/card/icona-promessa.png''/>
                                  </div>`;

    card.innerHTML = `
    
      <span class="ruolo ${dati.getRuolo}">${dati.getRuolo}</span>
      <div class="nome-giocatore ${dati.getRuolo}">
        <span class="testo-nome-giocatore">${dati.getNome}</span>
      </div>
      <img class="img-squadra" src="Assets/image/loghi_team_serie_A/${dati.getSquadraDiAppartenenza.toLowerCase()}.png"/> 
      <div class="nome-squadra">  ${toCapitalize(dati.getSquadraDiAppartenenza)}</div>
      <div class="mv box-st" title="Media voto">
          <div class="etichetta">MV</div>
          <div class="valore">${dati.getMv}</div>
      </div>
      <div class="fmv box-st" title="Media fantavoto">
          <div class="etichetta">FVM</div>
          <div class="valore">${dati.getFvm}</div>
      </div>
      <div title="Costo di acquisto" class="costo-acquisto box-st">
          <div class="etichetta">C.A.</div>
          <div class="valore">${giocatore.getCostoDiAcquisto}</div>
      </div>
      <div title="Costo Attuale" class="costo-attuale box-st">
          <div class="etichetta">Qt</div>
          <div class="valore">${giocatore.getDatiGiocatore.getQuotazione}</div>
      </div>
      <div title="Costo di Svincolo" class="costo-svincolo box-st">
          <div class="etichetta">C.S.</div>
          <div class="valore">${costoSvincolo}</div>
      </div>
      ${option == 3 ? tagDivConBottoniHTML : ""}
      
      `;

    return card;
  }
}
