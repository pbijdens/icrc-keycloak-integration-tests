import * as settings from '../../../test-settings.json';
import { KeycloakDefaultPassword } from '../../setup-keycloak';

describe('0002-042',  () => {
    before(() => {
        cy.createSettingsInGlobalThis();
        cy.initializeGlobalThisFromKeycloak().then(() => {
            globalThis.keycloakUser0002042 = <KeycloakUserInfo>{
                username: "0002-042",
                email: "0002-042@example.com",
                firstName: "0002-042",
                lastName: "0002-042",
                groups: [globalThis.targetKeycloakSecurityGroupA.groupname,globalThis.targetKeycloakSecurityGroupB.groupname],
                password: KeycloakDefaultPassword
            };
        });
    });

    after(() => {
        cy.keycloakDeleteUser(globalThis.keycloakUser0002042);
    });

    beforeEach(() => {
    });

    it('Validate test user is not assigned to group a or group b', () => {
        cy.keycloakCheckIfUserIsNotInGroup(globalThis.keycloakUser0002042, globalThis.targetKeycloakSecurityGroupA);
        cy.keycloakCheckIfUserIsNotInGroup(globalThis.keycloakUser0002042, globalThis.targetKeycloakSecurityGroupB);
    });

    it('Create a user and assign it to group a and group b', () => {
        cy.keycloakCreateUser(globalThis.keycloakUser0002042);
    });

    it('Validate the user can interactively log in on the target system', () => {
        cy.targetStartInteractiveLogin();
        cy.keycloakPerformInteractiveLogin(globalThis.keycloakUser0002042);        
    });

    it('Validate user has rights they should have in both group a and b', () => {
        cy.targetValidateUserHasGroupABRights(globalThis.keycloakUser0002042);
    });

    it('Remove the user from group b', () => {
        cy.targetLogOff();
        cy.keycloakRemoveUserFromGroup(globalThis.targetKeycloakSecurityGroupB, globalThis.keycloakUser0002042)
        cy.targetStartInteractiveLogin();
        cy.keycloakPerformInteractiveLogin(globalThis.keycloakUser0002042);        
        cy.targetValidateUserIsLoggedOn(globalThis.keycloakUser0002042);
    });

    it('Validate user has no rights they should not have when not in group b, and all in group a', () => {
        cy.targetValidateUserHasGroupARightsOnly(globalThis.keycloakUser0002042);
    });

    it('Log off', () => {
        cy.targetLogOff();
    });    
});