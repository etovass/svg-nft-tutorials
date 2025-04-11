// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { AbstractTest } from "./AbstractTest.t.sol";
import { BasicSVGRenderer, RendererType } from "../src/BasicSVGRenderer2.sol";

/**
 * @author Eto Vass
 */

contract BasicSVGRendererTest is AbstractTest {
    BasicSVGRenderer public renderer;

    function setUp() public {
        renderer = new BasicSVGRenderer();
    }

    function renderContract(uint tokenId) internal override view returns(string memory) {
        RendererType rendererType = RendererType(vm.envUint("NFT_RENDERER"));
        return renderer.renderSVG(tokenId, rendererType);
    }

    function testSvgRenderer() public {
        super.testRenderer();
    }
}
