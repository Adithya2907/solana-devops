# !/bin/bash

# clone the repo
if [ ! -d "solana-twitter" ] ; then
    git clone https://github.com/lorisleiva/solana-twitter.git
fi
cd solana-twitter

# get versions
anchor_version=$(cat "./programs/solana-twitter/Cargo.toml" | grep anchor-lang | grep -o '".*"' | sed 's/"//g')
rust_version=$(cat "./programs/solana-twitter/Cargo.toml" | grep rust-version | grep -o '".*"' | sed 's/"//g')
echo $anchor_version
echo $rust_version

# build and run images
cd ..
docker build -t automation .
docker run automation
docker system prune -f