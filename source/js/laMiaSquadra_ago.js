// source/js/laMiaSquadra.js
import { toCapitalize } from "./funzioniAgo.js";

// Variabili che prima erano globali in script.js, ora vivono al sicuro qui dentro
let presidenteloggato = "";
export let filtroSelezionaSquadraDaSelect = ""; // esportato nel caso servisse altrove

export function creaFiltroSelezionaSquadraDaSelect(
  presidenti,
  containerFiltri,
) {
  console.log("Modulo laMiaSquadra: creaFiltroSelezionaSquadraDaSelect()");
  presidenteloggato = presidenti[5]; // Mantengo la tua logica originale

  if (containerFiltri) {
    let rigaOption = "";
    presidenti.forEach((presidenteCorrente) => {
      const selected =
        presidenteCorrente == presidenteloggato ? ` selected ` : "";
      rigaOption += `<option value="${presidenteCorrente.getNomeRosa}" ${selected}>${presidenteCorrente.getNomeRosa}</option>`;
    });

    containerFiltri.insertAdjacentHTML(
      "beforeend",
      `<section class="box-filtro">    
      <label title="Seleziona Squadra">Seleziona Squadra</label>
        <select id="select-scelta-squadra">
          ${rigaOption}
        </select>          
      </section>`,
    );
  }
}

export function gestisciFiltroSelezionaSquadraDaSelect(e, callbackRicarica) {
  console.log("Modulo laMiaSquadra: gestisciFiltroSelezionaSquadraDaSelect()");
  if (e.target.id == "select-scelta-squadra") {
    filtroSelezionaSquadraDaSelect = e.target.value;
    callbackRicarica(); // Questa chiamerà "chiamaPaginaCliccata" di script.js
  }
}

export function stampaLaMiaSquadra(
  presidenti,
  tagVista,
  tagH2,
  cbAzzeraFiltri,
  cbVisibile,
) {
  console.log("Modulo laMiaSquadra: stampaLaMiaSquadra()");
  const allSection = tagVista.querySelectorAll("section");
  allSection.forEach((sectionAttuale) => sectionAttuale.remove());

  const TAG_CONTENITORE_ROSA = document.createElement("section");
  TAG_CONTENITORE_ROSA.id = "contenitore-rosa";
  TAG_CONTENITORE_ROSA.innerText = "";
  let indice = 0;

  if (tagH2.dataset.action != "apri-la-mia-squadra") {
    tagVista.textContent = "";
    cbAzzeraFiltri(); // Questo svuota il contenitore!
    cbVisibile("la-mia-squadra");
    tagH2.textContent = "LA MIA SQUADRA";
    tagH2.dataset.action = "apri-la-mia-squadra";
  }

  // --- 2. POI CREIAMO IL FILTRO (così non viene cancellato) ---
  const tagSelectSelezionaSquadra = document.getElementById(
    "select-scelta-squadra",
  );
  if (!tagSelectSelezionaSquadra) {
    const containerFiltri = document.getElementById("container-filtri");
    creaFiltroSelezionaSquadraDaSelect(presidenti, containerFiltri);

    // Assegnamo il valore di default
    const selectAppenaCreata = document.getElementById("select-scelta-squadra");
    if (selectAppenaCreata) {
      selectAppenaCreata.value = presidenti[5].getNomeRosa;
      presidenteloggato = presidenti[5];
    }
  } else {
    for (let i = 0; i < presidenti.length; i++) {
      if (presidenti[i].getNomeRosa == tagSelectSelezionaSquadra.value) {
        indice = i;
      }
    }
    presidenteloggato = presidenti[indice];
  }

  if (tagH2.dataset.action != "apri-la-mia-squadra") {
    tagVista.textContent = "";
    cbAzzeraFiltri(); // Chiamata a funzione di script.js
    cbVisibile("la-mia-squadra"); // Chiamata a funzione di script.js
    tagH2.textContent = "LA MIA SQUADRA";
    tagH2.dataset.action = "apri-la-mia-squadra";
  }

  // Costruzione HTML (copia carbone del tuo codice)
  let rigaHTML = `
      <section class="intestazione-team">
            <div>
              <div id="campo-nome-team">${presidenteloggato.getNomeRosa}</div>
              <div id="campo-nome-presidente">${presidenteloggato.getNomePresidente}</div>
            </div>
            <div>
              <div id="campo-crediti-residui"> ${presidenteloggato.getCreditiResidui} crediti</div>
              <div>Valore Rosa ${presidenteloggato.getValoreRosa}</div> 
              <div>Crediti spesi${presidenteloggato.getCreditiSpesi}</div> 
            </div>             
      </section>
        
      <section id="info-slot-ruoli"> 
            <div> ${presidenteloggato.getContaP} P</div>
            <div> ${presidenteloggato.getContaD} D</div>
            <div> ${presidenteloggato.getContaC} C</div>
            <div> ${presidenteloggato.getContaA} A</div>
      </section>
      `;

  let rigaGiocatore = "";
  let ruoloTemp = "P";

  // 1. Estraiamo solo i giocatori veri (scartiamo gli slot "null" se la rosa è incompleta)
  const giocatoriValidi = presidenteloggato.getTuttiGliSlot.filter(
    (g) => g !== null,
  );

  for (let i = 0; i < giocatoriValidi.length; i++) {
    const giocatoreAttuale = giocatoriValidi[i];
    const ruoloAttuale = giocatoreAttuale.getDatiGiocatore.getRuolo;

    // 2. Se CAMBIA il ruolo (e abbiamo già giocatori in pancia), creiamo il div e lo appendiamo
    if (ruoloAttuale !== ruoloTemp && rigaGiocatore !== "") {
      const TagNuovoPacchetto = document.createElement("div");
      TagNuovoPacchetto.classList.add("box-pacchetto-giocatori");
      TagNuovoPacchetto.insertAdjacentHTML("beforeend", rigaGiocatore);
      TAG_CONTENITORE_ROSA.append(TagNuovoPacchetto);

      rigaGiocatore = ""; // Svuotiamo il contenitore per il nuovo ruolo
      ruoloTemp = ruoloAttuale; // Aggiorniamo il ruolo di riferimento
    }

    // 3. A prescindere dal ruolo, aggiungiamo SEMPRE il giocatore attuale alla stringa
    rigaGiocatore += `
        <div class="box-giocatore">
              <div id="box-info">
                <div id="campo-nome-giocatore">${giocatoreAttuale.getDatiGiocatore.getNome}</div> 
                <div id="campo-nome-squadra">${toCapitalize(giocatoreAttuale.getDatiGiocatore.getSquadraDiAppartenenza)}</div> 
              </div>              
              <div id="box-statistiche">
                <div>pr. ${giocatoreAttuale.getDatiGiocatore.getPresenze}</div> 
                <div>Mv. ${giocatoreAttuale.getDatiGiocatore.getMv}</div> 
                <div>F.mv ${giocatoreAttuale.getDatiGiocatore.getFvm}</div> 
                <div>+/- ${giocatoreAttuale.getDatiGiocatore.getSommaBonusMalus}</div>
              </div>              
              <div id="box-costi">
                <div id="campo-quotazione">Qt.${giocatoreAttuale.getDatiGiocatore.getQuotazione}</div> 
                <div id="campo-costo-acquisto">${giocatoreAttuale.getCostoDiAcquisto}</div>
              </div>              
        </div>        
    `;
  }

  // 4. IMPORTANTE: Finito il ciclo, "scarichiamo" l'ultimo blocco rimasto (di solito gli Attaccanti)
  if (rigaGiocatore !== "") {
    const TagNuovoPacchetto = document.createElement("div");
    TagNuovoPacchetto.classList.add("box-pacchetto-giocatori");
    TagNuovoPacchetto.insertAdjacentHTML("beforeend", rigaGiocatore);
    TAG_CONTENITORE_ROSA.append(TagNuovoPacchetto);
  }
  tagVista.innerHTML += rigaHTML;
  tagVista.appendChild(TAG_CONTENITORE_ROSA);
}
