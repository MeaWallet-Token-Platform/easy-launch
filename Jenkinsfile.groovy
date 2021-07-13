#!/usr/bin/env groovy
@Library("standardPipelineFunctions@release-1.4.23") _
properties([[$class: 'BuildDiscarderProperty', strategy: [$class: 'LogRotator', artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '60', numToKeepStr: '20']]]);

standardFrontendBuild {
    nexusArtifactName = 'easy-launch'
    sourceDirectory = 'dist'
    buildNode = 'int-linux-t3medium'
    publish = true
    deploy = false
    build = true
    confluenceParent = '2558656513'
    confluencePrefix = 'easy-launch'
    deployDevelopEnvironment = "dev"
}
