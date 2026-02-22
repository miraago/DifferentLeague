// source/js/laMiaSquadra.js
import { toCapitalize } from "./funzioniAgo.js";

const LOGO_BASE_PATH = "../../Assets/image/loghi_team_serie_A/";

let presidenteloggato = "";
export let filtroSelezionaSquadraDaSelect = "";

/** Converte nome squadra → nome file logo (minuscolo, spazi→underscore, accenti rimossi) */
function getNomeLogo(nomeSquadra) {
  return nomeSquadra
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

/** Logo con wrapper bianco – garantisce visibilità anche per loghi scuri */
function logoHTML(nomeSquadra) {
  const sigla = nomeSquadra.substring(0, 2).toUpperCase();
  const src   = `${LOGO_BASE_PATH}${getNomeLogo(nomeSquadra)}.png`;
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

/** Label estesa del ruolo per data-ruolo e classe CSS */
function getLabelRuolo(ruolo) {
  const map = { P: "Portieri", D: "Difensori", C: "Centrocampisti", A: "Attaccanti" };
  return map[ruolo] ?? ruolo;
}

export function creaFiltroSelezionaSquadraDaSelect(presidenti, containerFiltri) {
  console.log("Modulo laMiaSquadra: creaFiltroSelezionaSquadraDaSelect()");
  presidenteloggato = presidenti[5];

  if (containerFiltri) {
    let rigaOption = "";
    presidenti.forEach((presidenteCorrente) => {
      const selected = presidenteCorrente == presidenteloggato ? ` selected ` : "";
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
    callbackRicarica();
  }
}

export function stampaLaMiaSquadra(presidenti, tagVista, tagH2, cbAzzeraFiltri, cbVisibile) {
  console.log("Modulo laMiaSquadra: stampaLaMiaSquadra()");
  const allSection = tagVista.querySelectorAll("section");
  allSection.forEach((s) => s.remove());

  const TAG_CONTENITORE_ROSA = document.createElement("section");
  TAG_CONTENITORE_ROSA.id = "contenitore-rosa";
  TAG_CONTENITORE_ROSA.innerText = "";
  let indice = 0;

  if (tagH2.dataset.action != "apri-la-mia-squadra") {
    tagVista.textContent = "";
    cbAzzeraFiltri();
    cbVisibile("la-mia-squadra");
    tagH2.textContent = "LA MIA SQUADRA";
    tagH2.dataset.action = "apri-la-mia-squadra";
  }

  const tagSelectSelezionaSquadra = document.getElementById("select-scelta-squadra");
  if (!tagSelectSelezionaSquadra) {
    const containerFiltri = document.getElementById("container-filtri");
    creaFiltroSelezionaSquadraDaSelect(presidenti, containerFiltri);
    const selectAppenaCreata = document.getElementById("select-scelta-squadra");
    if (selectAppenaCreata) {
      selectAppenaCreata.value = presidenti[5].getNomeRosa;
      presidenteloggato = presidenti[5];
    }
  } else {
    for (let i = 0; i < presidenti.length; i++) {
      if (presidenti[i].getNomeRosa == tagSelectSelezionaSquadra.value) indice = i;
    }
    presidenteloggato = presidenti[indice];
  }

  if (tagH2.dataset.action != "apri-la-mia-squadra") {
    tagVista.textContent = "";
    cbAzzeraFiltri();
    cbVisibile("la-mia-squadra");
    tagH2.textContent = "LA MIA SQUADRA";
    tagH2.dataset.action = "apri-la-mia-squadra";
  }

  // Intestazione con crediti suddivisi in .numero + .etichetta
  let rigaHTML = `
    <section class="intestazione-team">
      <div>
        <div id="campo-nome-team">${presidenteloggato.getNomeRosa}</div>
        <div id="campo-nome-presidente">${presidenteloggato.getNomePresidente}</div>
      </div>
      <div id="campo-crediti-residui">
        <span class="numero">${presidenteloggato.getCreditiResidui}</span>
        <span class="etichetta">crediti residui</span>
      </div>
    </section>
    <section>
      <div>
        <span>Valore Rosa ${presidenteloggato.getValoreRosa}</span>
        <span>·</span>
        <span>Crediti spesi ${presidenteloggato.getCreditiSpesi}</span>
      </div>
    </section>
    <section id="info-slot-ruoli">
      <div class="slot-P">${presidenteloggato.getContaP} P</div>
      <div class="slot-D">${presidenteloggato.getContaD} D</div>
      <div class="slot-C">${presidenteloggato.getContaC} C</div>
      <div class="slot-A">${presidenteloggato.getContaA} A</div>
    </section>
  `;

  let rigaGiocatore = "";
  let ruoloTemp = "P";

  const giocatoriValidi = presidenteloggato.getTuttiGliSlot.filter((g) => g !== null);

  for (let i = 0; i < giocatoriValidi.length; i++) {
    const giocatoreAttuale = giocatoriValidi[i];
    const ruoloAttuale     = giocatoreAttuale.getDatiGiocatore.getRuolo;

    if (ruoloAttuale !== ruoloTemp && rigaGiocatore !== "") {
      const TagNuovoPacchetto = document.createElement("div");
      TagNuovoPacchetto.classList.add("box-pacchetto-giocatori");
      TagNuovoPacchetto.dataset.ruolo = getLabelRuolo(ruoloTemp);
      TagNuovoPacchetto.insertAdjacentHTML("beforeend", rigaGiocatore);
      TAG_CONTENITORE_ROSA.append(TagNuovoPacchetto);
      rigaGiocatore = "";
      ruoloTemp = ruoloAttuale;
    }

    const nomeSquadra = giocatoreAttuale.getDatiGiocatore.getSquadraDiAppartenenza;
    const costo       = giocatoreAttuale.getCostoDiAcquisto;

    rigaGiocatore += `
      <div class="box-giocatore ruolo-${ruoloAttuale}">
        <div id="box-info">
          ${logoHTML(nomeSquadra)}
          <div class="info-testi">
            <div id="campo-nome-giocatore">${giocatoreAttuale.getDatiGiocatore.getNome}</div>
            <div id="campo-nome-squadra">${toCapitalize(nomeSquadra)}</div>
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

  // Scarica l'ultimo blocco
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
