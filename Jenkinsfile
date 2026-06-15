pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "patnamraveendra/ecommerce-backend"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/patnamraveendra1-beep/ecommerce-project.git'
            }
        }

        stage('Build Backend Image') {
            steps {
                sh 'docker build -t ${BACKEND_IMAGE}:latest -f backend/Dockerfile backend'
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                   
               
            
  

        stage('Push Backend Image') {
            steps {
                sh 'docker push ${BACKEND_IMAGE}:latest'
            }
        }
    }
}