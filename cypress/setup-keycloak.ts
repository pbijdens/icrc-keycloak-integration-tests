import { getAdapter } from 'axios';
import * as settings from '../test-settings.json';

export const KeycloakRealm = require('../keycloak/Humanitarian_Realm-realm.json');

export const KeycloakDefaultPassword = '$DefaultPassword!1';

// Shared login step to be used in the administrative chains, logs the admin user in that's
// created when the keycloak docker container is deployed.
export const KeycloakLoginStep = {
     url: () => `${settings.keycloak.api}/realms/master/protocol/openid-connect/token`,
     method: 'POST',
     data: () => {
          return {
               "client_id": "admin-cli",
               "username": 'admin',
               "password": 'admin',
               "grant_type": 'password',
          }
     },
     onResponse: (response) => {
          expect(response.status).to.eq(200);
          globalThis.keycloakToken = response.body.access_token;
     },
     form: true,
     getToken: undefined,
};

Cypress.Commands.add('keycloakConfigure', () => {
     cy.log('Setting up KeyCloak');

     globalThis.KeycloakDefaultPassword = KeycloakDefaultPassword;

     cy.chainPrime([
          // authenticate to the keycloak instance and store the admin access token in globalThis.keycloakToken
          KeycloakLoginStep,
          // create the realm
          {
               url: () => `${settings.keycloak.api}/admin/realms`,
               method: 'POST',
               data: () => {
                    return JSON.parse(JSON.stringify(KeycloakRealm)); // ensures the object has a constructor, which it does not have after the import
               },
               onResponse: (response) => {
                    expect(response.isOkStatusCode || response.status == 409, `Realm creation success or already existed: ${response.isOkStatusCode}`).to.eq(true);
               },
               form: false,
               getToken: () => globalThis.keycloakToken,
          }
     ]).then(() => {
          cy.initializeGlobalThisFromKeycloak().then(() => {
               if (!globalThis.keycloakGroupA.id) cy.keycloakCreateGroup(globalThis.keycloakGroupA);
               if (!globalThis.keycloakGroupB.id) cy.keycloakCreateGroup(globalThis.keycloakGroupB);
               if (!globalThis.keycloakUser1.id) cy.keycloakCreateUser(globalThis.keycloakUser1);
               if (!globalThis.keycloakUser2.id) cy.keycloakCreateUser(globalThis.keycloakUser2);
          }).then(()=>{
               // Run some basic user and group tests to make sure that the keycloak instance is actually functioning properly
               if (globalThis.keycloakGroupC.id) cy.keycloakDeleteGroup(globalThis.keycloakGroupC);
               cy.keycloakCreateGroup(globalThis.keycloakGroupC);
               cy.keycloakDeleteGroup(globalThis.keycloakGroupC);

               cy.keycloakAssignUserToGroup(globalThis.keycloakGroupB, globalThis.keycloakUser1);
               cy.keycloakAssignUserToGroup(globalThis.keycloakGroupA, globalThis.keycloakUser2);
               cy.keycloakAssignUserToGroup(globalThis.keycloakGroupB, globalThis.keycloakUser2);

               cy.keycloakCheckIfUserIsNotInGroup(globalThis.keycloakGroupA, globalThis.keycloakUser1);
               cy.keycloakCheckIfUserIsInGroup(globalThis.keycloakGroupB, globalThis.keycloakUser1);
               cy.keycloakCheckIfUserIsInGroup(globalThis.keycloakGroupA, globalThis.keycloakUser2);
               cy.keycloakCheckIfUserIsInGroup(globalThis.keycloakGroupB, globalThis.keycloakUser2);

               cy.keycloakRemoveUserFromGroup(globalThis.keycloakGroupB, globalThis.keycloakUser1);
               cy.keycloakRemoveUserFromGroup(globalThis.keycloakGroupA, globalThis.keycloakUser2);
               cy.keycloakRemoveUserFromGroup(globalThis.keycloakGroupB, globalThis.keycloakUser2);

               cy.keycloakCheckIfUserIsNotInGroup(globalThis.keycloakGroupA, globalThis.keycloakUser1);
               cy.keycloakCheckIfUserIsNotInGroup(globalThis.keycloakGroupB, globalThis.keycloakUser1);
               cy.keycloakCheckIfUserIsNotInGroup(globalThis.keycloakGroupA, globalThis.keycloakUser2);
               cy.keycloakCheckIfUserIsNotInGroup(globalThis.keycloakGroupB, globalThis.keycloakUser2);

               cy.keycloakDeleteUser(globalThis.keycloakUser1);
               cy.keycloakDeleteUser(globalThis.keycloakUser2);

               // We're left with zero suers and group-a and group-b that should already have existed.
          });
     });
});

Cypress.Commands.add('keycloakCreateUser', (user: KeycloakUserInfo) => {
     // POST /admin/realms/{realm}/users @ https://www.keycloak.org/docs-api/22.0.1/rest-api/index.html#_users
     cy.chainPrime([
          KeycloakLoginStep,
          {
               url: () => `${settings.keycloak.api}/admin/realms/${KeycloakRealm.realm}/users`,
               method: 'POST',
               data: () => {
                    return <KeycloakCreateUserRepresentation>{
                         credentials: [<KeycloakCreateUserCredentialRepresentation>{
                              temporary: false,
                              type: "password",
                              value: user.password
                         }],
                         email: user.email,
                         emailVerified: true,
                         enabled: true,
                         firstName: user.firstName,
                         lastName: user.lastName,
                         groups: user.groups,
                         username: user.username,
                    };
               },
               onResponse: (response) => {
                    const location = response.headers['location'];
                    user.id = `${location}`.replace(/^.*[/]/, '');
                    expect(response.isOkStatusCode, `User creation status: ${response.isOkStatusCode} @ ${user.id}`).to.eq(true);
               },
               form: false,
               getToken: () => globalThis.keycloakToken,
          }
     ]);
});

Cypress.Commands.add('keycloakDeleteUser', (user: KeycloakUserInfo) => {
     // DELETE /admin/realms/{realm}/users/{id} @ https://www.keycloak.org/docs-api/22.0.1/rest-api/index.html#_users
     cy.chainPrime([
          KeycloakLoginStep,
          {
               url: () => `${settings.keycloak.api}/admin/realms/${KeycloakRealm.realm}/users/${user.id}`,
               method: 'DELETE',
               data: () => { },
               onResponse: (response) => {
                    expect(response.isOkStatusCode || response.status == 404, `User deletion status: ${response.isOkStatusCode} @ ${user.id}`).to.eq(true);
               },
               form: true,
               getToken: () => globalThis.keycloakToken,
          }
     ]);
});

Cypress.Commands.add('keycloakCreateGroup', (group: KeycloakGroupInfo) => {
     // POST /admin/realms/{realm}/groups
     cy.chainPrime([
          KeycloakLoginStep,
          {
               url: () => `${settings.keycloak.api}/admin/realms/${KeycloakRealm.realm}/groups`,
               method: 'POST',
               data: () => {
                    return <KeycloakCreateGroupRepresentation>{
                         name: group.groupname
                    };
               },
               onResponse: (response) => {
                    const location = response.headers['location'];
                    group.id = `${location}`.replace(/^.*[/]/, '');
                    expect(response.isOkStatusCode, `Group creation status: ${response.isOkStatusCode} @ ${group.id}`).to.eq(true);
               },
               form: false,
               getToken: () => globalThis.keycloakToken,
          }
     ]);

});

Cypress.Commands.add('keycloakDeleteGroup', (group: KeycloakGroupInfo) => {
     // DELETE /admin/realms/{realm}/groups/{id}

     cy.chainPrime([
          KeycloakLoginStep,
          {
               url: () => `${settings.keycloak.api}/admin/realms/${KeycloakRealm.realm}/groups/${group.id}`,
               method: 'DELETE',
               data: () => {
               },
               onResponse: (response) => {
                    expect(response.isOkStatusCode || response.status == 404, `Group deletion status: ${response.isOkStatusCode} @ ${group.id}`).to.eq(true);
               },
               form: true,
               getToken: () => globalThis.keycloakToken,
          }
     ]);
});

Cypress.Commands.add('keycloakAssignUserToGroup', (group: KeycloakGroupInfo, user: KeycloakUserInfo) => {
     // PUT /admin/realms/${KeycloakRealm.realm}/users/{userid}/groups/{groupid}
     cy.chainPrime([
          KeycloakLoginStep,
          {
               url: () => `${settings.keycloak.api}/admin/realms/${KeycloakRealm.realm}/users/${user.id}/groups/${group.id}`,
               method: 'PUT',
               data: () => {
               },
               onResponse: (response) => {
                    expect(response.isOkStatusCode, `Added group ${group.id} to user ${user.id}: ${response.isOkStatusCode}`).to.eq(true);
               },
               form: false,
               getToken: () => globalThis.keycloakToken,
          }
     ]);
});

Cypress.Commands.add('keycloakRemoveUserFromGroup', (group: KeycloakGroupInfo, user: KeycloakUserInfo) => {
     // DELETE /admin/realms/${KeycloakRealm.realm}/users/{userid}/groups/{groupid}
     cy.chainPrime([
          KeycloakLoginStep,
          {
               url: () => `${settings.keycloak.api}/admin/realms/${KeycloakRealm.realm}/users/${user.id}/groups/${group.id}`,
               method: 'DELETE',
               data: () => {
               },
               onResponse: (response) => {
                    expect(response.isOkStatusCode, `Added group ${group.id} to user ${user.id}: ${response.isOkStatusCode}`).to.eq(true);
               },
               form: false,
               getToken: () => globalThis.keycloakToken,
          }
     ]);
});

Cypress.Commands.add('keycloakCheckIfUserIsInGroup', (group: KeycloakGroupInfo, user: KeycloakUserInfo) => {
     // GET /admin/realms/{realm}/users/{userid}/groups
     cy.chainPrime([
          KeycloakLoginStep,
          {
               url: () => `${settings.keycloak.api}/admin/realms/${KeycloakRealm.realm}/users/${user.id}/groups`,
               method: 'GET',
               data: () => {
               },
               onResponse: (response) => {
                    cy.log(`${response.body}`, response.body);
                    const found = (response.body || []).find(x => x.id === group.id);
                    expect(response.isOkStatusCode, `${user.username}: ${response.isOkStatusCode}`).to.eq(true);
                    expect(found && true, `Expected that ${group.groupname} was in ${user.username}'s groups`).to.be.true;
               },
               form: false,
               getToken: () => globalThis.keycloakToken,
          }
     ]);
});

Cypress.Commands.add('keycloakCheckIfUserIsNotInGroup', (group: KeycloakGroupInfo, user: KeycloakUserInfo) => {
     // GET /admin/realms/{realm}/users/{userid}/groups
     cy.chainPrime([
          KeycloakLoginStep,
          {
               url: () => `${settings.keycloak.api}/admin/realms/${KeycloakRealm.realm}/users/${user.id}/groups`,
               method: 'GET',
               data: () => {
               },
               onResponse: (response) => {
                    cy.log(`${response.body}`, response.body);
                    const found = (response.body || []).find(x => x.id === group.id);
                    expect(response.isOkStatusCode, `${user.username}: ${response.isOkStatusCode}`).to.eq(true);
                    expect(!(found && true), `Expected that ${group.groupname} was in ${user.username}'s groups`).to.be.true;
               },
               form: false,
               getToken: () => globalThis.keycloakToken,
          }
     ]);
});

Cypress.Commands.add('keycloakGetGroups', (processData: (groups: any[]) => void) => {
     // GET /admin/realms/{realm}/groups
     cy.chainPrime([
          KeycloakLoginStep,
          {
               url: () => `${settings.keycloak.api}/admin/realms/${KeycloakRealm.realm}/groups`,
               method: 'GET',
               data: () => {
               },
               onResponse: (response) => {
                    expect(response.isOkStatusCode, `Read the list of groups: ${response.isOkStatusCode}`).to.eq(true);
                    processData && processData(response.body);
               },
               form: false,
               getToken: () => globalThis.keycloakToken,
          }
     ]);
});

Cypress.Commands.add('keycloakGetUsers', (processData: (users: any[]) => void) => {
     // GET /admin/realms/{realm}/users
     cy.chainPrime([
          KeycloakLoginStep,
          {
               url: () => `${settings.keycloak.api}/admin/realms/${KeycloakRealm.realm}/users`,
               method: 'GET',
               data: () => {
               },
               onResponse: (response) => {
                    expect(response.isOkStatusCode, `Read the list of groups: ${response.isOkStatusCode}`).to.eq(true);
                    processData && processData(response.body);
               },
               form: false,
               getToken: () => globalThis.keycloakToken,
          }
     ]);
});

Cypress.Commands.add('keycloakPerformInteractiveLogin', (user: KeycloakUserInfo) => {
     cy.get('form').within(() => {
          cy.get('input[name="username"]', { timeout: 1000 }).type(user.username);
          cy.get('input[name="password"]', { timeout: 1000 }).type(user.password);
          cy.get('input[name="login"]', { timeout: 1000 }).click();
     });
});

Cypress.Commands.add('keycloakValidateLoginFailed', (user: KeycloakUserInfo) => {
     cy.get('form').within(() => {
          // Make sure we're still on the login screen
          cy.get('span[id="input-error"]', { timeout: 1000 });
          cy.get('input[name="username"]', { timeout: 1000 });
          cy.get('input[name="password"]', { timeout: 1000 });
          cy.get('input[name="login"]', { timeout: 1000 });
     });
});

export class KeycloakCreateUserRepresentation {
     id: string;
     username: string;
     enabled: boolean = true;
     emailVerified: boolean = true;
     firstName: string;
     lastName: string;
     email: string;
     credentials: KeycloakCreateUserCredentialRepresentation[];
     groups: string[];
}

export class KeycloakCreateUserCredentialRepresentation {
     type: string = "password";
     temporary: boolean = false;
     value: string = "Test123!1@";
}

export class KeycloakCreateGroupRepresentation {
     id: string;
     name: string;
}