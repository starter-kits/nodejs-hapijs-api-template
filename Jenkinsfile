pipeline {
  agent none
  parameters {
    booleanParam(
      name: 'SHOULD_FORCE_PUBLISH_ARTIFACT',
      defaultValue: false,
      description: '📦 Artifact will be published if CI job runs in master branch.\nIf you want to publish artifact from other branches, please force it.'
    )
  }
  environment {
    CI = 'true'
    CONFIG_FILE_ID = '2ff70cd8-a2ec-5ed8-ab98-1cb96c555135' // uuid for the `jenkinsfile-config.json` given string value generated by Ansible
    GITHUB_JENKINS_CREDENTIALS_ID = '6620095f-430d-5a03-94cf-c5a15dbf0617'
    GITHUB_HTTPS_REPO_URL = 'github.com/starter-kits/nodejs-hapijs-api-template.git' // without `https` prefix
    IMAGE_NAME = 'nodejs-hapijs-api-template'
    GIT_MAIN_PROTECTED_BRANCH = 'jenkins'
  }
  options {
    disableConcurrentBuilds()
    timeout(time: 28, unit: 'DAYS')
  }
  stages {
    stage('Init') {
      agent any
      steps {
        script {
          env.IS_LAST_COMMIT_BY_JENKINS = isLastCommitByJenkins()
          setEnvVarsFromJSONConfigFile(env.CONFIG_FILE_ID)
          setEnvironmentVariablesFromDefaultJenkinsEnvVariables()
          setEnvironmentVariablesFromBuildUserPlugin()
          setEnvironmentVariablesFromPackageJson()
        }
      }
    }
    stage('Choose Artifact Type') {
      agent none
      when {
        anyOf {
          branch env.GIT_MAIN_PROTECTED_BRANCH
          expression { return params.SHOULD_FORCE_PUBLISH_ARTIFACT }
        }
        not {
          environment name: 'IS_LAST_COMMIT_BY_JENKINS', value: 'YES'
        }
      }
      steps {
        script {
          chooseArtifactType()
        }
      }
    }
    stage('Validate master branch Release Artifact') {
      when {
        allOf {
          environment name: 'PACKAGE_ARTIFACT_TYPE', value: 'RELEASE'
          branch env.GIT_MAIN_PROTECTED_BRANCH
        }
      }
      steps {
        script {       
          validateMasterBranchReleaseArtifact()
        }
      }
    }
    stage('Approve Non-master branch Release Artifact') {
      when {
        environment name: 'PACKAGE_ARTIFACT_TYPE', value: 'RELEASE'
        not {
          branch env.GIT_MAIN_PROTECTED_BRANCH
        }
      }
      steps {
        script {
          approveNonMasterBranchReleaseArtifact()
        }
      }
    }
    stage('Approve Release Artifact Type') {
      when {
        environment name: 'PACKAGE_ARTIFACT_TYPE', value: 'RELEASE'
      }
      steps {
        script {
          chooseAndApproveReleaseArtifactType()
        }
      }
    }
    stage('Checkout Source') {
      agent any
      stages {
        stage('Update Release Version') {
          when {
            environment name: 'PACKAGE_ARTIFACT_TYPE', value: 'RELEASE'
          }
          steps {
            script {
              updatePackageJsonWithReleaseVersion()
              updateVersionTxtWithReleaseVersion()
            }
          }
        }
        stage('Install Dependencies') {
          steps {
            sh 'sudo docker build -t ${IMAGE_NAME}:dev_build_${PACKAGE_ARTIFACT_GIT_BRANCH} --target dev_build .'
            echo "Installed dependencies"
          }
        }
        stage('Lint') {
          steps {
            script {
              try {
                sh 'sudo docker run -v ${WORKSPACE}/build:/opt/app/build ${IMAGE_NAME}:dev_build_${PACKAGE_ARTIFACT_GIT_BRANCH} npm run lint'  
              } catch(e) {
                publishLintResults()
                throw e
              } finally {
                publishLintResults()
              }
            }
          }
        }
        stage('Test') {
          steps {
            script {
              try {
                sh 'sudo docker run -v ${WORKSPACE}/build:/opt/app/build ${IMAGE_NAME}:dev_build_${PACKAGE_ARTIFACT_GIT_BRANCH} npm test'  
              } catch(e) {
                echo "Test failed"
                publishTestResults()
                publishUnitTestCoverageCoberturaReports()
                throw e
              } finally {
                publishTestResults()
                publishUnitTestCoverageCoberturaReports()
              }
              // sh 'docker rmi ${IMAGE_NAME}:dev_build'
            }
          }
        }
        stage('Tag with Release Version') {
          when {
            environment name: 'PACKAGE_ARTIFACT_TYPE', value: 'RELEASE'
          }
          steps {
            script {
              gitCommitAndTagWithReleaseVersion()
            }
          }
        }
        stage('Publish Image') {
          when {
            anyOf {
              environment name: 'PACKAGE_ARTIFACT_TYPE', value: 'SNAPSHOT'
              environment name: 'PACKAGE_ARTIFACT_TYPE', value: 'RELEASE'
            }
          }
          steps {
            script {
              createPackageArtifactVersion()
              sh '''
              sudo docker build -t ${IMAGE_NAME}:${PACKAGE_ARTIFACT_VERSION} --target production .
              # sudo docker tag ${IMAGE_NAME}:latest ${IMAGE_NAME}:${PACKAGE_ARTIFACT_VERSION}
              '''
            }
          }
        }
      }
    }
    stage('Deployment') {
      agent none
      options {
        skipDefaultCheckout()
      }
      stages {
        stage('Deploy to Dev') {
          when {
            anyOf {
              environment name: 'PACKAGE_ARTIFACT_TYPE', value: 'SNAPSHOT'
              environment name: 'PACKAGE_ARTIFACT_TYPE', value: 'RELEASE'
            }
          }
          steps {
            script {
              echo "TODO"
            }
          }
        }
        stage('Deploy to Stage') {
          when {
            environment name: 'PACKAGE_ARTIFACT_TYPE', value: 'RELEASE'
          }
          steps {
            script {
              echo "TODO"
            }
          }
        }
        stage('Deploy to Prod') {
          when {
            environment name: 'PACKAGE_ARTIFACT_TYPE', value: 'RELEASE'
          }
          steps {
            script {
              echo "TODO"
            }
          }
        }
      }
    }
  }
  post { 
    always { 
      echo 'always run'
    }
    changed { 
      echo 'changed run'
    }
    failure { 
      echo 'failure run'
    }
    success { 
      echo 'success run'
    }
    unstable { 
      echo 'unstable run'
    }
    aborted { 
      echo 'aborted run'
    }
  }
}

def setEnvVarsFromJSONConfigFile(jenkinsfileConfigFileId) {
  /*
  Example config file:
  {
    "env_vars": {
      "SOMETHING": "value"
    }
  }
  */
  echo "Set required Enviornment variables for the pipeline job from jenkinsfile-config.json file"
  configFileProvider([configFile(fileId: jenkinsfileConfigFileId, targetLocation: 'jenkinsfile-config.json')]) {
    echo "Reading config file from Jenkins Server"
  }

  def jenkinsfileConfig = readJSON file: 'jenkinsfile-config.json'
  sh 'rm -f jenkinsfile-config.json'

  jenkinsfileConfig.env_vars.each {
    env."${it.key}" = it.value
    echo "${it.key}:" + env."${it.key}"
  }
}

def setEnvironmentVariablesFromDefaultJenkinsEnvVariables() {
  echo "Set required Environment variables for the pipeline job from Jenkins Default Environment variables"
  env.PACKAGE_ARTIFACT_BUILD_NUMBER = env.BUILD_NUMBER
  env.PACKAGE_ARTIFACT_BUILD_JOB_NAME = env.JOB_NAME
  env.PACKAGE_ARTIFACT_GIT_REVISION = env.GIT_COMMIT
  env.PACKAGE_ARTIFACT_GIT_BRANCH = env.GIT_BRANCH
  env.PACKAGE_ARTIFACT_GIT_URL = env.GIT_URL

  echo "PACKAGE_ARTIFACT_BUILD_NUMBER: ${env.PACKAGE_ARTIFACT_BUILD_NUMBER}"
  echo "PACKAGE_ARTIFACT_BUILD_JOB_NAME: ${env.PACKAGE_ARTIFACT_BUILD_JOB_NAME}"
  echo "PACKAGE_ARTIFACT_GIT_REVISION: ${env.PACKAGE_ARTIFACT_GIT_REVISION}"
  echo "PACKAGE_ARTIFACT_GIT_BRANCH: ${env.PACKAGE_ARTIFACT_GIT_BRANCH}"
  echo "PACKAGE_ARTIFACT_GIT_URL: ${env.PACKAGE_ARTIFACT_GIT_URL}"
}

def setEnvironmentVariablesFromBuildUserPlugin() {
  echo "Set required Environment variables for the pipeline job from BuildUser plugin"
  wrap([$class: 'BuildUser']) {
    env.PACKAGE_ARTIFACT_BUILD_USER = env.BUILD_USER
    env.PACKAGE_ARTIFACT_BUILD_USER_ID = env.BUILD_USER_ID
  }
  echo "PACKAGE_ARTIFACT_BUILD_USER: ${env.PACKAGE_ARTIFACT_BUILD_USER}"
  echo "PACKAGE_ARTIFACT_BUILD_USER_ID: ${env.PACKAGE_ARTIFACT_BUILD_USER_ID}"
}

def setEnvironmentVariablesFromPackageJson() {
  echo "Set required Environment variables for the pipeline job from package.json"
  def packageJson = readJSON file: 'package.json'
  env.PACKAGE_ARTIFACT_PREVIOUS_VERSION = packageJson.version
  echo "PACKAGE_ARTIFACT_PREVIOUS_VERSION: ${env.PACKAGE_ARTIFACT_PREVIOUS_VERSION}"
}

def setEnvironmentVariablesFromVersionTxt() {
  echo "Set required Environment variables for the pipeline job from VERSION.txt"
  def content = readFile file: 'VERSION.txt'
  def (version) = content.tokenize('\n')
  env.PACKAGE_ARTIFACT_PREVIOUS_VERSION = version
  echo "PACKAGE_ARTIFACT_PREVIOUS_VERSION: ${env.PACKAGE_ARTIFACT_PREVIOUS_VERSION}"
}

def publishLintResults(reportPathPattern = '**/reports/lint/eslint.xml') {
  checkstyle failedTotalAll: '0', canComputeNew: false, defaultEncoding: '', healthy: '', pattern: reportPathPattern, unHealthy: ''
}

def publishTestResults(reportPathPattern = '**/reports/test/junit.xml') {
  junit reportPathPattern
}

def publishUnitTestCoverageCoberturaReports(reportPathPattern = '**/reports/test/coverage/cobertura-coverage.xml') {
  cobertura autoUpdateHealth: false,
    autoUpdateStability: false,
    coberturaReportFile: reportPathPattern,
    conditionalCoverageTargets: '70, 0, 0',
    failUnhealthy: false,
    failUnstable: false,
    lineCoverageTargets: '80, 0, 0',
    maxNumberOfBuilds: 0,
    methodCoverageTargets: '80, 0, 0',
    onlyStable: false,
    sourceEncoding: 'ASCII',
    zoomCoverageChart: false
}

def chooseArtifactType() {
  def inputData = input message: 'Select the type of the artifact?',
    parameters: [
      choice(
        choices: 'SNAPSHOT\nRELEASE', 
        description: 'If you select the option SNAPSHOT (Snapshot Artifact 📦🔗), then BRANCH_NAME__GIT_REVISION will be used as version number and no GIT tag will be added.\n If you select RELEASE (Release Artifact📦🔖) option, then package.json will be updated with next version based on Semver and also GIT tag will be added.', 
        name: 'PACKAGE_ARTIFACT_TYPE'
      )
    ],
    submitterParameter: 'PACKAGE_ARTIFACT_TYPE_APPROVER',
    // Jenkins User IDs and/or external group names of person or people permitted to respond to the input, separated by ','. If you configure "alice, bob", will match with "alice" but not with "bob". You need to remove all the white spaces.
    // For now, jenkins_admin
    submitter: 'jenkins_admin'
  env.PACKAGE_ARTIFACT_TYPE = inputData.PACKAGE_ARTIFACT_TYPE
  env.PACKAGE_ARTIFACT_TYPE_APPROVER = inputData.PACKAGE_ARTIFACT_TYPE_APPROVER
  // Possible values: SNAPSHOT, RELEASE
  echo "PACKAGE_ARTIFACT_TYPE: ${env.PACKAGE_ARTIFACT_TYPE}"
  echo "PACKAGE_ARTIFACT_TYPE_APPROVER: ${env.PACKAGE_ARTIFACT_TYPE_APPROVER}"
}

def validateMasterBranchReleaseArtifact() {
  env.PACKAGE_ARTIFACT_IS_NON_MASTER_RELEASE = 'NO'
}

def approveNonMasterBranchReleaseArtifact() {
  def inputData = input message: 'Are you sure you want to make Release artifact from a non-master branch?',
    parameters: [
      choice(
        choices: 'NO, but create SNAPSHOT artifact instead\nYES', 
        description: 'Please continue only if you are trying to make Hotfix or Epic Feature branch Release Artifact.\n It is recommended to make Release Artifact 📦🔖 from master branch unless you have a valid reason like hotfix release or major release with possible rollback.', 
        name: 'PACKAGE_ARTIFACT_IS_NON_MASTER_RELEASE'
      )
    ],
    submitterParameter: 'NON_MASTER_BRANCH_RELEASE_APPROVER',
    // Jenkins User IDs and/or external group names of person or people permitted to respond to the input, separated by ','. If you configure "alice, bob", will match with "alice" but not with "bob". You need to remove all the white spaces.
    // For now, jenkins_admin
    submitter: 'jenkins_admin'
     
  env.PACKAGE_ARTIFACT_IS_NON_MASTER_RELEASE = inputData.PACKAGE_ARTIFACT_IS_NON_MASTER_RELEASE
  env.NON_MASTER_BRANCH_RELEASE_APPROVER = inputData.NON_MASTER_BRANCH_RELEASE_APPROVER

  if ("${env.PACKAGE_ARTIFACT_IS_NON_MASTER_RELEASE}" != 'NO' && "${env.PACKAGE_ARTIFACT_IS_NON_MASTER_RELEASE}" != 'YES') {
    // FIXME: Currently we mutate only this `PACKAGE_ARTIFACT_TYPE` env variable. 
    // Improve it later without mutating with same functionality
    env.PACKAGE_ARTIFACT_TYPE = 'SNAPSHOT'
  }

  echo "PACKAGE_ARTIFACT_IS_NON_MASTER_RELEASE: ${env.PACKAGE_ARTIFACT_IS_NON_MASTER_RELEASE}"
  echo "NON_MASTER_BRANCH_RELEASE_APPROVER: ${env.NON_MASTER_BRANCH_RELEASE_APPROVER}"
  echo "PACKAGE_ARTIFACT_TYPE: ${env.PACKAGE_ARTIFACT_TYPE}"
}

def chooseAndApproveReleaseArtifactType() {       
  def inputData = input message: 'Select the type of version of the Release Artifact 📦🔖?',
    parameters: [
      choice(
        choices: 'MINOR\nPATCH\nMAJOR', 
        description: 'package.json will be updated with next version based on Semver and also GIT tag will be added.', 
        name: 'NEW_RELEASE_VERSION_TYPE'
      )
    ],
    submitterParameter: 'NEW_RELEASE_APPROVER',
    // Jenkins User IDs and/or external group names of person or people permitted to respond to the input, separated by ','. If you configure "alice, bob", will match with "alice" but not with "bob". You need to remove all the white spaces.
    // For now, jenkins_admin
    submitter: 'jenkins_admin'

  env.PACKAGE_ARTIFACT_RELEASE_VERSION_TYPE = inputData.NEW_RELEASE_VERSION_TYPE
  env.PACKAGE_ARTIFACT_NEW_RELEASE_APPROVER = inputData.NEW_RELEASE_APPROVER

  echo "PACKAGE_ARTIFACT_IS_NON_MASTER_RELEASE: ${env.PACKAGE_ARTIFACT_IS_NON_MASTER_RELEASE}"
  echo "PACKAGE_ARTIFACT_RELEASE_VERSION_TYPE: ${env.PACKAGE_ARTIFACT_RELEASE_VERSION_TYPE}"
  echo "PACKAGE_ARTIFACT_NEW_RELEASE_APPROVER: ${env.PACKAGE_ARTIFACT_NEW_RELEASE_APPROVER}"
}

def updatePackageJsonWithReleaseVersion() {
  // Possible values for PACKAGE_ARTIFACT_RELEASE_VERSION_TYPE: PATCH, MINOR, MAJOR 
  def releaseVersionType = env.PACKAGE_ARTIFACT_RELEASE_VERSION_TYPE
  sh 'sudo docker build -t ${IMAGE_NAME}:base --target base .'
  sh "sudo docker run -v ${env.WORKSPACE}/:/opt/app/ ${env.IMAGE_NAME}:base npm --no-git-tag-version version ${releaseVersionType.toLowerCase()}" 

  def packageJson = readJSON file: 'package.json'
  env.PACKAGE_ARTIFACT_RELEASE_VERSION = packageJson.version

  echo "PACKAGE_ARTIFACT_PREVIOUS_VERSION: ${env.PACKAGE_ARTIFACT_PREVIOUS_VERSION}"
  echo "PACKAGE_ARTIFACT_RELEASE_VERSION_TYPE: ${env.PACKAGE_ARTIFACT_RELEASE_VERSION_TYPE}"
  echo "PACKAGE_ARTIFACT_RELEASE_VERSION: ${env.PACKAGE_ARTIFACT_RELEASE_VERSION}"
}

def bumpVersionNumberBySemverType(String currentVersion, String releaseVersionType) {
  echo currentVersion
  def (major, minor, patch) = currentVersion.tokenize('.')

  if (releaseVersionType == 'MAJOR') {
    major = major.toInteger() + 1
    minor = 0
    patch = 0
  } else if (releaseVersionType == 'MINOR') {
    minor = minor.toInteger() + 1
    patch = 0
  } else if (releaseVersionType == 'PATCH') {
    patch = patch.toInteger() + 1
  }

  String releaseVersion = "${major}.${minor}.${patch}"
  echo "Release Version: ${releaseVersion}"
  releaseVersion
}

def updateVersionTxtWithReleaseVersion() {
  // Possible values for PACKAGE_ARTIFACT_RELEASE_VERSION_TYPE: PATCH, MINOR, MAJOR 
  def releaseVersion = bumpVersionNumberBySemverType(env.PACKAGE_ARTIFACT_PREVIOUS_VERSION, env.PACKAGE_ARTIFACT_RELEASE_VERSION_TYPE)
  
  writeFile file: "VERSION.txt", text: "${releaseVersion}\n"
  
  env.PACKAGE_ARTIFACT_RELEASE_VERSION = releaseVersion

  echo "PACKAGE_ARTIFACT_PREVIOUS_VERSION: ${env.PACKAGE_ARTIFACT_PREVIOUS_VERSION}"
  echo "PACKAGE_ARTIFACT_RELEASE_VERSION_TYPE: ${env.PACKAGE_ARTIFACT_RELEASE_VERSION_TYPE}"
  echo "PACKAGE_ARTIFACT_RELEASE_VERSION: ${env.PACKAGE_ARTIFACT_RELEASE_VERSION}"
}

def gitCommitAndTagWithReleaseVersion() {
  sh '''
  git config user.name "Jenkins"
  git config user.email "noreply@jenkins"
  git add -u
  git commit -m "🎉 Version bumped from ${PACKAGE_ARTIFACT_PREVIOUS_VERSION} to ${PACKAGE_ARTIFACT_RELEASE_VERSION}. ${PACKAGE_ARTIFACT_RELEASE_VERSION_TYPE} Version Release."
  git tag -d $(git tag -l) # Delete all local tags. It would help to remove local tags that never pushed to remote origin due to earlier build failures
  git tag -a v${PACKAGE_ARTIFACT_RELEASE_VERSION} -m "🎉 ${PACKAGE_ARTIFACT_RELEASE_VERSION_TYPE} Version Release (v${PACKAGE_ARTIFACT_RELEASE_VERSION})"
  '''
  withCredentials([usernamePassword(credentialsId: env.GITHUB_JENKINS_CREDENTIALS_ID, passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {
    sh '''
    git push https://${GIT_USERNAME}:${GIT_PASSWORD}@${GITHUB_HTTPS_REPO_URL} HEAD:${PACKAGE_ARTIFACT_GIT_BRANCH} --tags
    '''
  }
}

def getLastCommitAuthor() {
  def lastCommitAuthor = sh(returnStdout: true, script: "git log -1 --pretty=format:'%an'").trim()
  lastCommitAuthor
}

def isLastCommitByJenkins() {
  def result = "NO"
  if (getLastCommitAuthor() == "Jenkins") {
    result = "YES"
  }
  result
}

def createPackageArtifactVersion() {
  if ("${PACKAGE_ARTIFACT_TYPE}" == "SNAPSHOT") {
    def revision = env.PACKAGE_ARTIFACT_GIT_REVISION.take(6)
    def snapshotVersion = "${PACKAGE_ARTIFACT_GIT_BRANCH}__${revision}"
    env.PACKAGE_ARTIFACT_VERSION = snapshotVersion
  } else {
    env.PACKAGE_ARTIFACT_VERSION = env.PACKAGE_ARTIFACT_RELEASE_VERSION
  }
  echo "PACKAGE_ARTIFACT_TYPE: ${env.PACKAGE_ARTIFACT_TYPE}"
  echo "PACKAGE_ARTIFACT_PREVIOUS_VERSION: ${env.PACKAGE_ARTIFACT_PREVIOUS_VERSION}"
  echo "PACKAGE_ARTIFACT_RELEASE_VERSION_TYPE: ${env.PACKAGE_ARTIFACT_RELEASE_VERSION_TYPE}"
  echo "PACKAGE_ARTIFACT_VERSION: ${env.PACKAGE_ARTIFACT_VERSION}"
}
