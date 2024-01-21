import * as settings from '../../../test-settings.json';

describe('0001-001',  () => {
    before(() => {     
        cy.createSettingsInGlobalThis();
    });    

    beforeEach(() => {
    });

    it('Configure the Keycloak instance', () => {
        cy.log(`Using ${globalThis.settings.keycloak.api} as keycloak API`);
        cy.keycloakConfigure();    
    });

    it('Configure system under test', () => {
        cy.log(`Using ${globalThis.settings.keycloak.api} as keycloak API`);
        cy.targetConfigure();
    });
});