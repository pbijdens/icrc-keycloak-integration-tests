import * as settings from '../../../test-settings.json';
import { KeycloakDefaultPassword } from '../../setup-keycloak';

describe('0002-041',  () => {
    before(() => {
        cy.createSettingsInGlobalThis().then(() => {
            globalThis.keycloakUser0002041 = <KeycloakUserInfo>{
                username: "user0002041",
                email: "user0002041@example.com",
                firstName: "user0002041",
                lastName: "user0002041",
                groups: [globalThis.keycloakGroupB.groupname],
                password: KeycloakDefaultPassword
            };
        });
    });

    beforeEach(() => {
    });

    it('Validate test user is not assigned to group a', () => {
        cy.keycloakCheckIfUserIsNotInGroup(globalThis.keycloakUser0002041, globalThis.keycloakGroupA);
        cy.keycloakCheckIfUserIsNotInGroup(globalThis.keycloakUser0002041, globalThis.keycloakGroupB);
    });

    it('Create a user and assign it to group a', () => {
        cy.keycloakCreateUser(globalThis.keycloakUser0002041);
    });

    it('Validate the user can interactively log in on the target system', () => {
        cy.targetStartInteractiveLogin();
        cy.keycloakPerformInteractiveLogin(globalThis.keycloakUser0002041);
    });

    it('Validate user only has group a rights', () => {
        cy.targetValidateUserHasGroupBRightsOnly(globalThis.keycloakUser0002041);
    });

    it('Log off', () => {
        cy.targetLogOff();
    });
});