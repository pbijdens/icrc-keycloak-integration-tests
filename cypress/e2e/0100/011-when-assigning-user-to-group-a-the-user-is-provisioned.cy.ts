import * as settings from '../../../test-settings.json';
import { KeycloakDefaultPassword } from '../../setup-keycloak';

describe('0002-011',  () => {
    before(() => {     
        cy.createSettingsInGlobalThis().then(() => {
            globalThis.keycloakUser0002010B = <KeycloakUserInfo>{
                username: "user0002011B",
                email: "user0002011B@example.com",
                firstName: "0002011B",
                lastName: "0002011B",
                groups: [globalThis.keycloakGroupA.groupname],
                password: KeycloakDefaultPassword
            };
        });
    });

    beforeEach(() => {
    });

    it('Validate test user is not assigned to target group', () => {
        cy.keycloakCheckIfUserIsNotInGroup(globalThis.keycloakUser0002010B, globalThis.keycloakGroupA);
        cy.keycloakCheckIfUserIsNotInGroup(globalThis.keycloakUser0002010B, globalThis.keycloakGroupB);
    });

    it('Create a user and assign it to the target group', () => {
        cy.keycloakCreateUser(globalThis.keycloakUser0002010B);
    });

    it('Validate the user can interactively log in on the target system', () => {
        cy.targetStartInteractiveLogin();
        cy.keycloakPerformInteractiveLogin(globalThis.keycloakUser0002010B);           
    });

    it('Validate the user is provisioned in the target system properly', () => {
        cy.targetEnsureUserIsProvisioned(globalThis.keycloakUser0002010B);
    });

    it('Log off', () => {
        cy.targetLogOff();
    });
});