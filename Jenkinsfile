pipeline {
agent any


environment {
    DOCKER_IMAGE = "patnamraveendra/ecommerce-project"
}

stages {

    stage('Checkout') {
        steps {
            git branch: 'main',
            url: 'https://github.com/patnamraveendra1-beep/ecommerce-project.git'
        }
    }

    stage('Build Docker Image') {
        steps {
            bat 'docker build -t %DOCKER_IMAGE%:latest .'
        }
    }

    stage('Docker Login') {
        steps {
            withCredentials([usernamePassword(
                credentialsId: 'dockerhub-creds',
                usernameVariable: 'DOCKER_USER',
                passwordVariable: 'DOCKER_PASS'
            )]) {
                bat 'docker login -u %DOCKER_USER% -p %DOCKER_PASS%'
            }
        }
    }

    stage('Push Image') {
        steps {
            bat 'docker push %DOCKER_IMAGE%:latest'
        }
    }
}


}
