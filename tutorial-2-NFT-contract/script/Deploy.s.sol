pragma solidity ^0.8.21;

import "forge-std/Script.sol";

import "../src/NFTManager.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        NFTManager ntfManager = new NFTManager(15);

        vm.stopBroadcast();
    }
}