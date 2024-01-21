import * as settings from '../test-settings.json';

// All these commands are specific for the target that's being tested and should be separately implemented per target.

// To use these tests, simply replace this file with one that actually does implement all methods for the target system.


Cypress.Commands.add('targetConfigure', () => {
});

Cypress.Commands.add('targetStartInteractiveLogin', () => {
     cy.log(`Preparing interactive login`);
     cy.visit('http://localhost:8000/');
     cy.contains('Start SAML Flow', { timeout: 1000 }).click();
     cy.url().should('contain', 'http://localhost:8080/realms/Humanitarians/protocol/saml', { timeout: 1000 });
     cy.get('form').within(() => {
          cy.get('input', { timeout: 1000 });
     });
});

Cypress.Commands.add('targetValidateUserIsLoggedOn', (user: KeycloakUserInfo) => {
     cy.url().should('contain', 'http://localhost:8000/acs.php', { timeout: 1000 });
     cy.contains(`Identified user: ${user.username}`, {matchCase: false});
});

Cypress.Commands.add('targetLogOff', () => {
     // Navigate to the application under test and attempt authentication
     cy.visit('http://localhost:8000/');
     cy.contains('Start SAML Flow', { timeout: 1000 }).click();
     // When on the login screen, make sure all storage and cookies are deleted "for all origins with which the test has interacted (docs)"
     cy.url().should('contain', 'http://localhost:8080/realms/Humanitarians/protocol/saml', { timeout: 1000 });
     cy.clearAllLocalStorage();

     // Validate here that the user is requested to log in again when authentication is attempted
     cy.visit('http://localhost:8000/');
     cy.contains('Start SAML Flow', { timeout: 1000 }).click();
     cy.url().should('contain', 'http://localhost:8080/realms/Humanitarians/protocol/saml', { timeout: 1000 });
     // cy.get('form').within(() => {
     //      cy.get('input', { timeout: 1000 });
     // });     
});

Cypress.Commands.add('targetEnsureUserIsProvisioned', (user: KeycloakUserInfo) => {
     cy.log('System does not support provisioning, therefore this test always succeeds.');
});

Cypress.Commands.add('targetEnsureUserIsDeprovisioned', (user: KeycloakUserInfo) => {
     cy.log('System does not support provisioning, therefore this test always succeeds.');
});

Cypress.Commands.add('targetEnsureUserDataDeletionIsRequested', (user: KeycloakUserInfo) => {
     cy.log('System does not support provisioning, therefore this test always succeeds.');
});

Cypress.Commands.add('targetValidateUserHasNoRights', (user: KeycloakUserInfo) => {
     cy.log('System does not support roles, therefore this test always succeeds.');
});

Cypress.Commands.add('targetValidateUserHasGroupARightsOnly', (user: KeycloakUserInfo) => {
     cy.log('System does not support roles, therefore this test always succeeds.');
});

Cypress.Commands.add('targetValidateUserHasGroupBRightsOnly', (user: KeycloakUserInfo) => {
     cy.log('System does not support roles, therefore this test always succeeds.');
});

Cypress.Commands.add('targetValidateUserHasGroupABRights', (user: KeycloakUserInfo) => {
     cy.log('System does not support roles, therefore this test always succeeds.');
});

Cypress.Commands.add('targetValidateUserAccessIsDeniedAfterLogin', () => {
     cy.log('System does not support roles, therefore this test always succeeds.');
});