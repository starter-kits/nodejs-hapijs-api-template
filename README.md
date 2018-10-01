# nodejs-hapijs-api-template

## Getting Started

1. To install NPM dependencies

    ```shell
    docker-compose build
    ```

2. To launch the Test runner

    ```shell
    docker-compose run node-api npm test
    ```

3. To start the Node App in development watch mode in your local machine(inside a docker container):

    ```shell
    docker-compose up
    ```

**NOTE:** Docker is required for local development.

## Continuous Integration & Continuos Delivery

### Continuous Integration (CI)

Continuous Integration (CI) is a development practice that requires developers to integrate code into a shared repository several times a day. Each check-in is then verified by an automated build, allowing teams to detect problems early.

By integrating regularly, you can detect errors quickly, and locate them more easily.

CI server looks for push events on git repository and run Statistic Analysis Tests & Unit Tests when:

- There is a push to any branch
- When create a Pull Request

In addition to that, if it's master branch, it would prompt to make an Artifact for deployment pipeline.

### Continuous deployment

Continuous deployment is the concept that every change made in the code base will be deployed almost immediately to production if the results of the pipeline are successful.

### Continuous delivery (CD)

Continuous delivery (CD) is the concept that every change to the code base goes through the pipeline up to the point of deploying to nonproduction environments. The team finds and addresses issues immediately, not later when they plan to release the code base.

The code base is always at a quality level that is safe for release. When to release the code base to production is a business decision.

### Type of Artifacts

There are two type of Artifacts 📦:

- `Release Artifact` 📦🔖

  Choose this type of artifact if you are ready for Release Candidate for starting the Dev, Stage & Production deployment process. For the purposes of planned releases we are only really concerned with the major/minor release numbers. CI/CD Server will be creating a GIT tag in the git repository after create a Release Artifact.

- `Snapshot Artifact` 📦🔗

  Choose this type of artifact if you want to deploy only in Dev environment and not ready for prepare a Release Candidate. CI/CD Server won't be creating a GIT tag in the Monorepo after create a Snapshot Artifact.

### Build

There are two type of builds:

1. `CI Build`
2. `CI/CD Build`

#### CI Build

Static Analysis and Unit tests will be executed in a CI Build to ensure the quality of the application.

##### How to trigger a `CI Build`

_For non-master branches:_

- By default, `CI Build` will be triggered on all `non-master branches` automatically whenever there are changes pushed into remote origin.
- If you want to manually trigger a `CI Build` from a `non-master branch`, please make sure that `SHOULD_FORCE_PUBLISH_ARTIFACT` option is not selected.

_For master branch:_

- Currently, there is no way only run `CI Build` on `master branch`
- CI stages will be executed part of a `CI/CD Build` on `master branch`

#### CI/CD Build

An artifact can be created and deployed by a `CI/CD Build`

##### How to trigger a `CI/CD Build`

_For master branch:_

`CI/CD Build` will be triggered on `master branch` even without select `SHOULD_FORCE_PUBLISH_ARTIFACT`

_For non-master branches:_

`CI/CD Build` will be triggered on `non-master branches` if you select `SHOULD_FORCE_PUBLISH_ARTIFACT` option.

##### How to choose an Artifact type in a `CI/CD Build`

- `Snapshot Artifact` 📦🔗 will be created if choose `SNAPSHOT` option in the `Choose Artifact Type` stage.
- `Release Artifact` 📦🔖 will be created if choose `RELEASE` option in the `Choose Artifact Type` stage.

##### How to deploy only to Dev Server from non-master branch

1. There is an option to create Artifact from a non-master branch by selecting `SHOULD_FORCE_PUBLISH_ARTIFACT` 📦 option in Jenkins Pipeline.
2. Select `Snapshot Artifact` 📦🔗 type to deploy only in Dev Server in the `Choose Artifact Type` stage.

##### How to make a Hotfix Release from non-master branch

1. Select `Release Artifact` 📦🔖 type in the `Choose Artifact Type` stage
2. Then select `PATCH` version type to start a Hotfix release.
3. Then submit a merge request to master.

With this approach we need not revert our pipeline back to a prior state to apply a hotfix which enables us to patch production at short notice.

### External References

- [Continuos Integration](https://www.thoughtworks.com/continuous-integration)
- [Continuous Delivery](https://www.thoughtworks.com/continuous-delivery)
- [Continuous deployment](https://www.thoughtworks.com/radar/techniques/continuous-deployment)
- [5 common pitfalls of CI/CD—and how to avoid them](https://www.infoworld.com/article/3113680/devops/5-common-pitfalls-of-cicd-and-how-to-avoid-them.html)
