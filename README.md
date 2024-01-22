# Using this repository

When adding a tool to the platform, you should use this repository in order to system-test the integration between the toal and keycloak for user-provisioning, authentication and auhtorization.

Take the following actions.

## Create integration tooling and configuration
- Create a repository in which you publish any tooling and configuration you create to integrate keycloak with the product of choice (aka the target system)

## Deploy 

You start with creating a dynamically deployable (docker) container for both keycloak and your tool. During a test run, it must be possible to start your scripts from Jenkins to deploy the tool and keycloak to some assigned location.

The container(s) should be defined in such a way that when they are started and configured, there is a production-like deployment of the tool under test available at some URL, and there is a keycloak instance available at some other URL with which the tool under test is integrated. All tooling surrounding the integration should be in place. Basically when the deployment script is done there is a working keycloak, a working tool, and they are linked for integration as they would be in production.

If your containers rely on certificates, make sure these are newly generated as part of the test-deployment.

This should all be built in such a way that it can be triggered from an automated build step.

## Integrating this test tooling

You should fork this repository as a submodule into your project's repository.

Next you extend your deployment steps/scripts for the above container's to overwrite ```test-settings.json```. Add all dynamic URLs, API keys, secrets and credentials that you need to run your tests.

Assumptions/requirements for your integration:
- In keycloak two security groups are used that you identify by name in the ```targetAddGroupNamesToGlobalThis``` command.
- The keycloak-tool integration should be set up that at least users that are assigned to either group get access to the tool (i.e. are provisioned).
  It's not mandatory to restrict access, but if you do restrict access based on security group then specify two group names here that are used to do that.
- If the tool under test requires user provisioning in addition to authentication, then whenever a user is created in keycloak (and assigned to either security group) then that user must immediately be provisioned in the tool.
- When a user is removed from all groups that causes the user to be provisioned, or the user is deleted in keycloak, then user de-provisioning should take place (or be scheduled)

These test assume that you can validate all use cases by logging in and using the target tool's UI to check the situation. When that's posisble, you write an automated test in cypress for this. 
You can also use your tool's API to determine certain conditions are met. In all cases, pick whichever makes most sense.

With this in mind, re-implement all commands in ```cypress/setup-targetsystem.ts``` according to their specification, targeted at your tool.

If you do not use provisioning or securty groups, just implement the respective commands in ```cypress/setup-targetsystem.ts``` to succeed always. Do not delete the provisioning tests, also you should not need to edit ```setup-keycloak.ts```.

The tests are all built to first manipulate keycloak, and then validate in the target system that this reacts as desired to those changes. So the commands in ```cypress/setup-targetsystem.ts``` are just steps in a bigger test.

You can always add more tests by adding .cy.ts files to the e2e folder.

## About runnign the tests

This repo uses cypress to perform API and UI based testing

More on cypress here: [Cypress Documentation](https://docs.cypress.io/)

If you start your docker containers locally, and then (over)write test-settings.json in your local repo, you can use: ```npm run cypress:open``` to open a local test instance of cypress to test interactively. Information abvout linking your local debugger to cypress can be found in the documentation. This works well with Visual Studio Code, but any other development tool should be fine also.

All tests are independent and do not share any data, but you should first run ```001-set-up-keycloak-and-target-systems.cy.ts``` to make sure that everything is in place for testing.

## TODO: Automatically running these tests

These tests will automatically be run from Jenkins, more on how to do that soon(tm).
