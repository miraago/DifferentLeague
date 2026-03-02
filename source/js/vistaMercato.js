import { SQUADRA_UTENTE } from "./gestioneUtente.js";
import { toCapitalize } from "./funzioniAgo.js";

const vistaMercato = document.getElementById("vista-mercato");

vistaMercato.addEventListener("click", gestisciClickMercatoSvincola);
let cbPlayer = [];
let cbPresidenti = [];
let presidenteUtenteLoggato = "";

export function inizializzaMercato(players, presidenti) {
  cbPlayer = players;
  cbPresidenti = presidenti;

  //ricavo tutte le info del presidente loggato
  presidenteUtenteLoggato = cbPresidenti.find((squadraAttuale) => {
    return (
      squadraAttuale.getNomeRosa.toUpperCase() == SQUADRA_UTENTE.toUpperCase()
    );
  });
}

export function mercatoSvincola(
  TAG_H2,
  cbPresidenti,
  cbPaginaDaRendereVisibile,
  cbAzzeraTabelle,
  cbAzzeraFiltri,
) {
  if (TAG_H2.dataset.action != "apri-mercato") {
    TAG_H2.innerText = "MERCATO - Svincola Giocatori";
    TAG_H2.dataset.action = "apri-mercato";
    cbPaginaDaRendereVisibile("mercato");
  }

  vistaMercato.innerText = ""; //Azzeriamo la vista e la ricostruiamo

  //creiamo i tre contenitori

  //contenitore info squadra
  const containerInfoSquadra = document.createElement("section");
  containerInfoSquadra.id = "container-info-squadra";
  containerInfoSquadra.innerHTML = `
  <div id="box-info">
    <div id='nome-squadra'>
      ${SQUADRA_UTENTE} 
    </div>
    <div id="nome-presidente">${presidenteUtenteLoggato.getNomePresidente} </div>
  </div>
    <div  id="box-calcoli">
      <div>
        <div class="etichetta"> Crediti Residui </div>
        <div id="crediti-residui" class="valore"> ${presidenteUtenteLoggato.getCreditiResidui}</div>
      </div>
      <div>  
        <div class="etichetta"> Crediti Svincolati </div>
        <div id="crediti-recuperati" class="valore"> 0 </div>    
      </div>
      <div>  
        <div class="etichetta"> Totale </div>
        <div id="crediti-totale" class="valore"> ${presidenteUtenteLoggato.getCreditiResidui} </div>    
      </div>
    </div>
    
  </div>
  
      `;
  vistaMercato.append(containerInfoSquadra);

  //contenitore giocatori
  const containerPlayer = document.createElement("section");
  containerPlayer.id = "container-giocatori";
  vistaMercato.append(containerPlayer);
  containerPlayer.innerHTML = `<h2> LISTA GIOCATORI ${SQUADRA_UTENTE} </h2>`;
  containerPlayer.innerHTML +=
    "<div> Clicca sul giocatore per svincolare </div>";

  //contenitore da svincolare
  const containerDaSvincolare = document.createElement("section");
  containerDaSvincolare.id = "container-da-svincolare";
  containerDaSvincolare.innerHTML = "<h2> LISTA GIOCATORI DA SVINCOLARE </h2>";
  vistaMercato.append(containerDaSvincolare);
  containerDaSvincolare.innerHTML +=
    "<div> Clicca sul giocatore per rimettere in rosa </div>";

  let giocatoriHTML = "";
  presidenteUtenteLoggato.getTuttiGliSlot.forEach((element, index) => {
    giocatoriHTML += creaCardGiocatore(element, index);
  });

  containerPlayer.innerHTML += giocatoriHTML;
}

function creaCardGiocatore(giocatore, index) {
  const valoreCard = calcolaCostoSvincolo(giocatore);

  const cardGiocatore = `
    <div class="card-giocatore" data-card="${giocatore.getDatiGiocatore.getNome}" data-index="${index}" data-valore="${valoreCard}"> 
      <div id="box-sx">
                
                <div class="squadra">
                  <img 
                    src="Assets/image/loghi_team_serie_A/${giocatore.getDatiGiocatore.getSquadraDiAppartenenza.toLowerCase()}.png"
                    title="${giocatore.getDatiGiocatore.getSquadraDiAppartenenza}"
                    alt="${giocatore.getDatiGiocatore.getSquadraDiAppartenenza}"/>
                </div>
      </div>



      <div id="box-centrale">
          <div>
                <div class="ruolo"><span class="${giocatore.getDatiGiocatore.getRuolo}">${giocatore.getDatiGiocatore.getRuolo}</span></div>
                <div class="nome-giocatore"> ${giocatore.getDatiGiocatore.getNome} </div>
          </div>
                <div id="box-statistiche">
                  <div class="presenze">              
                    <div class="valore">${giocatore.getDatiGiocatore.getPresenze}</div>
                    <div class="etichetta"> Presenze </div>
                  </div>
                  <div class="quotazione">              
                    <div class="valore">${giocatore.getDatiGiocatore.getQuotazione}</div>
                    <div class="etichetta"> Quotazione </div>
                  </div>
                  <div class="media-voto">              
                    <div class="valore">${giocatore.getDatiGiocatore.getMv}</div>
                    <div class="etichetta"> M.V.</div>
                  </div>
                  <div class="fanta-media-voto">              
                    <div class="valore">${giocatore.getDatiGiocatore.getFvm}</div>
                    <div class="etichetta"> F.M.V.</div>
                  </div>
                  <div class="prezzo-pagato">              
                    <div class="valore">${giocatore.getCostoDiAcquisto}</div>
                    <div class="etichetta"> Costo Pagato</div>
                  </div>
                  
                </div>
      </div>
              
            
            
        <div id="box-dx"> 
        <div class="costo-cessione">              
                    <div class="valore">${valoreCard}</div>
                    <div class="etichetta"> Costo Cessione</div>
                  </div>               
                
        </div>
      </div>`;
  return cardGiocatore;
}

function gestisciClickMercatoSvincola(e) {
  const cardCliccata = e.target.closest(".card-giocatore");
  if (!cardCliccata) return; // se non ho cliccato sulla card fermati

  //se siamo qui significa che è stato fatto click su una card
  //per prima cosa prendiamo i riferimenti dei contenitori
  const containerDaSvincolare = document.getElementById(
    "container-da-svincolare",
  );
  const containerGiocatori = document.getElementById("container-giocatori");
  const contenitoreCliccato = cardCliccata.closest("section");

  //capiamo in che contenitore si trova la card
  if (contenitoreCliccato == containerGiocatori) {
    //gestiamo carta che si trova all'interno del contenitore da svincolare
    //il giocatore era in rosa e lo sposto in da svincolare
    containerDaSvincolare.append(cardCliccata);
  } else {
    ////il giocatore era in svincolati e lo sposto in lista giocatori
    //logica per farla aggiungere alla stessa posizione di dove stava prima

    const elencoCard = Array.from(
      containerGiocatori.querySelectorAll(".card-giocatore"),
    );

    const indexCartaCliccata = parseInt(cardCliccata.dataset.index);
    //cerchiamo la prima carta con index maggiore della mia
    const primaCartaConIndexMaggiore = elencoCard.find((cardAttuale) => {
      return parseInt(cardAttuale.dataset.index) >= indexCartaCliccata;
    });

    if (
      !primaCartaConIndexMaggiore
    ) //se non esiste dobbiamo inserire all'inizio
    {
      containerGiocatori.append(cardCliccata);
    } else {
      containerGiocatori.insertBefore(cardCliccata, primaCartaConIndexMaggiore);
    }
  }
  aggiornaValoriNelBoxInfo();
}

function calcolaCostoSvincolo(giocatore) {
  const quotazioneAttuale = giocatore.getDatiGiocatore.getQuotazione;

  const prezzoPagato = giocatore.getCostoDiAcquisto;

  return Math.ceil((prezzoPagato + quotazioneAttuale) / 2);
}

function aggiornaValoriNelBoxInfo() {
  const elementoCreditiResidui = document.getElementById("crediti-residui");
  let valoreCreditiResidui = parseInt(elementoCreditiResidui.innerText.trim());

  const elementoValoreSvincolati =
    document.getElementById("crediti-recuperati");
  let valoreSvincolati = 0;

  const elementoValoreTotale = document.getElementById("crediti-totale");
  let valoreTotale = parseInt(elementoValoreTotale.innerText.trim());

  const containerDaSvincolare = document.getElementById(
    "container-da-svincolare",
  );

  const elementiDaSvincolare =
    containerDaSvincolare.querySelectorAll(".card-giocatore");

  elementiDaSvincolare.forEach((cardAttuale) => {
    valoreSvincolati += parseInt(cardAttuale.dataset.valore);
  });

  valoreTotale = valoreCreditiResidui + valoreSvincolati;

  elementoValoreSvincolati.innerText = valoreSvincolati;
  elementoValoreTotale.innerText = valoreTotale;
}
