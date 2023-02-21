#!/bin/bash
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh -s -- -y
. /root/.cargo/env
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
. /root/.bashrc
. /root/.profile
source /root/.bashrc
source /root/.profile
rustup --version
solana --version
export PATH="/root/.local/share/solana/install/active_release/bin:$PATH"
. /root/.bashrc
. /root/.profile
source /root/.bashrc
source /root/.profile

apt-get update && apt-get upgrade -y && apt-get install -y pkg-config build-essential libudev-dev libssl-dev
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
avm --version
. /root/.bashrc
. /root/.profile
source /root/.bashrc
source /root/.profile
export PATH="/root/.avm/bin:$PATH"
. /root/.bashrc
. /root/.profile
source /root/.bashrc
source /root/.profile

anchor build
cd /app