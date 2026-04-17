/**
 *crea una card giocatore vuota con i parametri che servono
 * @param {string} ruoloDaAccupare la stringa contenente il ruolo dello slot mancante
 * @param {number} posizioneSlot è la posizione dello slot
 * @returns card vuota
 */
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
  //logica per creare una card vuota con una + utile per fare una busta
}

//crea una card giocatore
export function creaCardGiocatore(giocatore, index) {
  if (giocatore) {
    const dati = giocatore.getDatiGiocatore;
    const card = document.createElement("div");
    card.classList.add("card-giocatore");
    card.dataset.card = dati.getNome; //nome giocatore
    card.dataset.index = index; //index giocatore
    card.innerHTML = `
    <span class="ruolo ${dati.getRuolo}">${dati.getRuolo}</span>
      <div class="nome-giocatore">${card.dataset.card}</div>
      <div class="squadra"><img src="Assets/image/loghi_team_serie_A/${dati.getSquadraDiAppartenenza.toLowerCase()}.png"/></div>
      <div title="Costo di acquisto" class="costo-acquisto">${giocatore.getCostoDiAcquisto}</div>
      `;

    return card;
  }
}
