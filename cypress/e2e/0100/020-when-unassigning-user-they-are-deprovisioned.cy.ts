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
                groups: [globalThis.targetKeycloakSecurityGroupA.groupname],
                password: KeycloakDefaultPassword
            };
            cy.keycloakDeleteUser(globalThis.keycloakUser0002020);
        });
    });

    after(() => {
        cy.keycloakDeleteUser(globalThis.keycloakUser0002020);
    });

    beforeEach(() => {
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
        cy.keycloakRemoveUserFromGroup(globalThis.targetKeycloakSecurityGroupA, globalThis.keycloakUser0002020)
    });

    it('Validate the user is deprovisioned (and their data is removed or scheduled to be removed)', () => {
        cy.targetEnsureUserIsDeprovisioned(globalThis.keycloakUser0002020);
    });

    it('Validate the user can no longer log in interactively', () => {
        cy.targetStartInteractiveLogin();
        cy.keycloakPerformInteractiveLogin(globalThis.keycloakUser0002020);
        cy.targetValidateUserAccessIsDeniedAfterLogin();
    });   
});