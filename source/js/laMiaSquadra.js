import { SQUADRA_UTENTE } from "./gestioneUtente.js";
import { toCapitalize } from "./funzioniAgo.js";

const LOGO_BASE_PATH = "../../Assets/image/loghi_team_serie_A/";

// Variabile per tenere traccia dell'oggetto squadra attualmente visualizzato
let teamOggettoVisualizzato = null;

/** Converte nome squadra → nome file logo */
function getNomeLogo(nomeSquadra) {
  return nomeSquadra
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

/** Logo con wrapper bianco */
function logoHTML(nomeSquadra) {
  const sigla = nomeSquadra.substring(0, 2).toUpperCase();
  const src = `${LOGO_BASE_PATH}${getNomeLogo(nomeSquadra)}.png`;
  return `
    <div class="logo-wrap">
      <img class="logo-squadra"
           src="${src}"
           alt="${nomeSquadra}"
           onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
      <span class="logo-squadra-placeholder">${sigla}</span>
    </div>
  `;
}

/** Label estesa del ruolo */
function getLabelRuolo(ruolo) {
  const map = {
    P: "Portieri",
    D: "Difensori",
    C: "Centrocampisti",
    A: "Attaccanti",
  };
  return map[ruolo] ?? ruolo;
}

/**
 * Crea la select per cambiare squadra.
 * Accetta "squadraSelezionata" per mettere l'attributo 'selected' sull'option giusta.
 */
export function creaFiltroSelezionaSquadraDaSelect(
  presidenti,
  containerFiltri,
  squadraSelezionata,
) {
  console.log("Modulo laMiaSquadra: creaFiltroSelezionaSquadraDaSelect()");

  // Se il container non esiste o la select esiste già, non facciamo nulla (evitiamo duplicati)
  if (!containerFiltri || document.getElementById("select-scelta-squadra"))
    return;

  let rigaOption = "";
  presidenti.forEach((presidenteCorrente) => {
    // Confrontiamo i nomi in minuscolo per sicurezza
    const isSelected =
      presidenteCorrente.getNomeRosa.toLowerCase() ===
      squadraSelezionata.toLowerCase()
        ? "selected"
        : "";

    rigaOption += `<option value="${presidenteCorrente.getNomeRosa}" ${isSelected}>${toCapitalize(presidenteCorrente.getNomeRosa)}</option>`;
  });

  containerFiltri.insertAdjacentHTML(
    "beforeend",
    `<section class="box-filtro">    
        <label title="Seleziona Squadra">Cambia Squadra</label>
        <select id="select-scelta-squadra">
          ${rigaOption}
        </select>
      </section>`,
  );
}

export function gestisciFiltroSelezionaSquadraDaSelect(e, callbackRicarica) {
  console.log("Modulo laMiaSquadra: gestisciFiltroSelezionaSquadraDaSelect()");
  if (e.target.id == "select-scelta-squadra") {
    // Quando cambio la select, ricarico la pagina.
    // La funzione di stampa leggerà il nuovo valore della select.
    callbackRicarica();
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

  // 1. GESTIONE VISIBILITÀ E TITOLI
  // Se non siamo già su questa pagina, resettiamo tutto
  if (tagH2.dataset.action != "apri-la-mia-squadra") {
    tagVista.textContent = "";
    cbAzzeraFiltri(); // Pulisce i filtri precedenti (es. quelli della lista giocatori)
    cbVisibile("la-mia-squadra"); // Mostra il container corretto
    tagH2.textContent = "LA MIA SQUADRA";
    tagH2.dataset.action = "apri-la-mia-squadra";
  }

  // Puliamo la vista prima di ridisegnare
  tagVista.innerHTML = "";
  const TAG_CONTENITORE_ROSA = document.createElement("section");
  TAG_CONTENITORE_ROSA.id = "contenitore-rosa";

  // 2. DETERMINIAMO QUALE SQUADRA MOSTRARE
  // Logica: Se c'è una select, usiamo il suo valore. Altrimenti usiamo SQUADRA_UTENTE.
  const selectEsistente = document.getElementById("select-scelta-squadra");
  let nomeSquadraTarget = "";

  if (selectEsistente) {
    nomeSquadraTarget = selectEsistente.value;
  } else {
    nomeSquadraTarget = SQUADRA_UTENTE;
  }

  // 3. RECUPERIAMO L'OGGETTO SQUADRA REALE DALL'ARRAY
  // (Fondamentale: trasformiamo la stringa "napoli" nell'oggetto che contiene .getCreditiResidui, ecc.)
  teamOggettoVisualizzato = presidenti.find(
    (p) => p.getNomeRosa.toLowerCase() === nomeSquadraTarget.toLowerCase(),
  );

  // Salvagente: se per qualche motivo non trovo la squadra (es. utente admin non in lista), prendo la prima
  if (!teamOggettoVisualizzato && presidenti.length > 0) {
    teamOggettoVisualizzato = presidenti[0];
    nomeSquadraTarget = teamOggettoVisualizzato.getNomeRosa;
  }

  // 4. GESTIONE DEL FILTRO (SELECT)
  const containerFiltri = document.getElementById("container-filtri");

  if (!selectEsistente) {
    // Se non esiste, lo creiamo passando la squadra target come selezionata
    creaFiltroSelezionaSquadraDaSelect(
      presidenti,
      containerFiltri,
      nomeSquadraTarget,
    );
  } else {
    // Se esiste già, ci assicuriamo che il valore sia allineato con quello che stiamo mostrando
    selectEsistente.value = nomeSquadraTarget;
  }

  // 5. STAMPA DEI DATI (HTML)

  // Intestazione Team
  let rigaHTML = `
    <section class="intestazione-team">
      <div>
        <div id="campo-nome-team">${toCapitalize(teamOggettoVisualizzato.getNomeRosa)}</div>
        <div id="campo-nome-presidente">${toCapitalize(teamOggettoVisualizzato.getNomePresidente)}</div>
      </div>
      <div id="campo-crediti-residui">
        <span class="numero">${teamOggettoVisualizzato.getCreditiResidui}</span>
        <span class="etichetta">crediti residui</span>
      </div>
      <div id="campo-valore-rosa">
        <span class="numero">${teamOggettoVisualizzato.getValoreRosa}</span>   
        <span class="etichetta">Valore Rosa </span> 
      </div>
      <div id="campo-crediti-spesi">  
        <span class="numero"> ${teamOggettoVisualizzato.getCreditiSpesi}</span>
        <span class="etichetta">Crediti spesi</span>       
      <div>
    </section>
    
    <section id="info-slot-ruoli">
      <div class="slot-P">${teamOggettoVisualizzato.getContaP} P</div>
      <div class="slot-D">${teamOggettoVisualizzato.getContaD} D</div>
      <div class="slot-C">${teamOggettoVisualizzato.getContaC} C</div>
      <div class="slot-A">${teamOggettoVisualizzato.getContaA} A</div>
    </section>
  `;

  // Stampa Giocatori divisi per ruolo
  let rigaGiocatore = "";
  let ruoloTemp = "P"; // Partiamo dai portieri

  // Filtriamo solo gli slot pieni (diversi da null)
  const giocatoriValidi = teamOggettoVisualizzato.getTuttiGliSlot.filter(
    (g) => g !== null,
  );

  for (let i = 0; i < giocatoriValidi.length; i++) {
    const giocatoreAttuale = giocatoriValidi[i];
    const ruoloAttuale = giocatoreAttuale.getDatiGiocatore.getRuolo;

    // Se cambia il ruolo (es. da P a D), chiudiamo il blocco precedente e ne apriamo uno nuovo
    if (ruoloAttuale !== ruoloTemp && rigaGiocatore !== "") {
      const TagNuovoPacchetto = document.createElement("div");
      TagNuovoPacchetto.classList.add("box-pacchetto-giocatori");
      TagNuovoPacchetto.dataset.ruolo = getLabelRuolo(ruoloTemp);
      TagNuovoPacchetto.insertAdjacentHTML("beforeend", rigaGiocatore);
      TAG_CONTENITORE_ROSA.append(TagNuovoPacchetto);

      // Reset per il nuovo ruolo
      rigaGiocatore = "";
      ruoloTemp = ruoloAttuale;
    }

    const nomeSquadraReale =
      giocatoreAttuale.getDatiGiocatore.getSquadraDiAppartenenza;
    const costo = giocatoreAttuale.getCostoDiAcquisto;

    rigaGiocatore += `
      <div class="box-giocatore ruolo-${ruoloAttuale}">
        <div id="box-info">
          ${logoHTML(nomeSquadraReale)}
          <div class="info-testi">
            <div id="campo-nome-giocatore">${giocatoreAttuale.getDatiGiocatore.getNome}</div>
            <div id="campo-nome-squadra">${toCapitalize(nomeSquadraReale)}</div>
          </div>
        </div>
        <div id="box-statistiche">
          <div>pr&nbsp;${giocatoreAttuale.getDatiGiocatore.getPresenze}</div>
          <div>mv&nbsp;${giocatoreAttuale.getDatiGiocatore.getMv}</div>
          <div>fmv&nbsp;${giocatoreAttuale.getDatiGiocatore.getFvm}</div>
          <div>+/-&nbsp;${giocatoreAttuale.getDatiGiocatore.getSommaBonusMalus}</div>
        </div>
        <div id="box-costi">
          <div id="campo-quotazione">Qt.${giocatoreAttuale.getDatiGiocatore.getQuotazione}</div>
          <div id="campo-costo-acquisto">${costo}</div>
        </div>
      </div>
    `;
  }

  // Aggiungiamo l'ultimo blocco rimasto (di solito gli Attaccanti)
  if (rigaGiocatore !== "") {
    const TagNuovoPacchetto = document.createElement("div");
    TagNuovoPacchetto.classList.add("box-pacchetto-giocatori");
    TagNuovoPacchetto.dataset.ruolo = getLabelRuolo(ruoloTemp);
    TagNuovoPacchetto.insertAdjacentHTML("beforeend", rigaGiocatore);
    TAG_CONTENITORE_ROSA.append(TagNuovoPacchetto);
  }

  tagVista.innerHTML += rigaHTML;
  tagVista.appendChild(TAG_CONTENITORE_ROSA);
}
