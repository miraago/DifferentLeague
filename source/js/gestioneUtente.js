import { toCapitalize } from "./funzioniAgo.js";

let presidenti;

export let UTENTELOGGATO = {
  presidenteUtenteLoggato: null,
  nomeSquadraUtenteLoggato: null,
  nomeCampionatoUtenteLoggato: null,
};

// Questa variabile conterrà il nome della squadra loggata
// La esportiamo così gli altri file possono leggerla!

UTENTELOGGATO.nomeSquadraUtenteLoggato =
  localStorage.getItem("fanta_squadra_corrente") || null;

const modalLogin = document.getElementById("modal-login");
const selectLogin = document.getElementById("select-login-squadra");
const btnEntra = document.getElementById("btn-entra");

/**
 * Controlla se l'utente ha già scelto una squadra.
 * Se sì -> non fa nulla e ritorna true.
 * Se no -> Mostra il popup di login e ritorna false.
 */
export function controllaAccesso(cbPresidenti, callbackSuccesso) {
  // 1. Cerchiamo se c'è già un dato salvato
  presidenti = cbPresidenti;

  if (
    UTENTELOGGATO.nomeSquadraUtenteLoggato &&
    cbPresidenti.some(
      (p) => p.getNomeRosa === UTENTELOGGATO.nomeSquadraUtenteLoggato,
    )
  ) {
    inizializzaUTENTELOGGATO();
    return true; // Accesso consentito
  }

  // 2. Se non c'è, mostriamo il login

  modalLogin.style.display = "flex";

  // Popoliamo la select
  let options = `<option value="" disabled selected>-- Scegli la tua rosa --</option>`;
  cbPresidenti.forEach((team) => {
    options += `<option value="${team.getNomeRosa.toUpperCase()}">${toCapitalize(team.getNomeRosa)}</option>`;
  });
  selectLogin.innerHTML = options;

  // Gestiamo il click su ENTRA
  btnEntra.onclick = () => {
    const scelta = selectLogin.value;
    if (scelta) {
      // SALVIAMO NEL BROWSER!
      localStorage.setItem("fanta_squadra_corrente", scelta);
      UTENTELOGGATO.nomeSquadraUtenteLoggato = scelta;

      inizializzaUTENTELOGGATO();

      // Chiudiamo il modal
      modalLogin.style.display = "none";

      // Avvisiamo script.js che ora siamo pronti
      callbackSuccesso();
    } else {
      alert("Devi selezionare una squadra!");
    }
  };

  return false; // Accesso momentaneamente bloccato
}

/**
 * Funzione per fare il Logout
 */
export function logout() {
  localStorage.removeItem("fanta_squadra_corrente");
  UTENTELOGGATO.nomeCampionatoUtenteLoggato =
    UTENTELOGGATO.nomeSquadraUtenteLoggato =
    UTENTELOGGATO.presidenteUtenteLoggato =
      null;
  location.reload(); // Ricarica la pagina per far riapparire il login
}

function inizializzaUTENTELOGGATO() {
  //prendiamo il riferimento all'utente loggato
  UTENTELOGGATO.presidenteUtenteLoggato = presidenti.find(
    (presidenteCorrente) => {
      return (
        presidenteCorrente.getNomeRosa == UTENTELOGGATO.nomeSquadraUtenteLoggato
      );
    },
  );

  //prendiamo il riferimento il campionato dell'utente loggato
  UTENTELOGGATO.nomeCampionatoUtenteLoggato =
    UTENTELOGGATO.presidenteUtenteLoggato.getCampionatoDiAppartenenza;
}
