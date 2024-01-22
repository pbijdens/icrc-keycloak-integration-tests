import * as settings from '../test-settings.json';

// All these commands are specific for the target that's being tested and should be separately implemented per target.

// Perform any one time configuration that is needed at the start of the full test run to bring the target system into some known state that can be used as a starting point for testing.
// You can also use this ection to perform some basic tests to ensure the target system is up and running.
Cypress.Commands.add('targetConfigure', () => {
});

// The tests assume that when groups are used for authroization there are (at least) two groups that are used. Provide the names
// here for two security groups in keycloak for which it's easy to validate in the target tool that assigning a user
// to that group gives them specific rights.
Cypress.Commands.add('targetAddGroupNamesToGlobalThis', () => {
     globalThis.targetKeycloakSecurityGroupA = <KeycloakGroupInfo>{
          groupname: "group-a"
      };
      globalThis.targetKeycloakSecurityGroupB = <KeycloakGroupInfo>{
          groupname: "group-b"
      };
});

// Implement those steps needed to start a new session and cause the user to be directed to the keycloak user login page.
// This step is done when that page is shown. In the example below, we navigate to our system under test, click a link
// 'Start SAML Flow' and then wait until the keycloak login form is shown (after redirect for authentication)
//
// The path to getting the login screen shown may differ per tool under test. If your tool does not use SAML, also
// overwrite the keycloak equivalents of this method.
Cypress.Commands.add('targetStartInteractiveLogin', () => {
     cy.log(`Preparing interactive login`);
     cy.visit(`${globalThis.settings.targetSystem.ui}`);
     cy.contains('Start SAML Flow', { timeout: 1000 }).click();
     cy.url().should('contain', `${globalThis.settings.keycloak.ui}/realms/Humanitarians/protocol/saml`, { timeout: 1000 });
     cy.get('form').within(() => {
          cy.get('input', { timeout: 1000 });
     });
});

// After interactive logon has completed, this method is used to check that the user is really logged on.
// You could for example navigate to the user's profile page in your tool under test and validate that
// the user's name is shown here.
Cypress.Commands.add('targetValidateUserIsLoggedOn', (user: KeycloakUserInfo) => {
     cy.url().should('contain', `${globalThis.settings.targetSystem.acs}`, { timeout: 1000 });
     cy.contains(`Identified user: ${user.username}`, {matchCase: false});
});

// Implemented for the SAML login screen. If some other login screen is used, update this to authenticate
// the user.
Cypress.Commands.add('keycloakPerformInteractiveLogin', (user: KeycloakUserInfo) => {     
     cy.get('form').within(() => {
          cy.get('input[name="username"]', { timeout: 1000 }).type(user.username);
          cy.get('input[name="password"]', { timeout: 1000 }).type(user.password);
          cy.get('input[name="login"]', { timeout: 1000 }).click();
     });
});

// Implemented for the SAML login screen. If some other login screen is used, update this to check
// user login failed. For SAML we check there is an input error and all login fields are still
// shown.
Cypress.Commands.add('keycloakValidateLoginFailed', (user: KeycloakUserInfo) => {
     cy.get('form').within(() => {
          // Make sure we're still on the login screen
          cy.get('span[id="input-error"]', { timeout: 1000 });
          cy.get('input[name="username"]', { timeout: 1000 });
          cy.get('input[name="password"]', { timeout: 1000 });
          cy.get('input[name="login"]', { timeout: 1000 });
     });
});

// Log off the user. Most target systems have an endpoint for single log off, use that to log off hte user.
// If all else fails, you can use this implementation to delete all local state and that way fake
// having logged off.
Cypress.Commands.add('targetLogOff', () => {
     // Navigate to both systems then clearAllLocalStorage(): this method will clear all local storage and cookies
     // that are linked to any of the pages visited in this session (all other data is lost already because this
     // data gets cleared over sessions)
     cy.visit(`${globalThis.settings.targetSystem.ui}`);
     cy.visit(`${globalThis.settings.keycloak.ui}`);
     cy.clearAllLocalStorage();

     // Validate here that the user is requested to log in again when authentication is attempted
     cy.visit(`${globalThis.settings.targetSystem.ui}`);
     cy.contains('Start SAML Flow', { timeout: 1000 }).click();
     cy.url().should('contain', `${globalThis.settings.keycloak.ui}/realms/Humanitarians/protocol/saml`, { timeout: 1000 });
});

// Assuming a user has logged on to the target system using SSO, validate that this user is 
// actually properly provisioned from keycloak, for example by checking their profile page
// but you can also use the tool under test's REST API to validate this here.
// See the setup-keycloak.cy.ts file for how to use a REST API in your tests.
Cypress.Commands.add('targetEnsureUserIsProvisioned', (user: KeycloakUserInfo) => {
     cy.log('System does not support provisioning, therefore this test always succeeds.');
});

// Do what you need to do to validate a user was de-provisioned from the tool under test.
// For example, try to login and validate an error is shown. Or use the tool's REST API
// See the setup-keycloak.cy.ts file for how to use a REST API in your tests.
Cypress.Commands.add('targetEnsureUserIsDeprovisioned', (user: KeycloakUserInfo) => {
     cy.log('System under test does not support provisioning, therefore this test always succeeds.');
});

// When a user is de-provisioned their data needs to be removed within a ceratin amount of
// time. This method should check with the tool under test that for this user that
// removal was scheduled or already done.
Cypress.Commands.add('targetEnsureUserDataDeletionIsRequested', (user: KeycloakUserInfo) => {
     cy.log('System under test does not support provisioning, therefore this test always succeeds.');
});

// Checks for a logged in user that is not assigned to any security groups that this user
// can not do anything for which they should be assigned to either group A or group B
Cypress.Commands.add('targetValidateUserHasNoRights', (user: KeycloakUserInfo) => {
     cy.log('System does not support roles, therefore this test always succeeds.');
});

// Checks for a logged in user that is assigned to group A only that they can do that what's 
// allowed in group A but nothing that required group B level access.
Cypress.Commands.add('targetValidateUserHasGroupARightsOnly', (user: KeycloakUserInfo) => {
     cy.log('System under test does not support roles, therefore this test always succeeds.');
});

// Checks for a logged in user that is assigned to group B only that they can do that what's 
// allowed in group B but nothing that required group A level access.
Cypress.Commands.add('targetValidateUserHasGroupBRightsOnly', (user: KeycloakUserInfo) => {
     cy.log('System under test does not support roles, therefore this test always succeeds.');
});

// Checks for a logged in user that is assigned to group A and B only that they can do that what's 
// allowed in both  group s.
Cypress.Commands.add('targetValidateUserHasGroupABRights', (user: KeycloakUserInfo) => {
     cy.log('System under test does not support roles, therefore this test always succeeds.');
});

// Validates that user that are de-provisioned receive certain feedback from the tool when they
// still attempt to log in (this could for example be that a screen to request access is shown
// instead, depends on the tool)
Cypress.Commands.add('targetValidateUserAccessIsDeniedAfterLogin', () => {
     cy.log('System under test does not support roles, therefore this test always succeeds.');
});