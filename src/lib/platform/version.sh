repo_path=$_BUILD_REPO_PATH
cargo="${repo_path}/Cargo.toml"

rust_version=$(cat $cargo | grep rust-version | grep -o '".*"' | sed 's/"//g')
anchor_version=$(cat $cargo | grep anchor-lang | grep -o '".*"' | sed 's/"//g')

echo $rust_version
echo $anchor_version

export _BUILD_RUST_VERSION="${rust_version}"
export _BUILD_ANCHOR_VERSION="${anchor_version}"