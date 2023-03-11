cur=$(pwd)
cd "${_BUILD_REPO_PATH}"

solana airdrop 2 --url "${_BUILD_CLUSTER}"

log=$(anchor deploy --provider.cluster "${_BUILD_CLUSTER}" --provider.wallet ~/.config/solana/id.json 2>&1)

echo "${log}"
cd "${cur}"