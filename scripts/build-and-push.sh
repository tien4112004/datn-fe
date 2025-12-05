#!/bin/bash
set -e

# ============================================================================
# Build and Push Docker Images Script
# ============================================================================
# This script builds Docker images for all frontend apps and pushes them
# to the GitHub Container Registry (ghcr.io).
#
# Usage:
#   ./scripts/build-and-push.sh [options]
#
# Options:
#   -r, --registry    Docker registry (default: ghcr.io/tien4112004)
#   -t, --tag         Image tag (default: latest)
#   -a, --app         Build specific app: app|presentation|admin|all (default: all)
#   -p, --push        Push images after building (default: false)
#   -n, --no-cache    Build without cache
#   -h, --help        Show this help message
#
# Examples:
#   ./scripts/build-and-push.sh -t v1.0.0 -p           # Build all and push with tag v1.0.0
#   ./scripts/build-and-push.sh -a app -t latest       # Build only app with latest tag
#   ./scripts/build-and-push.sh -a admin -p -n         # Build admin, no cache, and push
# ============================================================================

# Default values
REGISTRY="ghcr.io/tien4112004"
IMAGE_NAME="datn-fe"
TAG="latest"
BUILD_APP="all"
PUSH_IMAGES=false
NO_CACHE=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Show help
show_help() {
    head -30 "$0" | tail -25
    exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -r|--registry)
            REGISTRY="$2"
            shift 2
            ;;
        -t|--tag)
            TAG="$2"
            shift 2
            ;;
        -a|--app)
            BUILD_APP="$2"
            shift 2
            ;;
        -p|--push)
            PUSH_IMAGES=true
            shift
            ;;
        -n|--no-cache)
            NO_CACHE="--no-cache"
            shift
            ;;
        -h|--help)
            show_help
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            ;;
    esac
done

# Validate BUILD_APP
if [[ ! "$BUILD_APP" =~ ^(app|presentation|admin|all)$ ]]; then
    print_error "Invalid app: $BUILD_APP. Must be one of: app, presentation, admin, all"
    exit 1
fi

# Get script directory and navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

print_info "Project root: $PROJECT_ROOT"
print_info "Registry: $REGISTRY"
print_info "Image name: $IMAGE_NAME"
print_info "Tag: $TAG"
print_info "Building: $BUILD_APP"
print_info "Push images: $PUSH_IMAGES"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build function for a specific app
build_image() {
    local app_name=$1
    local target=$2
    local image_tag="${REGISTRY}/${IMAGE_NAME}:${app_name}-${TAG}"

    print_info "Building image for ${app_name}..."
    print_info "Target: ${target}"
    print_info "Image: ${image_tag}"

    docker build \
        ${NO_CACHE} \
        --target "${target}" \
        -t "${image_tag}" \
        -f Dockerfile \
        .

    if [ $? -eq 0 ]; then
        print_success "Successfully built ${image_tag}"
    else
        print_error "Failed to build ${image_tag}"
        exit 1
    fi

    # Also tag as latest if not already latest
    if [ "$TAG" != "latest" ]; then
        local latest_tag="${REGISTRY}/${IMAGE_NAME}:${app_name}-latest"
        docker tag "${image_tag}" "${latest_tag}"
        print_info "Also tagged as ${latest_tag}"
    fi
}

# Push function for a specific app
push_image() {
    local app_name=$1
    local image_tag="${REGISTRY}/${IMAGE_NAME}:${app_name}-${TAG}"

    print_info "Pushing ${image_tag}..."

    docker push "${image_tag}"

    if [ $? -eq 0 ]; then
        print_success "Successfully pushed ${image_tag}"
    else
        print_error "Failed to push ${image_tag}"
        exit 1
    fi

    # Also push latest if not already latest
    if [ "$TAG" != "latest" ]; then
        local latest_tag="${REGISTRY}/${IMAGE_NAME}:${app_name}-latest"
        print_info "Pushing ${latest_tag}..."
        docker push "${latest_tag}"
        print_success "Successfully pushed ${latest_tag}"
    fi
}

# Build images
echo ""
print_info "=========================================="
print_info "Starting Docker build process..."
print_info "=========================================="
echo ""

if [ "$BUILD_APP" == "all" ] || [ "$BUILD_APP" == "app" ]; then
    build_image "app" "app-production"
fi

if [ "$BUILD_APP" == "all" ] || [ "$BUILD_APP" == "presentation" ]; then
    build_image "presentation" "presentation-production"
fi

if [ "$BUILD_APP" == "all" ] || [ "$BUILD_APP" == "admin" ]; then
    build_image "admin" "admin-production"
fi

# Push images if requested
if [ "$PUSH_IMAGES" = true ]; then
    echo ""
    print_info "=========================================="
    print_info "Pushing images to registry..."
    print_info "=========================================="
    echo ""

    # Check if logged in to registry
    if ! docker pull "${REGISTRY}/${IMAGE_NAME}:app-latest" > /dev/null 2>&1; then
        print_warning "You may need to login to the registry first:"
        print_warning "  docker login ghcr.io -u YOUR_USERNAME"
        echo ""
    fi

    if [ "$BUILD_APP" == "all" ] || [ "$BUILD_APP" == "app" ]; then
        push_image "app"
    fi

    if [ "$BUILD_APP" == "all" ] || [ "$BUILD_APP" == "presentation" ]; then
        push_image "presentation"
    fi

    if [ "$BUILD_APP" == "all" ] || [ "$BUILD_APP" == "admin" ]; then
        push_image "admin"
    fi
fi

echo ""
print_success "=========================================="
print_success "Build process completed!"
print_success "=========================================="
echo ""

# Print summary
print_info "Built images:"
if [ "$BUILD_APP" == "all" ] || [ "$BUILD_APP" == "app" ]; then
    echo "  - ${REGISTRY}/${IMAGE_NAME}:app-${TAG}"
fi
if [ "$BUILD_APP" == "all" ] || [ "$BUILD_APP" == "presentation" ]; then
    echo "  - ${REGISTRY}/${IMAGE_NAME}:presentation-${TAG}"
fi
if [ "$BUILD_APP" == "all" ] || [ "$BUILD_APP" == "admin" ]; then
    echo "  - ${REGISTRY}/${IMAGE_NAME}:admin-${TAG}"
fi

if [ "$PUSH_IMAGES" = true ]; then
    echo ""
    print_info "Images have been pushed to ${REGISTRY}"
fi

echo ""
print_info "To run locally with docker-compose:"
echo "  docker-compose -f docker-compose.prod.yml up -d"