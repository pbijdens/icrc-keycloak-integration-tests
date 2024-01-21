import * as settings from '../../../test-settings.json';
import { KeycloakDefaultPassword } from '../../setup-keycloak';

describe('0002-011',  () => {
    before(() => {     
        cy.createSettingsInGlobalThis();
        cy.initializeGlobalThisFromKeycloak().then(() => {
            globalThis.keycloakUser0002010B = <KeycloakUserInfo>{
                username: "0002-011",
                email: "0002-011@example.com",
                firstName: "0002-011",
                lastName: "0002-011",
                groups: [globalThis.keycloakGroupA.groupname],
                password: KeycloakDefaultPassword
            };
            cy.keycloakDeleteUser(globalThis.keycloakUser0002010B);
        });
    });

    after(() => {
    });

    beforeEach(() => {
    });    

    it('Create a user and assign it to the target group', () => {
        cy.keycloakCreateUser(globalThis.keycloakUser0002010B);
    });

    it('Validate the user can interactively log in on the target system', () => {
        cy.targetStartInteractiveLogin();
        cy.keycloakPerformInteractiveLogin(globalThis.keycloakUser0002010B);           
        cy.targetValidateUserIsLoggedOn(globalThis.keycloakUser0002010B);
    });

    it('Validate the user is provisioned in the target system properly', () => {
        cy.targetEnsureUserIsProvisioned(globalThis.keycloakUser0002010B);
    });

    it('Log off', () => {
        cy.targetLogOff();
    });
});