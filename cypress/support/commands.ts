import * as settings from '../../test-settings.json';
import '../setup-keycloak'
import { KeycloakDefaultPassword } from '../setup-keycloak';
import '../setup-targetsystem'

Cypress.Commands.add("chain", (url: string, method: string, data: any, form: boolean, getToken: () => string, check: (x: any) => void, chainMethod: () => void) => {
    const token = getToken && getToken();
    const headers = {
        'Authorization': `bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json; charset=utf-8',
    };
    if (!token) delete headers['Authorization'];
    if (form) delete headers['Content-Type'];

    cy.request({
        url: url,
        method: method,
        body: data,
        failOnStatusCode: false,
        form: form === true,
        headers: headers,
    }).then(response => check(response)).then(() => chainMethod());
});

Cypress.Commands.add("chainPrime", (steps: ChainedStep<any>[]) => {
    if (!steps || steps.length == 0) return;
    const step = steps.shift();
    cy.chain(step.url(), step.method, step.data && step.data(), step.form, step.getToken, step.onResponse, () => {
        cy.chainPrime(steps);
    })
});

Cypress.Commands.add("createSettingsInGlobalThis", () => {
    globalThis.settings = settings;

    globalThis.keycloakGroupA = <KeycloakGroupInfo>{
        groupname: "group-a"
    };
    globalThis.keycloakGroupB = <KeycloakGroupInfo>{
        groupname: "group-b"
    };
    globalThis.keycloakUser1 = <KeycloakUserInfo>{
        email: "user1@example.com",
        firstName: "Abc",
        lastName: "Qwerty",
        groups: [],
        password: KeycloakDefaultPassword,
        username: "user1"
    };
    globalThis.keycloakUser2 = <KeycloakUserInfo>{
        email: "user2@example.com",
        firstName: "Def",
        lastName: "Azerty",
        groups: [],
        password: KeycloakDefaultPassword,
        username: "user2"
    };
});

