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
          return globalThis.settings.keycloak.credentials;
     },
     onResponse: (response) => {
          expect(response.status).to.eq(200);
          globalThis.keycloakToken = response.body.access_token;
     },
     form: true,
     getToken: undefined,
};

// Performs basic configuration of keycloak. Will install the "Humanitarian" realm if it does not already exist.
// Will also create two groups. If the targetKeycloakSecurityGroupA and targetKeycloakSecurityGroupB groups
// do not exist these will be created also. For the rest this just runs some basic tests that should have no
// lasting effect.
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
               if (!globalThis.targetKeycloakSecurityGroupA.id) cy.keycloakCreateGroup(globalThis.targetKeycloakSecurityGroupA);
               if (!globalThis.targetKeycloakSecurityGroupB.id) cy.keycloakCreateGroup(globalThis.targetKeycloakSecurityGroupB);
               if (!globalThis.keycloakUser1.id) cy.keycloakCreateUser(globalThis.keycloakUser1);
               if (!globalThis.keycloakUser2.id) cy.keycloakCreateUser(globalThis.keycloakUser2);
          }).then(()=>{
               // Run some basic user and group tests to make sure that the keycloak instance is actually functioning properly
               if (globalThis.keycloakGroupC.id) cy.keycloakDeleteGroup(globalThis.keycloakGroupC);
               cy.keycloakCreateGroup(globalThis.keycloakGroupC);
               cy.keycloakDeleteGroup(globalThis.keycloakGroupC);

               cy.keycloakAssignUserToGroup(globalThis.targetKeycloakSecurityGroupB, globalThis.keycloakUser1);
               cy.keycloakAssignUserToGroup(globalThis.targetKeycloakSecurityGroupA, globalThis.keycloakUser2);
               cy.keycloakAssignUserToGroup(globalThis.targetKeycloakSecurityGroupB, globalThis.keycloakUser2);

               cy.keycloakCheckIfUserIsNotInGroup(globalThis.targetKeycloakSecurityGroupA, globalThis.keycloakUser1);
               cy.keycloakCheckIfUserIsInGroup(globalThis.targetKeycloakSecurityGroupB, globalThis.keycloakUser1);
               cy.keycloakCheckIfUserIsInGroup(globalThis.targetKeycloakSecurityGroupA, globalThis.keycloakUser2);
               cy.keycloakCheckIfUserIsInGroup(globalThis.targetKeycloakSecurityGroupB, globalThis.keycloakUser2);

               cy.keycloakRemoveUserFromGroup(globalThis.targetKeycloakSecurityGroupB, globalThis.keycloakUser1);
               cy.keycloakRemoveUserFromGroup(globalThis.targetKeycloakSecurityGroupA, globalThis.keycloakUser2);
               cy.keycloakRemoveUserFromGroup(globalThis.targetKeycloakSecurityGroupB, globalThis.keycloakUser2);

               cy.keycloakCheckIfUserIsNotInGroup(globalThis.targetKeycloakSecurityGroupA, globalThis.keycloakUser1);
               cy.keycloakCheckIfUserIsNotInGroup(globalThis.targetKeycloakSecurityGroupB, globalThis.keycloakUser1);
               cy.keycloakCheckIfUserIsNotInGroup(globalThis.targetKeycloakSecurityGroupA, globalThis.keycloakUser2);
               cy.keycloakCheckIfUserIsNotInGroup(globalThis.targetKeycloakSecurityGroupB, globalThis.keycloakUser2);

               cy.keycloakDeleteUser(globalThis.keycloakUser1);
               cy.keycloakDeleteUser(globalThis.keycloakUser2);

               // We're left with zero suers and group-a and group-b that should already have existed.
          });
     });
});

// Uses the REST API to create a new user in keycloak
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

// Uses the REST API to delete a user from keycloak
Cypress.Commands.add('keycloakDeleteUser', (user: KeycloakUserInfo) => {
     // DELETE /admin/realms/{realm}/users/{id} @ https://www.keycloak.org/docs-api/22.0.1/rest-api/index.html#_users
     cy.keycloakMakeSureUserIDIsPopulated(user);
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

// Uses the REST API to create a new security group in keycloak
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

// Uses the REST API to delete s ecurity group from keycloak
Cypress.Commands.add('keycloakDeleteGroup', (group: KeycloakGroupInfo) => {
     // DELETE /admin/realms/{realm}/groups/{id}
     cy.keycloakMakeSureGroupIDIsPopulated(group);
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

// Uses the REST API to assign a user to security group in keycloak
Cypress.Commands.add('keycloakAssignUserToGroup', (group: KeycloakGroupInfo, user: KeycloakUserInfo) => {
     // PUT /admin/realms/${KeycloakRealm.realm}/users/{userid}/groups/{groupid}
     cy.keycloakMakeSureUserIDIsPopulated(user);
     cy.keycloakMakeSureGroupIDIsPopulated(group);
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

// Uses the REST API to unassign a user from a security group in keycloak
Cypress.Commands.add('keycloakRemoveUserFromGroup', (group: KeycloakGroupInfo, user: KeycloakUserInfo) => {
     // DELETE /admin/realms/${KeycloakRealm.realm}/users/{userid}/groups/{groupid}
     cy.keycloakMakeSureUserIDIsPopulated(user);
     cy.keycloakMakeSureGroupIDIsPopulated(group);
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

// Uses the REST API to validate that a user is in a security group
Cypress.Commands.add('keycloakCheckIfUserIsInGroup', (group: KeycloakGroupInfo, user: KeycloakUserInfo) => {
     // GET /admin/realms/{realm}/users/{userid}/groups
     cy.keycloakMakeSureUserIDIsPopulated(user);
     cy.keycloakMakeSureGroupIDIsPopulated(group);
     cy.chainPrime([
          KeycloakLoginStep,
          {
               url: () => `${settings.keycloak.api}/admin/realms/${KeycloakRealm.realm}/users/${user.id}/groups`,
               method: 'GET',
               data: () => {
               },
               onResponse: (response) => {
                    const found = (response.body || []).find(x => x.id === group.id);
                    expect(response.isOkStatusCode || response.status == 404, `${user.username}: ${response.isOkStatusCode}`).to.eq(true);
                    expect(found && true, `Expected that ${group.groupname} was in ${user.username}'s groups`).to.be.true;
               },
               form: false,
               getToken: () => globalThis.keycloakToken,
          }
     ]);
});

// Uses the REST API to validate that a user is not in a security group
Cypress.Commands.add('keycloakCheckIfUserIsNotInGroup', (group: KeycloakGroupInfo, user: KeycloakUserInfo) => {
     // GET /admin/realms/{realm}/users/{userid}/groups
     cy.keycloakMakeSureUserIDIsPopulated(user);
     cy.keycloakMakeSureGroupIDIsPopulated(group);
     cy.chainPrime([
          KeycloakLoginStep,
          {
               url: () => `${settings.keycloak.api}/admin/realms/${KeycloakRealm.realm}/users/${user.id}/groups`,
               method: 'GET',
               data: () => {
               },
               onResponse: (response) => {                    
                    const found = (response.status != 404) && (response.body || []).find(x => x.id === group.id);
                    expect(response.isOkStatusCode || response.status == 404, `${user.username}: ${response.isOkStatusCode}`).to.eq(true);
                    expect(!(found && true), `Expected that ${group.groupname} was in ${user.username}'s groups`).to.be.true;
               },
               form: false,
               getToken: () => globalThis.keycloakToken,
          }
     ]);
});

// Fetches all the security groups for the keycloakinstance
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

// Fetches all the users for the keycloakinstance
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

// Given a user, looks that user up by username and then adds the ID if it's missing
Cypress.Commands.add('keycloakMakeSureUserIDIsPopulated', (user: KeycloakUserInfo) => {
     if (!user.id) {
          cy.keycloakGetUsers((users) => {
               users.forEach(x => { if (x.username === user.username) { user.id = x.id; } });
          });
     }
});

// Given a user, looks that group up by name and then adds the ID if it's missing
Cypress.Commands.add('keycloakMakeSureGroupIDIsPopulated', (group: KeycloakGroupInfo) => {
     if (!group.id) {
          cy.keycloakGetUsers((users) => {
               users.forEach(x => { if (x.name === group.groupname) { group.id = x.id; } });
          });
     }
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