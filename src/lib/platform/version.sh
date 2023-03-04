#!/bin/sh
repo_path="${_BUILD_REPO_PATH}/repo"
anchorlang=""

for i in $(ls -d "${repo_path}"/programs/*/); do
    if [ "$anchorlang"="" ]
    then
        anchorlang=$(cat "${i%%/}/Cargo.toml" | grep anchor-lang | grep -o '".*"' | sed 's/"//g')
    else
        newversion=$(cat "${i%%/}/Cargo.toml" | grep anchor-lang | grep -o '".*"' | sed 's/"//g')
        if [ "$anchorlang"!="$newversion" ]
        then
            echo "Found different anchor version dependencies for different programs"
            exit 1
        fi
    fi
done

rust_version=$(cat "${repo_path}/Cargo.lock" | grep rust-version | grep -o '".*"' | sed 's/"//g')
anchor_version=${anchorlang}

echo "Found rust version: $rust_version"
echo "Found anchor version: $anchor_version"

export _BUILD_RUST_VERSION="${rust_version}"
export _BUILD_ANCHOR_VERSION="${anchor_version}"
export _BUILD_REPO_PATH="asd"