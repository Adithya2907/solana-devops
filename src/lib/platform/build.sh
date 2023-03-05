echo "Building ${_BUILD_REPO_PATH} with ${_BUILD_ANCHOR_VERSION}"
docker build -t automation --build-arg anchor_version="${_BUILD_ANCHOR_VERSION}" $_BUILD_REPO_PATH
echo "Running"
docker run -v ${_BUILD_REPO_PATH}/artifacts:/app/target automation