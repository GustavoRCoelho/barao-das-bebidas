/// <reference types="cypress" />

/**
 * Ignora exceções não críticas do bundle (ex.: hidratação / third-party em dev).
 */
Cypress.on("uncaught:exception", (err) => {
  if (err.message.includes("ResizeObserver")) {
    return false;
  }
  return undefined;
});
