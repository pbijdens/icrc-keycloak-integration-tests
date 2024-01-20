import * as settings from '../test-settings.json';

Cypress.Commands.add('targetConfigure', () => {
});

Cypress.Commands.add('targetStartInteractiveLogin', () => {
     cy.log(`Preparing interactive login`);
     cy.visit('https://www.google.com');
});

Cypress.Commands.add('targetLogOff', () => {
     cy.log(`TODO: Implement this methid. Deleting all cookies and data is not the best way to log off.`);
     cy.clearAllLocalStorage();
});

Cypress.Commands.add('targetEnsureUserIsProvisioned', (user: KeycloakUserInfo) => {
     throw new Error('Not implemented.')
});

Cypress.Commands.add('targetEnsureUserIsDeprovisioned', (user: KeycloakUserInfo) => {
     throw new Error('Not implemented.')
});

Cypress.Commands.add('targetEnsureUserDataDeletionIsRequested', (user: KeycloakUserInfo) => {
     throw new Error('Not implemented.')
});

Cypress.Commands.add('targetValidateUserHasNoRights', (user: KeycloakUserInfo) => {
     throw new Error('Not implemented.')
});

Cypress.Commands.add('targetValidateUserHasGroupARightsOnly', (user: KeycloakUserInfo) => {
     throw new Error('Not implemented.')
});

Cypress.Commands.add('targetValidateUserHasGroupBRightsOnly', (user: KeycloakUserInfo) => {
     throw new Error('Not implemented.')
});

Cypress.Commands.add('targetValidateUserHasGroupABRights', (user: KeycloakUserInfo) => {
     throw new Error('Not implemented.')
});