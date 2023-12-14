// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {Utils} from './Utils.sol';
import {Random, RandomCtx} from './Random.sol';

contract BasicSVGRenderer {
    function renderSVG(uint tokenId) public pure returns (string memory) {

        return '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 512 512">'
                    '<circle cx="256" cy="256" r="128" fill="green"/>'
               '</svg>';
    }
}