import * as settings from '../test-settings.json';

export const KeycloakRealm = require('../keycloak/Humanitarian_Realm-realm.json');


export const KeycloakDefaultPassword = '$DefaultPassword!1';

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
          cy.keycloakCreateGroup(globalThis.keycloakGroupA);
          cy.keycloakCreateGroup(globalThis.keycloakGroupB);
          cy.keycloakCreateUser(globalThis.keycloakUser1);
          cy.keycloakCreateUser(globalThis.keycloakUser2);
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

Cypress.Commands.add('keycloakCreateUser', (user: KeycloakUserInfo) => {
     // POST /admin/realms/{realm}/users @ https://www.keycloak.org/docs-api/22.0.1/rest-api/index.html#_users
     cy.chainPrime([
          KeycloakLoginStep,          
          {
               url: () => `${settings.keycloak.api}/admin/realms/${KeycloakRealm.realm}/users`,
               method: 'POST',
               data: () => {    
                    return <KeycloakCreateUserRepresentation>{
                         credentials: [ <KeycloakCreateUserCredentialRepresentation>{
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
                    user.id = `${location}`.replace(/^.*[/]/,'');
                    expect(response.isOkStatusCode, `User creation status: ${response.isOkStatusCode} @ ${user.id}`).to.eq(true);
               },
               form: false,
               getToken: () => globalThis.keycloakToken,               
          }
     ]);     
});

Cypress.Commands.add('keycloakDeleteUser', (user: KeycloakUserInfo) => {
     // DELETE /admin/realms/{realm}/users/{id} @ https://www.keycloak.org/docs-api/22.0.1/rest-api/index.html#_users
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
                    group.id = `${location}`.replace(/^.*[/]/,'');
                    expect(response.isOkStatusCode, `Group creation status: ${response.isOkStatusCode} @ ${group.id}`).to.eq(true);
               },
               form: false,
               getToken: () => globalThis.keycloakToken,               
          }
     ]);        

});

Cypress.Commands.add('keycloakDeleteGroup', (group: KeycloakGroupInfo) => {
     // DELETE /admin/realms/{realm}/groups/{id}
});

Cypress.Commands.add('keycloakAssignUserToGroup', (group: KeycloakGroupInfo, user: KeycloakUserInfo) => {
     // PUT /admin/realms/{realm}/users
});

Cypress.Commands.add('keycloakRemoveUserFromGroup', (group: KeycloakGroupInfo, user: KeycloakUserInfo) => {
     // PUT /admin/realms/{realm}/users
});

Cypress.Commands.add('keycloakCheckIfUserIsInGroup', (group: KeycloakGroupInfo, user: KeycloakUserInfo) => {
     // PUT /admin/realms/{realm}/users
});

Cypress.Commands.add('keycloakCheckIfUserIsNotInGroup', (group: KeycloakGroupInfo, user: KeycloakUserInfo) => {
     // PUT /admin/realms/{realm}/users
});

Cypress.Commands.add('keycloakPerformInteractiveLogin', (user: KeycloakUserInfo) => {

});