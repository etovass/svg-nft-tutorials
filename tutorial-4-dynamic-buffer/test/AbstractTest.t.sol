// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { Test } from "forge-std/Test.sol";
import { Utils } from "../src/Utils.sol";
import "forge-std/console2.sol";

/**
 * @author Eto Vass
 * @notice Tests that will be invoked from the ts-tooling must extend this abstract contract and implement
 *   renderContract() function. They also must call testRederer() from public function that starts with 'test'
 */

abstract contract AbstractTest is Test {
    string internal constant NFT_ID = "NFT_ID";
    string internal constant NFT_GAS = "NFT_GAS";
    string internal constant NFT_OUTPUT_LENGTH = "NFT_OUTPUT_LENGTH";
    string internal constant NFT_OUTPUT = "NFT_OUTPUT";

    function getTokenId() internal view returns (uint) {
        // NFT_ID env variable will be passed by the JS scrip that will invoke "forge test" to execute this contract
        return vm.envUint(NFT_ID); 
    }

    function outputProperty(string memory properyName, string memory propertyValue) internal {
        console2.log(string.concat(properyName, "=", propertyValue));
    }

    function outputProperty(string memory properyName, uint propertyValue) internal {
        console2.log(string.concat(properyName, "=", Utils.toString(propertyValue)));
    }


    function testRenderer() public {
        uint tokenId = getTokenId();
        
        uint gasSnapshot = gasleft();
        string memory rendererOutput = renderContract(tokenId);
        uint gasConsumed = gasSnapshot - gasleft();

        outputProperty(NFT_GAS, gasConsumed); 
        outputProperty(NFT_OUTPUT_LENGTH, bytes(rendererOutput).length);     
        outputProperty(NFT_OUTPUT, rendererOutput);     
    }

    function renderContract(uint tokenId) internal virtual view returns(string memory); // must be inherited 
}