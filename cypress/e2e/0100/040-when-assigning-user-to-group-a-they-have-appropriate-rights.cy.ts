import * as settings from '../../../test-settings.json';
import { KeycloakDefaultPassword } from '../../setup-keycloak';

describe('0002-040',  () => {
    before(() => {
        cy.createSettingsInGlobalThis();
        cy.initializeGlobalThisFromKeycloak().then(() => {
            globalThis.keycloakUser0002040 = <KeycloakUserInfo>{
                username: "0002-040",
                email: "0002-040@example.com",
                firstName: "0002-040",
                lastName: "0002-040",
                groups: [globalThis.targetKeycloakSecurityGroupA.groupname],
                password: KeycloakDefaultPassword
            };
        });
    });

    after(() => {
        cy.keycloakDeleteUser(globalThis.keycloakUser0002040);
    });

    beforeEach(() => {
    });

    it('Validate test user is not assigned to group a', () => {
        cy.keycloakCheckIfUserIsNotInGroup(globalThis.keycloakUser0002040, globalThis.targetKeycloakSecurityGroupA);
        cy.keycloakCheckIfUserIsNotInGroup(globalThis.keycloakUser0002040, globalThis.targetKeycloakSecurityGroupB);
    });

    it('Create a user and assign it to group a', () => {
        cy.keycloakCreateUser(globalThis.keycloakUser0002040);
    });

    it('Validate the user can interactively log in on the target system', () => {
        cy.targetStartInteractiveLogin();
        cy.keycloakPerformInteractiveLogin(globalThis.keycloakUser0002040);
        cy.targetValidateUserIsLoggedOn(globalThis.keycloakUser0002040);
    });

    it('Validate user only has group a rights', () => {
        cy.targetValidateUserHasGroupARightsOnly(globalThis.keycloakUser0002040);
    });

    it('Log off', () => {
        cy.targetLogOff();
    });
});