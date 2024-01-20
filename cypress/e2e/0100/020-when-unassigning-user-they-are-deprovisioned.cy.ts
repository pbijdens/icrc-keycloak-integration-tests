import * as settings from '../../../test-settings.json';
import { KeycloakDefaultPassword } from '../../setup-keycloak';

describe('0002-020', () => {
    before(() => {
        cy.createSettingsInGlobalThis().then(() => {
            globalThis.keycloakUser0002020 = <KeycloakUserInfo>{
                username: "user0002020",
                email: "user0002020@example.com",
                firstName: "user0002020",
                lastName: "user0002020",
                groups: [globalThis.keycloakGroupA.groupname],
                password: KeycloakDefaultPassword
            };
        });
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
        cy.keycloakPerformInteractiveLogin(globalThis.keycloakUser0002020); // TODO: expect failure
    });   
});