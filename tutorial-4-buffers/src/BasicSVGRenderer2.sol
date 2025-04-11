// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {Utils} from './Utils.sol';
import {TheDudeDynamicBuffer} from './TheDude/TheDudeDynamicBuffer.sol';
import {SoladyDynamicBufferLib} from './Solady/SoladyDynamicBuffersLib.sol';
import {NoSideLibDynamicBuffer} from './no_side/LibDynamicThing.sol';

/**
 * @author Eto Vass
 */

enum RendererType {
    STRING_CONCAT,
    ABI_ENCODE_PACKED,
    THE_DUDE_DYNAMIC_BUFFER,
    SOLADY_DYNAMIC_BUFFER,
    NO_SIDE_DYNAMIC_BUFFER
}

contract BasicSVGRenderer {
    function renderSVG(uint tokenId, RendererType rendererType) public view returns (string memory) {
        if (rendererType == RendererType.STRING_CONCAT) {
            return getSvgStringConcat(tokenId);
        } else if (rendererType == RendererType.ABI_ENCODE_PACKED) {
            return getSvgAbiEncodePacked(tokenId);
        } else if (rendererType == RendererType.THE_DUDE_DYNAMIC_BUFFER) {
            return getSvgTheDudeDynamicBuffer(tokenId);
        } else if (rendererType == RendererType.SOLADY_DYNAMIC_BUFFER) {
            return getSvgSoladyDynamicBuffer(tokenId);
        } else if (rendererType == RendererType.NO_SIDE_DYNAMIC_BUFFER) {
            return getSvgNoSideDynamicBuffer(tokenId);
        }
    }

    function getSvgStringConcat(uint tokenId) public pure returns (string memory) {
        string memory svg = "";
        
        for (uint i=0; i < tokenId; i++) { 
            svg = string.concat(svg, '<circle cx="10" cy="10" r="10" fill="red"/>');
        }

        return string.concat('<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 512 512">',svg,'</svg>');
    }

    function getSvgAbiEncodePacked(uint tokenId) public pure returns (string memory) {
        string memory svg = "";
        
        for (uint i=0; i < tokenId; i++) { 
            svg = string(abi.encodePacked(svg, '<circle cx="10" cy="10" r="10" fill="red"/>'));
        }

        return string(abi.encodePacked('<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 512 512">',svg,'</svg>'));
    }

    function getSvgSoladyDynamicBuffer(uint tokenId) public pure returns (string memory) {
        SoladyDynamicBufferLib.DynamicBuffer memory buffer;
        buffer = SoladyDynamicBufferLib.reserve(buffer, 50 * tokenId);

        SoladyDynamicBufferLib.p(buffer, '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 512 512">');
        
        for (uint i=0; i < tokenId; i++) { 
            SoladyDynamicBufferLib.p(buffer, '<circle cx="10" cy="10" r="10" fill="red"/>');
        }

        SoladyDynamicBufferLib.p(buffer, '</svg>');

        return SoladyDynamicBufferLib.s(buffer);
    }

    function getSvgTheDudeDynamicBuffer(uint tokenId) public pure returns (string memory) {
        bytes memory buffer = TheDudeDynamicBuffer.allocate(50 * tokenId);

        TheDudeDynamicBuffer.appendUnchecked(buffer, '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 512 512">');

        for (uint i=0; i < tokenId; i++) { 
            TheDudeDynamicBuffer.appendUnchecked(buffer, '<circle cx="10" cy="10" r="10" fill="red"/>');
        }

        TheDudeDynamicBuffer.appendUnchecked(buffer, '</svg>');

        return string(buffer);
    }

    function getSvgNoSideDynamicBuffer(uint tokenId) public pure returns (string memory) {
        NoSideLibDynamicBuffer.DynamicBuffer memory buffer = NoSideLibDynamicBuffer.newDynamicBuffer();

        NoSideLibDynamicBuffer.p(buffer, '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 512 512">');
        
        for (uint i=0; i < tokenId; i++) { 
            NoSideLibDynamicBuffer.p(buffer, '<circle cx="10" cy="10" r="10" fill="red"/>');
        }

        NoSideLibDynamicBuffer.p(buffer, '</svg>');

        return string(NoSideLibDynamicBuffer.getBuffer(buffer));
    }
}