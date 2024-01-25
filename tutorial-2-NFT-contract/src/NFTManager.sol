// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import { Utils } from './Utils.sol';
import { SVGRenderer } from './SVGRenderer.sol';

contract NFTManager is ERC721, ERC721Enumerable, Ownable {
    uint256 private _nextTokenId;
    
    uint256 public constant PRICE = 0.005 ether;
    uint256 public constant MAX_NFT_ITEMS = 121;


    SVGRenderer public renderer;

    constructor(uint256 _reservedForTeam) ERC721("Eto Vass NFT Tutorial", "0xEV") Ownable(msg.sender) {
        renderer = new SVGRenderer();

        for (uint i=0; i < _reservedForTeam; i++) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(msg.sender, tokenId);
        }
    }

    modifier mintIsOpen {
        require(totalSupply() < MAX_NFT_ITEMS, "Mint has ended");
        _;
    }

    function safeMint(address to) public mintIsOpen payable {
        require(msg.value >= PRICE, "Insufficient funds");

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
 
        return renderAsDataUri(tokenId);
    }

    function renderAsDataUri(uint256 _tokenId) public view returns (string memory) {
        string memory svg;
        string memory attributes;

        (svg, attributes) = renderer.renderSVG(_tokenId);

        string memory image = string.concat('"image":"data:image/svg+xml;base64,', Utils.encode(bytes(svg)),'"');
    

        string memory json = string.concat(
            '{"name":"On-chain SVG NFT Tutorial #',
            Utils.toString(_tokenId),
            '","description":"This is NFT from the On-chain SVG NFT Tutorial by Eto Vass ",',
            attributes,
            ',', image,
            '}'
        );

        // // option #1 - as JSON
        // return string.concat('data:application/json;utf8,', json);

        // option #2 - as BASE64 encoded
        return
            string.concat(
                "data:application/json;base64,",
                Utils.encode(bytes(json))
            );    
    }

    // The following functions are overrides required by Solidity.

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
