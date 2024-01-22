import "./commands";

// in cypress/support/index.ts
// load type definitions that come with Cypress module
/// <reference types="cypress" />
export { };

declare global {
    namespace Cypress {
        interface Chainable {
            chain(url: string, method: string, data: any, form: boolean, getToken: () => string, check: (x: any) => void, chainMethod: () => void): any;
            chainPrime(steps: ChainedStep<any>[]): any;

            // Keycloak helpers to support test creation, should not need much modification for specific 3rd party systems
            keycloakConfigure();
            keycloakCreateUser(user: KeycloakUserInfo);
            keycloakDeleteUser(user: KeycloakUserInfo);
            keycloakCreateGroup(group: KeycloakGroupInfo);
            keycloakDeleteGroup(group: KeycloakGroupInfo);
            keycloakAssignUserToGroup(group: KeycloakGroupInfo, user: KeycloakUserInfo);
            keycloakRemoveUserFromGroup(group: KeycloakGroupInfo, user: KeycloakUserInfo);
            keycloakCheckIfUserIsInGroup(group: KeycloakGroupInfo, user: KeycloakUserInfo);
            keycloakCheckIfUserIsNotInGroup(group: KeycloakGroupInfo, user: KeycloakUserInfo);
            keycloakGetGroups(processData: (groups: any[]) => void);
            keycloakGetUsers(processData: (users: any[]) => void);            
            keycloakMakeSureUserIDIsPopulated(user: KeycloakUserInfo);
            keycloakMakeSureGroupIDIsPopulated(group: KeycloakGroupInfo);

            // Targets that must be implemented to allow running all tests
            targetConfigure();
            targetStartInteractiveLogin();
            targetValidateUserIsLoggedOn(user: KeycloakUserInfo);
            targetLogOff();
            targetEnsureUserIsProvisioned(user: KeycloakUserInfo);
            targetEnsureUserIsDeprovisioned(user: KeycloakUserInfo);
            targetEnsureUserDataDeletionIsRequested(user: KeycloakUserInfo);
            targetValidateUserHasNoRights(user: KeycloakUserInfo);
            targetValidateUserHasGroupARightsOnly(user: KeycloakUserInfo);
            targetValidateUserHasGroupBRightsOnly(user: KeycloakUserInfo);
            targetValidateUserHasGroupABRights(user: KeycloakUserInfo);
            targetValidateUserAccessIsDeniedAfterLogin();
            targetAddGroupNamesToGlobalThis();
            keycloakPerformInteractiveLogin(user: KeycloakUserInfo);
            keycloakValidateLoginFailed(user: KeycloakUserInfo);

            // Locally defined
            createSettingsInGlobalThis();
            initializeGlobalThisFromKeycloak();
        }
    }

    export class ChainedStep<T>    {
        url: () => string;
        method: string;
        data: () => any;
        onResponse: (T) => void;
        form: boolean;
        getToken: () => string | undefined;
    }

    export class KeycloakUserInfo {
        id: string;
        username: string;
        email: string;
        password: string;
        groups: string[];
        firstName: string;
        lastName: string;
        // etc
    }

    export class KeycloakGroupInfo {
        id: string;
        groupname: string;
    }
}
