import * as settings from '../../../test-settings.json';
import { KeycloakDefaultPassword } from '../../setup-keycloak';

describe('0002-010', () => {
    before(() => {
        cy.createSettingsInGlobalThis();
        cy.initializeGlobalThisFromKeycloak().then(() => {
            globalThis.keycloakUser0002010A = <KeycloakUserInfo>{
                username: "0002-010",
                email: "0002-010@example.com",
                firstName: "0002-010",
                lastName: "0002-010",
                groups: [globalThis.keycloakGroupA.groupname],
                password: KeycloakDefaultPassword
            };
        });
    });

    after(() => {
        cy.keycloakDeleteUser(globalThis.keycloakUser0002010A);
    });

    beforeEach(() => {
    });

    it('Validate test user is not assigned to target group', () => {
        cy.keycloakCheckIfUserIsNotInGroup(globalThis.keycloakUser0002010A, globalThis.keycloakGroupA);
        cy.keycloakCheckIfUserIsNotInGroup(globalThis.keycloakUser0002010A, globalThis.keycloakGroupB);
    });

    it('Create a user and assign it to group A', () => {
        cy.keycloakCreateUser(globalThis.keycloakUser0002010A);
    });

    it('Validate the user can interactively log in on the target system', () => {
        cy.targetStartInteractiveLogin();
        cy.keycloakPerformInteractiveLogin(globalThis.keycloakUser0002010A);
        cy.targetValidateUserIsLoggedOn(globalThis.keycloakUser0002010A);
    });

    it('Validate the user can log off', () => {
        cy.targetLogOff();
    });
});