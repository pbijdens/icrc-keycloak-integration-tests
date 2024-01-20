# Hackathon: Automated testing of tool integration with keycloak

## Goals:
- Ultimate goal: prove integration is correct and complete
- Prevent regression upon updates
- Have a framework that can be used for testing all tools with a minimum of "pluggable" tool-specific components.

## Non-goals:
- We're not testing correctness of keycloak or the tool under test, just the reaction of the tool on the integration with keycloak
- We're not testing cloud-hosted tools, we're tyesting self-hosted keycloak and self-hosted tool under test
- We're not testing a production environment, we're testing the potential to operate correctly in production

## Process and environment:
- Assume test environment is deployed in a known state once prior to a test run, meaning
  - Keycloak is in a known state
    - Where needed fresh certificates are used
  - Target system is configured to integrate with our keycloak and is in a known state
- For one run, a set of test cases is executed in sequence on that environment
- Tests are developed to be independent and not depend on the outcome of other tests, but when that is the case this is formalized in the scripts and documented; such tests will share a result.

## Tools and deployment:
- Preference is using Docker (Apache 2.0 license) for deploying both keycloak and the tool under test
- The integration package for the tool under test will contain scripts that will configure the test instance
- Tests and tool-specific styeps are developed using cypress, https://www.cypress.io/ (MIT license)
- The TypeScript  language is used for developing scripts (Apache 2.0 license)

## DevOps process:
- At GIT, a PR guard is set up that prevents completing a PR unless the system test succeeds entirely
- To realize this, per system under test a pipeline is built as a valid GitrHub pipeline definition file, created in the tool's repository. This:
  - Deploys, configures and starts both keycloak and the tool under test in one or more docker container(s) 
  - Starts the tests using an npm command (tbd); 
    The URLs for the tool's, the API URLs and Keys etc. are written beforehand (by step 1) in a JSON file in the pipeline's state directory.
  - Failure of any tests will cause the NPM command to fail, and therefore the pipeline to fail, causing the PR to be rejected automatically

## What I will build (scope):
- I will build a component that runs the tests in NPM
- I will build a repository that we can pull into a tool's repository and that can (using specific input files in that repository) perform all tests we want to run on that tool using cypress.
- For this, I will assume the tools under test are configured and up and running

## What others need to build:
- The GitHub devops part of the process:
  - set up the PR guard
  - create the pipeline described under "DevOps process" as a template and document how this can be set up per tool
  - create the scripts needed to deploy and configure keycloak in docker (i.e. get the tools configured and up and running)

