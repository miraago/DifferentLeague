import { SQUADRA_UTENTE } from "./gestioneUtente.js";
import { toCapitalize } from "./funzioniAgo.js";

const vistaMercato = document.getElementById("vista-mercato");

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

  //pleleviamo la squadra utente
  const squadraLoggata = cbPresidenti.find(
    (squadraAttuale) =>
      squadraAttuale.getNomeRosa == SQUADRA_UTENTE.toUpperCase(),
  ); //squadra loggata ha la squadra utente

  //creiamo i tre contenitori

  //contenitore da svincolare
  const containerInfoSquadra = document.createElement("section");
  containerInfoSquadra.id = "container-info-squadra";
  vistaMercato.append(containerInfoSquadra);

  //contenitore giocatori
  const containerPlayer = document.createElement("section");
  containerPlayer.id = "container-giocatori";
  vistaMercato.append(containerPlayer);

  //contenitore da svincolare
  const containerDaSvincolare = document.createElement("section");
  containerDaSvincolare.id = "container-da-svincolare";
  vistaMercato.append(containerDaSvincolare);

  let giocatoriHTML = "";
  squadraLoggata.getTuttiGliSlot.forEach((element) => {
    giocatoriHTML += creaCardGiocatore(element);
  });

  containerPlayer.innerHTML = giocatoriHTML;
}

function creaCardGiocatore(giocatore) {
  const cardGiocatore = `
          <div class="card-giocatore"> 
            <div>
              <div class="ruolo">${giocatore.getDatiGiocatore.getRuolo}</div>
              <div class="squadra">
                <img 
                  src="Assets/image/loghi_team_serie_A/${giocatore.getDatiGiocatore.getSquadraDiAppartenenza.toLowerCase()}.png"
                  title="${giocatore.getDatiGiocatore.getSquadraDiAppartenenza}"
                  alt="${giocatore.getDatiGiocatore.getSquadraDiAppartenenza}"/>
              </div>
              <div class="nome-giocatore"> ${giocatore.getDatiGiocatore.getNome} </div>
            </div>
            <div>
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
              <div class="costo-cessione">              
                <div class="valore">${(giocatore.getCostoDiAcquisto + giocatore.getDatiGiocatore.getQuotazione) / 2}</div>
                <div class="etichetta"> Costo Cessione</div>
              </div>
            </div>
            
              <img 
                class="icona" 
                alt="svincola ${giocatore.getDatiGiocatore.getNome}"
                title="svincola ${giocatore.getDatiGiocatore.getNome}" 
                src="Assets/image/icona-bidone.png" />
            </div>`;
  return cardGiocatore;
}
