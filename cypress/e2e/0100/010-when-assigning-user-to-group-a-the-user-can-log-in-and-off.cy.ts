import * as settings from '../../../test-settings.json';
import { KeycloakDefaultPassword } from '../../setup-keycloak';

describe('0002-010', () => {
    before(() => {
        cy.createSettingsInGlobalThis().then(() => {
            globalThis.keycloakUser0002010A = <KeycloakUserInfo>{
                username: "user0002010A",
                email: "user0002010A@example.com",
                firstName: "0002010A",
                lastName: "0002010A",
                groups: [globalThis.keycloakGroupA.groupname],
                password: KeycloakDefaultPassword
            };
        });
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
    });

    it('Validate the user can log off', () => {
        cy.targetLogOff();
    });
});