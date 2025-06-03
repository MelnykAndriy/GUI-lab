/// <reference types="cypress" />

declare namespace Cypress {
  interface AUTWindow {
    POLLING_INTERVAL?: number;
  }
}
