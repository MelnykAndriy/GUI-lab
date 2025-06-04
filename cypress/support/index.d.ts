/// <reference types="cypress" />
import "cypress-file-upload";

declare namespace Cypress {
  interface AUTWindow {
    POLLING_INTERVAL?: number;
  }
}

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to attach a file to an input element
       * @example cy.get('input').attachFile('test.jpg')
       */
      attachFile: (
        fileDetails:
          | string
          | {
              fileContent: string;
              fileName: string;
              mimeType: string;
              encoding?: string;
            },
      ) => Chainable<Element>;
    }
  }
}

export {};
