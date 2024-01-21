import * as settings from '../../../test-settings.json';
import { KeycloakDefaultPassword } from '../../setup-keycloak';

describe('0002-020', () => {
    before(() => {
        cy.createSettingsInGlobalThis();
        cy.initializeGlobalThisFromKeycloak().then(() => {
            globalThis.keycloakUser0002020 = <KeycloakUserInfo>{
                username: "0002-020",
                email: "0002-020@example.com",
                firstName: "0002-020",
                lastName: "0002-020",
                groups: [globalThis.keycloakGroupA.groupname],
                password: KeycloakDefaultPassword
            };
        });
    });

    after(() => {
        cy.keycloakDeleteUser(globalThis.keycloakUser0002020);
    });

    beforeEach(() => {
    });

    it('Validate test user is not assigned to target group', () => {
        cy.keycloakCheckIfUserIsNotInGroup(globalThis.keycloakUser0002020, globalThis.keycloakGroupA);
        cy.keycloakCheckIfUserIsNotInGroup(globalThis.keycloakUser0002020, globalThis.keycloakGroupB);
    });

    it('Create a user and assign it to the target group', () => {
        cy.keycloakCreateUser(globalThis.keycloakUser0002020);
    });

    it('Force provisioning by logging in interactively on the target system', () => {
        cy.targetStartInteractiveLogin();
        cy.keycloakPerformInteractiveLogin(globalThis.keycloakUser0002020);
        cy.targetValidateUserIsLoggedOn(globalThis.keycloakUser0002020);
        cy.targetEnsureUserIsProvisioned(globalThis.keycloakUser0002020);
        cy.targetLogOff();
    });

    it('Unassign user from the target group', () => {
        cy.keycloakRemoveUserFromGroup(globalThis.keycloakGroupA, globalThis.keycloakUser0002020)
    });

    it('Validate the user is deprovisioned (and their data is removed or scheduled to be removed)', () => {
        cy.targetEnsureUserIsDeprovisioned(globalThis.keycloakUser0002020);
    });

    it('Validate the user is can no longer log in interactively', () => {
        cy.keycloakPerformInteractiveLogin(globalThis.keycloakUser0002020);
        cy.keycloakValidateLoginFailed(globalThis.keycloakUser0002020);
    });   
});