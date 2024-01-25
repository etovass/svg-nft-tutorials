// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.21;

import {IERC721Receiver} from "@openzeppelin/contracts/interfaces/IERC721Receiver.sol";

import { AbstractTest } from "./AbstractTest.t.sol";
import { NFTManager } from '../src/NFTManager.sol';

contract NFTManagerTest is AbstractTest {
    NFTManager public renderer;

    function setUp() public {
        renderer = new NFTManager(0);
    }

    function renderContract(uint tokenId) internal override returns(string memory svg) {        
        return renderer.renderAsDataUri(tokenId);
    }

    function testSvgRenderer() public {
        super.testRenderer();
    }
}