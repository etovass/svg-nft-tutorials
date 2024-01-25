#!/bin/sh

export PRIVATE_KEY=<YOUR_PRIVATE_KEY>
export NODE_URL=https://ethereum-sepolia.publicnode.com
export ETHERSCAN_API_KEY=<YOUR_ETHERSCAN_API_KEY>

forge script script/Deploy.s.sol:Deploy --fork-url $NODE_URL --broadcast --verify -vvvv



