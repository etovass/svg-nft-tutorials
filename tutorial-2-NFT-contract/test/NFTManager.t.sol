// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.21;

import { AbstractTest } from "./AbstractTest.t.sol";
import { NFTManager } from '../src/NFTManager.sol';


contract NFTManagerTestInternal is NFTManager {
    function renderAsDataUriInternalExt(uint256 _tokenId) public view returns (string memory) {
        return renderAsDataUriInternal(_tokenId);
    } 
}

contract NFTManagerTest is AbstractTest {
    NFTManagerTestInternal public renderer;

    function setUp() public {
        renderer = new NFTManagerTestInternal();
    }

    function renderContract(uint tokenId) internal override view returns(string memory svg) {
        return renderer.renderAsDataUriInternalExt(tokenId);
    }

    function testSvgRenderer() public view {
        super.testRenderer();
    }
}