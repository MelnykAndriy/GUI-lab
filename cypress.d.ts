/// <reference types="cypress" />
import { mount } from 'cypress/react'
import { MountOptions, MountReturn } from 'cypress/react'
import { ByRoleMatcher } from '@testing-library/dom/types/matches'

declare global {
  namespace Cypress {
    interface Chainable {
      // Testing Library commands
      findByRole(role: ByRoleMatcher, options?: any): Chainable<JQuery<HTMLElement>>
      findByLabelText(label: string | RegExp): Chainable<JQuery<HTMLElement>>
      findByText(text: string | RegExp): Chainable<JQuery<HTMLElement>>
      findByTestId(testId: string): Chainable<JQuery<HTMLElement>>
      findByPlaceholderText(text: string | RegExp): Chainable<JQuery<HTMLElement>>
      findAllByTestId(testId: string): Chainable<JQuery<HTMLElement>>
      findAllByRole(role: string, options?: any): Chainable<JQuery<HTMLElement>>
      
      // Custom commands
      mount: typeof mount
    }
  }
} 