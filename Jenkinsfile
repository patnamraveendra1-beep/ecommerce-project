pipeline {
    agent any

    stages {
        stage('GitHub Checkout') {
            steps {
                git 'https://github.com/patnamraveendra1-beep/ecommerce-project.git'
            }
        }

        stage('Build') {
            steps {
                echo 'Build Successful'
            }
        }
    }
}