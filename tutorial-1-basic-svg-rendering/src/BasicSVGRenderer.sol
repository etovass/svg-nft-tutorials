// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/**
 * @author Eto Vass
 */

contract BasicSVGRenderer {
    function renderSVG() public pure returns (string memory) {
        return '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 512 512">'
                    '<circle cx="256" cy="256" r="128" fill="green"/>'
               '</svg>';
    }
}