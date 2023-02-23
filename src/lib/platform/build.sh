echo "Building ${_BUILD_REPO_PATH}"
docker build -t automation $_BUILD_REPO_PATH
echo "Running"
docker run automation