pipeline {
    agent any

    // Build parameters
    parameters {
        string(
            name: 'BRANCH',
            defaultValue: 'main',
            description: 'Git branch to build and deploy'
        )
    }

    // Environment variables
    environment {
        GITHUB_REPO = 'tien4112004/datn-fe'
        GITHUB_USERNAME = 'tien4112004'  // GHCR
        DOCKER_REGISTRY = 'ghcr.io'
        IMAGE_NAME = "${DOCKER_REGISTRY}/${GITHUB_REPO.toLowerCase()}"
        DOCKER_COMPOSE_FILE = 'docker-compose.prod.yml'
        DEPLOY_DIR = '/opt/datn-fe'
        ENV_FILE = '/opt/datn-fe/.env'
        CONTAINER_NAME_MAIN = 'frontend-app-aiprimary'
        CONTAINER_NAME_PRESENTATION = 'frontend-presentation-aiprimary'
        CONTAINER_NAME_ADMIN = 'frontend-admin-aiprimary'
        DOCKER_BUILDKIT = '1'  // Enable BuildKit for better caching
        BUILD_BRANCH = "${params.BRANCH ?: env.GIT_BRANCH ?: 'main'}"
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '30', daysToKeepStr: '30'))
        timestamps()
        timeout(time: 60, unit: 'MINUTES')
    }

    stages {
        stage('Preparation') {
            steps {
                script {
                    echo "========== Build & Deployment Preparation =========="
                    echo "Image: ${IMAGE_NAME}"
                    echo "Deploy Directory: ${DEPLOY_DIR}"
                    echo "Environment File: ${ENV_FILE}"
                    echo "Build Branch: ${BUILD_BRANCH}"
                    echo "Git Branch: ${env.GIT_BRANCH}"
                    echo "Commit: ${env.GIT_COMMIT}"
                }
            }
        }

        stage('Checkout') {
            steps {
                script {
                    echo "========== Checking out branch: ${BUILD_BRANCH} =========="
                    
                    sh '''
                        git fetch origin
                        git checkout ${BUILD_BRANCH} || git checkout origin/${BUILD_BRANCH}
                        git pull origin ${BUILD_BRANCH} || true
                        
                        echo "Current branch:"
                        git branch --show-current
                        echo "Latest commit:"
                        git log -1 --oneline
                    '''
                }
            }
        }

        stage('Validate Environment') {
            steps {
                script {
                    echo "========== Validating Environment =========="
                    
                    sh '''
                        docker --version
                        docker compose version
                        
                        # Check if environment file exists
                        if [ ! -f "${ENV_FILE}" ]; then
                            echo "WARNING: Environment file not found at ${ENV_FILE}"
                        fi
                        
                        # Create deploy directory if not exists
                        mkdir -p ${DEPLOY_DIR}
                    '''
                }
            }
        }

        stage('Authenticate Docker Registry') {
            steps {
                script {
                    echo "========== Authenticating with GHCR =========="
                    
                    withCredentials([usernamePassword(credentialsId: 'GithubPAT', usernameVariable: 'GHCR_USER', passwordVariable: 'GHCR_TOKEN')]) {
                        sh '''
                            # Validate token is not empty
                            if [ -z "${GHCR_TOKEN}" ]; then
                                echo "ERROR: GHCR_TOKEN is empty"
                                exit 1
                            fi
                            
                            # Set username explicitly
                            GHCR_USERNAME="${GITHUB_USERNAME}"
                            
                            # Login to GHCR
                            echo "${GHCR_TOKEN}" | docker login ghcr.io -u "${GHCR_USERNAME}" --password-stdin
                            
                            echo "✓ Successfully authenticated to ghcr.io"
                        '''
                    }
                }
            }
        }

        stage('Pull Cache Images') {
            steps {
                script {
                    echo "========== Pulling Cache Images for Build Optimization =========="
                    
                    sh '''
                        # Try to pull existing images for cache (ignore failures if images don't exist)
                        echo "Attempting to pull existing images for cache..."
                        docker pull ${IMAGE_NAME}:app-latest 2>/dev/null || echo "No existing app image found, will build from scratch"
                        docker pull ${IMAGE_NAME}:presentation-latest 2>/dev/null || echo "No existing presentation image found, will build from scratch"
                        docker pull ${IMAGE_NAME}:admin-latest 2>/dev/null || echo "No existing admin image found, will build from scratch"
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    echo "========== Building Docker Images =========="
                    
                    sh '''
                        # Get short commit SHA for tagging
                        COMMIT_SHA=$(git rev-parse --short HEAD)
                        
                        # Build app image
                        echo "Building App image..."
                        docker build \
                            --target app-production \
                            --tag ${IMAGE_NAME}:app-latest \
                            --tag ${IMAGE_NAME}:app-${COMMIT_SHA} \
                            --cache-from ${IMAGE_NAME}:app-latest \
                            .
                        
                        # Build presentation image
                        echo "Building Presentation image..."
                        docker build \
                            --target presentation-production \
                            --tag ${IMAGE_NAME}:presentation-latest \
                            --tag ${IMAGE_NAME}:presentation-${COMMIT_SHA} \
                            --cache-from ${IMAGE_NAME}:presentation-latest \
                            .
                        
                        # Build admin image
                        echo "Building Admin image..."
                        docker build \
                            --target admin-production \
                            --tag ${IMAGE_NAME}:admin-latest \
                            --tag ${IMAGE_NAME}:admin-${COMMIT_SHA} \
                            --cache-from ${IMAGE_NAME}:admin-latest \
                            .
                        
                        # Show built images
                        echo "========== Built Images =========="
                        docker images | grep ${GITHUB_REPO}
                    '''
                }
            }
        }
        
        stage('Push Docker Images') {
            steps {
                script {
                    echo "========== Pushing Docker Images to Registry =========="
                    
                    sh '''
                        COMMIT_SHA=$(git rev-parse --short HEAD)
                        
                        # Push app images
                        echo "Pushing App images..."
                        docker push ${IMAGE_NAME}:app-latest
                        docker push ${IMAGE_NAME}:app-${COMMIT_SHA}
                        
                        # Push presentation images
                        echo "Pushing Presentation images..."
                        docker push ${IMAGE_NAME}:presentation-latest
                        docker push ${IMAGE_NAME}:presentation-${COMMIT_SHA}
                        
                        # Push admin images
                        echo "Pushing Admin images..."
                        docker push ${IMAGE_NAME}:admin-latest
                        docker push ${IMAGE_NAME}:admin-${COMMIT_SHA}
                        
                        echo "✓ All images pushed successfully"
                    '''
                }
            }
        }

        stage('Stop Current Deployment') {
            steps {
                script {
                    echo "========== Stopping Current Frontend Deployment =========="
                    
                    sh '''
                        cd ${DEPLOY_DIR}
                        
                        if [ -f "${DOCKER_COMPOSE_FILE}" ]; then
                            docker compose -f ${DOCKER_COMPOSE_FILE} down || true
                            echo "Frontend services stopped via compose"
                        else
                            # Stop containers manually if compose file doesn't exist yet
                            docker stop ${CONTAINER_NAME_MAIN} 2>/dev/null || true
                            docker rm ${CONTAINER_NAME_MAIN} 2>/dev/null || true
                            docker stop ${CONTAINER_NAME_PRESENTATION} 2>/dev/null || true
                            docker rm ${CONTAINER_NAME_PRESENTATION} 2>/dev/null || true
                            docker stop ${CONTAINER_NAME_ADMIN} 2>/dev/null || true
                            docker rm ${CONTAINER_NAME_ADMIN} 2>/dev/null || true
                            echo "Frontend containers stopped manually"
                        fi
                    '''
                }
            }
        }

        stage('Copy Configuration') {
            steps {
                script {
                    echo "========== Copying Configuration Files =========="
                    
                    sh '''
                        # Copy docker-compose file to deploy directory
                        cp ${WORKSPACE}/${DOCKER_COMPOSE_FILE} ${DEPLOY_DIR}/
                        
                        echo "Configuration copied to ${DEPLOY_DIR}"
                        echo "Files in deploy directory:"
                        ls -la ${DEPLOY_DIR}
                    '''
                }
            }
        }

        stage('Start Deployment') {
            steps {
                script {
                    echo "========== Starting Deployment with Docker Compose =========="
                    
                    sh '''
                        cd ${DEPLOY_DIR}
                        
                        # Ensure network exists
                        docker network create network-aiprimary 2>/dev/null || true
                        
                        # Start frontend services
                        echo "Starting frontend services..."
                        
                        if [ -f "${ENV_FILE}" ]; then
                            docker compose -f ${DOCKER_COMPOSE_FILE} --env-file ${ENV_FILE} pull
                            docker compose -f ${DOCKER_COMPOSE_FILE} --env-file ${ENV_FILE} up -d
                        else
                            docker compose -f ${DOCKER_COMPOSE_FILE} pull
                            docker compose -f ${DOCKER_COMPOSE_FILE} up -d
                        fi
                        
                        echo "Frontend containers started successfully"
                        
                        # Wait for services to initialize
                        echo "Waiting for services to initialize..."
                        sleep 10
                        
                        # Show status of services
                        echo "========== Service Status =========="
                        docker compose -f ${DOCKER_COMPOSE_FILE} ps
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo "========== Running Health Checks =========="
                    
                    sh '''
                        # Wait for App to be healthy
                        echo "Checking App application..."
                        timeout=60
                        counter=0
                        until curl -sf http://localhost:5173/ > /dev/null 2>&1; do
                            counter=$((counter + 1))
                            if [ $counter -gt $timeout ]; then
                                echo "WARNING: App health check timed out after ${timeout} seconds"
                                break
                            fi
                            echo "Waiting for App... ($counter/$timeout)"
                            sleep 1
                        done
                        
                        if [ $counter -le $timeout ]; then
                            echo "✓ App application is healthy"
                        fi
                        
                        # Wait for Presentation app to be healthy
                        echo "Checking Presentation application..."
                        counter=0
                        until curl -sf http://localhost:5174/ > /dev/null 2>&1; do
                            counter=$((counter + 1))
                            if [ $counter -gt $timeout ]; then
                                echo "WARNING: Presentation app health check timed out after ${timeout} seconds"
                                break
                            fi
                            echo "Waiting for Presentation app... ($counter/$timeout)"
                            sleep 1
                        done
                        
                        if [ $counter -le $timeout ]; then
                            echo "✓ Presentation application is healthy"
                        fi
                        
                        # Wait for Admin app to be healthy
                        echo "Checking Admin application..."
                        counter=0
                        until curl -sf http://localhost:5175/ > /dev/null 2>&1; do
                            counter=$((counter + 1))
                            if [ $counter -gt $timeout ]; then
                                echo "WARNING: Admin app health check timed out after ${timeout} seconds"
                                break
                            fi
                            echo "Waiting for Admin app... ($counter/$timeout)"
                            sleep 1
                        done
                        
                        if [ $counter -le $timeout ]; then
                            echo "✓ Admin application is healthy"
                        fi
                        
                        echo "✓ Health checks completed"
                    '''
                }
            }
        }

        stage('Cleanup Old Images') {
            when {
                expression {
                    return env.BUILD_BRANCH == 'main' || env.BUILD_BRANCH == 'origin/main'
                }
            }
            steps {
                script {
                    echo "========== Cleaning Up Old Docker Images =========="
                    
                    sh '''
                        # Remove dangling images
                        docker image prune -f || true
                        
                        # Remove unused volumes
                        docker volume prune -f || true
                        
                        # Show disk usage
                        docker system df
                    '''
                }
            }
        }
    }

    post {
        always {
            script {
                echo "========== Pipeline Completed =========="
                
                // Save deployment logs
                sh '''
                    mkdir -p ${WORKSPACE}/logs || true
                    
                    # Save logs for container app if it exists
                    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME_MAIN}$"; then
                        echo "Saving logs for container ${CONTAINER_NAME_MAIN}..."
                        docker logs ${CONTAINER_NAME_MAIN} > ${WORKSPACE}/logs/container.log 2>&1 || true
                    else
                        echo "Container ${CONTAINER_NAME_MAIN} does not exist, skipping log collection"
                    fi
                    
                    # Save logs for presentation app if it exists
                    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME_PRESENTATION}$"; then
                        echo "Saving logs for container ${CONTAINER_NAME_PRESENTATION}..."
                        docker logs ${CONTAINER_NAME_PRESENTATION} > ${WORKSPACE}/logs/presentation.log 2>&1 || true
                    else
                        echo "Container ${CONTAINER_NAME_PRESENTATION} does not exist, skipping log collection"
                    fi
                    
                    # Save logs for admin app if it exists
                    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME_ADMIN}$"; then
                        echo "Saving logs for container ${CONTAINER_NAME_ADMIN}..."
                        docker logs ${CONTAINER_NAME_ADMIN} > ${WORKSPACE}/logs/admin.log 2>&1 || true
                    else
                        echo "Container ${CONTAINER_NAME_ADMIN} does not exist, skipping log collection"
                    fi
                    
                    # Save compose status if compose file exists
                    if [ -f "${DEPLOY_DIR}/${DOCKER_COMPOSE_FILE}" ]; then
                        docker compose -f ${DEPLOY_DIR}/${DOCKER_COMPOSE_FILE} ps > ${WORKSPACE}/logs/containers.log 2>&1 || true
                    fi
                '''
            }
        }

        success {
            script {
                echo "✓ Build and Deployment successful!"
                sh '''
                    COMMIT_SHA=$(git rev-parse --short HEAD)
                    echo "Images built and pushed:"
                    echo "  - ${IMAGE_NAME}:app-latest (${IMAGE_NAME}:app-${COMMIT_SHA})"
                    echo "  - ${IMAGE_NAME}:presentation-latest (${IMAGE_NAME}:presentation-${COMMIT_SHA})"
                    echo "  - ${IMAGE_NAME}:admin-latest (${IMAGE_NAME}:admin-${COMMIT_SHA})"
                '''
                echo ""
                echo "Applications available at:"
                echo "  - Container app: http://localhost:5173"
                echo "  - Presentation app: http://localhost:5174"
                echo "  - Admin app: http://localhost:5175"
            }
        }

        failure {
            script {
                echo "✗ Deployment failed!"
                
                sh '''
                    echo "========== Container Status =========="
                    docker ps -a || true
                    
                    echo "========== Recent Container Logs =========="
                    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME_MAIN}$"; then
                        echo "--- Container App Logs ---"
                        docker logs --tail 50 ${CONTAINER_NAME_MAIN} || true
                    fi
                    
                    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME_PRESENTATION}$"; then
                        echo "--- Presentation App Logs ---"
                        docker logs --tail 50 ${CONTAINER_NAME_PRESENTATION} || true
                    fi
                    
                    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME_ADMIN}$"; then
                        echo "--- Admin App Logs ---"
                        docker logs --tail 50 ${CONTAINER_NAME_ADMIN} || true
                    fi
                    
                    echo "========== Docker Compose Status =========="
                    if [ -f "${DEPLOY_DIR}/${DOCKER_COMPOSE_FILE}" ]; then
                        cd ${DEPLOY_DIR}
                        docker compose -f ${DOCKER_COMPOSE_FILE} ps || true
                    else
                        echo "Docker compose file not found at ${DEPLOY_DIR}"
                    fi
                '''
            }
        }

        unstable {
            echo "⚠ Pipeline is unstable"
        }

        cleanup {
            script {
                echo "Cleaning up workspace..."
                // cleanWs()
            }
        }
    }
}
