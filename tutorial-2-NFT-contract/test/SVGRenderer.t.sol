// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { AbstractTest } from "./AbstractTest.t.sol";
import { SVGRenderer } from "../src/SVGRenderer.sol";

contract SVGRendererTest is AbstractTest {
    SVGRenderer public renderer;

    function setUp() public {
        renderer = new SVGRenderer();
    }

    function renderContract(uint tokenId) internal override returns(string memory svg) {
        (svg, ) = renderer.renderSVG(tokenId);

        return svg;
    }

    function testSvgRenderer() public {
        super.testRenderer();
    }
}
