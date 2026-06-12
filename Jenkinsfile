pipeline {
    agent any

    stages {
        stage('GitHub Checkout') {
            steps {
                git branch: "main",
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