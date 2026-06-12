pipeline {
agent any


environment {
    BACKEND_IMAGE = "patnamraveendra/ecommerce-backend"
    FRONTEND_IMAGE = "patnamraveendra/ecommerce-frontend"
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
            bat 'docker build -t %BACKEND_IMAGE%:latest -f backend/Dockerfile backend'
        }
    }

    stage('Build Frontend Image') {
        steps {
            bat 'docker build -t %FRONTEND_IMAGE%:latest -f frontend/Dockerfile frontend'
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

    stage('Push Backend Image') {
        steps {
            bat 'docker push %BACKEND_IMAGE%:latest'
        }
    }

    stage('Push Frontend Image') {
        steps {
            bat 'docker push %FRONTEND_IMAGE%:latest'
        }
    }
}


}
