import * as settings from '../../../test-settings.json';
import { KeycloakDefaultPassword } from '../../setup-keycloak';

describe('0002-040',  () => {
    before(() => {
        cy.createSettingsInGlobalThis().then(() => {
            globalThis.keycloakUser0002040 = <KeycloakUserInfo>{
                username: "user0002040",
                email: "user0002040@example.com",
                firstName: "user0002040",
                lastName: "user0002040",
                groups: [globalThis.keycloakGroupA.groupname],
                password: KeycloakDefaultPassword
            };
        });
    });

    beforeEach(() => {
    });

    it('Validate test user is not assigned to group a', () => {
        cy.keycloakCheckIfUserIsNotInGroup(globalThis.keycloakUser0002040, globalThis.keycloakGroupA);
        cy.keycloakCheckIfUserIsNotInGroup(globalThis.keycloakUser0002040, globalThis.keycloakGroupB);
    });

    it('Create a user and assign it to group a', () => {
        cy.keycloakCreateUser(globalThis.keycloakUser0002040);
    });

    it('Validate the user can interactively log in on the target system', () => {
        cy.targetStartInteractiveLogin();
        cy.keycloakPerformInteractiveLogin(globalThis.keycloakUser0002040);
    });

    it('Validate user only has group a rights', () => {
        cy.targetValidateUserHasGroupARightsOnly(globalThis.keycloakUser0002040);
    });

    it('Log off', () => {
        cy.targetLogOff();
    });
});