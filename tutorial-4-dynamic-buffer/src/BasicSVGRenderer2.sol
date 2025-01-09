// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {Utils} from './Utils.sol';
import {Random, RandomCtx} from './Random.sol';
import {DynamicBuffer} from './DynamicBuffer.sol';
import {Test} from 'forge-std/Test.sol';
/**
 * @author Eto Vass
 */

enum RendererType {
    STRING_CONCAT,
    ABI_ENCODE_PACKED,
    DYNAMIC_BUFFER
}

contract BasicSVGRenderer {
    function renderSVG(uint tokenId, RendererType rendererType) public view returns (string memory) {
        if (rendererType == RendererType.STRING_CONCAT) {
            return getSvgStringConcat(tokenId);
        } else if (rendererType == RendererType.DYNAMIC_BUFFER) {
            return getSvgDynamicBuffer(tokenId);
        } else if (rendererType == RendererType.ABI_ENCODE_PACKED) {
            return getSvgAbiEncodePacked(tokenId);
        }
    }

    function getSvgStringConcat(uint tokenId) public pure returns (string memory) {
        string memory circles = "";
        
        for (uint i=0; i < tokenId; i++) { 
            circles = string.concat(circles, '<circle cx="10" cy="10" r="10" fill="red"/>');
        }

        return string.concat('<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 512 512">',circles,'</svg>');
    }

    function getSvgAbiEncodePacked(uint tokenId) public pure returns (string memory) {
        string memory circles = "";
        
        for (uint i=0; i < tokenId; i++) { 
            circles = string(abi.encodePacked(circles, '<circle cx="10" cy="10" r="10" fill="red"/>'));
        }

        return string(abi.encodePacked('<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 512 512">',circles,'</svg>'));
    }

    function getSvgDynamicBuffer(uint tokenId) public pure returns (string memory) {
        bytes memory buffer = DynamicBuffer.allocate(50 * tokenId);

        DynamicBuffer.appendUnchecked(buffer, '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 512 512">');

        for (uint i=0; i < tokenId; i++) { 
            DynamicBuffer.appendUnchecked(buffer, '<circle cx="10" cy="10" r="10" fill="red"/>');
        }

        DynamicBuffer.appendUnchecked(buffer, '</svg>');

        return string(buffer);
    }
}