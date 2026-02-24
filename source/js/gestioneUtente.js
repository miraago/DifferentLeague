import { toCapitalize } from "./funzioniAgo.js";

// Questa variabile conterrà il nome della squadra loggata
// La esportiamo così gli altri file possono leggerla!
export let SQUADRA_UTENTE =
  localStorage.getItem("fanta_squadra_corrente") || null;

const modalLogin = document.getElementById("modal-login");
const selectLogin = document.getElementById("select-login-squadra");
const btnEntra = document.getElementById("btn-entra");

/**
 * Controlla se l'utente ha già scelto una squadra.
 * Se sì -> non fa nulla e ritorna true.
 * Se no -> Mostra il popup di login e ritorna false.
 */
export function controllaAccesso(presidenti, callbackSuccesso) {
  // 1. Cerchiamo se c'è già un dato salvato
  if (
    SQUADRA_UTENTE &&
    presidenti.some((p) => p.getNomeRosa.toLowerCase() === SQUADRA_UTENTE)
  ) {
    console.log("Utente già loggato come:", SQUADRA_UTENTE);
    return true; // Accesso consentito
  }

  // 2. Se non c'è, mostriamo il login
  console.log("Utente non loggato. Mostro login.");
  modalLogin.style.display = "flex";

  // Popoliamo la select
  let options = `<option value="" disabled selected>-- Scegli la tua rosa --</option>`;
  presidenti.forEach((team) => {
    options += `<option value="${team.getNomeRosa.toLowerCase()}">${toCapitalize(team.getNomeRosa)}</option>`;
  });
  selectLogin.innerHTML = options;

  // Gestiamo il click su ENTRA
  btnEntra.onclick = () => {
    const scelta = selectLogin.value;
    if (scelta) {
      // SALVIAMO NEL BROWSER!
      localStorage.setItem("fanta_squadra_corrente", scelta);
      SQUADRA_UTENTE = scelta;

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
 * Funzione per fare il Logout (se vorrai mettere un tasto "Cambia Squadra")
 */
export function logout() {
  localStorage.removeItem("fanta_squadra_corrente");
  location.reload(); // Ricarica la pagina per far riapparire il login
}
