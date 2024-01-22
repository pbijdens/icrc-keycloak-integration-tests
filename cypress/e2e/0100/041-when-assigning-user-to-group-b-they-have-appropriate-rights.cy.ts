import * as settings from '../../../test-settings.json';
import { KeycloakDefaultPassword } from '../../setup-keycloak';

describe('0002-041',  () => {
    before(() => {
        cy.createSettingsInGlobalThis();
        cy.initializeGlobalThisFromKeycloak().then(() => {
            globalThis.keycloakUser0002041 = <KeycloakUserInfo>{
                username: "0002-041",
                email: "0002-041@example.com",
                firstName: "0002-041",
                lastName: "0002-041",
                groups: [globalThis.targetKeycloakSecurityGroupB.groupname],
                password: KeycloakDefaultPassword
            };
        });
    });

    after(() => {
        cy.keycloakDeleteUser(globalThis.keycloakUser0002041);
    });

    beforeEach(() => {
    });

    it('Validate test user is not assigned to group a', () => {
        cy.keycloakCheckIfUserIsNotInGroup(globalThis.keycloakUser0002041, globalThis.targetKeycloakSecurityGroupA);
        cy.keycloakCheckIfUserIsNotInGroup(globalThis.keycloakUser0002041, globalThis.targetKeycloakSecurityGroupB);
    });

    it('Create a user and assign it to group a', () => {
        cy.keycloakCreateUser(globalThis.keycloakUser0002041);
    });

    it('Validate the user can interactively log in on the target system', () => {
        cy.targetStartInteractiveLogin();
        cy.keycloakPerformInteractiveLogin(globalThis.keycloakUser0002041);
        cy.targetValidateUserIsLoggedOn(globalThis.keycloakUser0002041);
    });

    it('Validate user only has group a rights', () => {
        cy.targetValidateUserHasGroupBRightsOnly(globalThis.keycloakUser0002041);
    });

    it('Log off', () => {
        cy.targetLogOff();
    });
});