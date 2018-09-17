pipeline {
  agent any
  environment {
    CI = 'true'
    CONFIG_FILE_ID = '2ff70cd8-a2ec-5ed8-ab98-1cb96c555135' // uuid for the `jenkinsfile-config.json` given string value generated by Ansible
    IMAGE_NAME = 'nodejs-hapijs-api-template'
  }
  options {
    disableConcurrentBuilds()
  }
  stages {
    stage('Init') {
      steps {
        script {
          setEnvVarsFromJSONConfigFile(env.CONFIG_FILE_ID)
        }
      }
    }
    stage('Install Dependencies') {
      steps {
        sh 'sudo docker build -t ${IMAGE_NAME}:dev_build --target dev_build .'
        echo "Installed dependencies"
      }
    }
    stage('Lint') {
      steps {
        script {
          try {
            sh 'sudo docker run -v ${WORKSPACE}/build:/opt/app/build ${IMAGE_NAME}:dev_build npm run lint'  
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
          sh 'sudo docker build -t ${IMAGE_NAME}:dev_build --target dev_build .'
          try {
            sh 'sudo docker run -v ${WORKSPACE}/build:/opt/app/build ${IMAGE_NAME}:dev_build npm test'  
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
    stage('Publish Image') {
      steps {
        script {
          def version = getPackageReleaseVersion()
          sh '''
          sudo docker build -t ${IMAGE_NAME}:latest .
          sudo docker tag ${IMAGE_NAME}:latest ${IMAGE_NAME}:${version}
          '''
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

def getPackageReleaseVersion() {
  def packageJson = readJSON file: 'package.json'
  packageJson.version
}
