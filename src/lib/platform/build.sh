avm install ${_BUILD_ANCHOR_VERSION}
avm use ${_BUILD_ANCHOR_VERSION}

cur=$(pwd)
cd "${_BUILD_REPO_PATH}/repo"

log=$(anchor build 2>&1)

echo "${log}"
cd "${cur}"