import * as settings from '../../../test-settings.json';
import { KeycloakDefaultPassword } from '../../setup-keycloak';

describe('0002-030', () => {
    before(() => {
        cy.createSettingsInGlobalThis();
        cy.initializeGlobalThisFromKeycloak().then(() => {
            globalThis.keycloakUser0002030 = <KeycloakUserInfo>{
                username: "0002-030",
                email: "0002-030@example.com",
                firstName: "0002-030",
                lastName: "0002-030",
                groups: [globalThis.keycloakGroupA.groupname],
                password: KeycloakDefaultPassword
            };
        });
    });

    after(() => {
    });

    beforeEach(() => {
    });

    it('Create a user and assign it to the target group', () => {
        cy.keycloakCheckIfUserIsNotInGroup(globalThis.keycloakUser0002030, globalThis.keycloakGroupA);
        cy.keycloakCheckIfUserIsNotInGroup(globalThis.keycloakUser0002030, globalThis.keycloakGroupB);
        cy.keycloakCreateUser(globalThis.keycloakUser0002030);
    });

    it('Force provisioning by logging in interactively on the target system', () => {
        cy.targetStartInteractiveLogin();
        cy.keycloakPerformInteractiveLogin(globalThis.keycloakUser0002030);
        cy.targetValidateUserIsLoggedOn(globalThis.keycloakUser0002030);
        cy.targetLogOff();
    });

    it('Delete the user in keycloak', () => {
        cy.keycloakDeleteUser(globalThis.keycloakUser0002030);
    });

    it('Validate the user is deprovisioned', () => {
        cy.targetEnsureUserIsDeprovisioned(globalThis.keycloakUser0002030);
    });

    // we're not testing keycloak so we will not test the the user can't log in
});