pipeline {
agent any

```
stages {
    stage('GitHub Checkout') {
        steps {
            checkout([
                $class: 'GitSCM',
                branches: [[name: '*/main']],
                userRemoteConfigs: [[
                    url: 'https://github.com/patnamraveendra1-beep/ecommerce-project.git'
                ]]
            ])
        }
    }

    stage('Build') {
        steps {
            echo 'Build Successful'
        }
    }
}
```

}
