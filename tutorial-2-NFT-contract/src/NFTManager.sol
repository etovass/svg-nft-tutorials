// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "erc721a/contracts/extensions/ERC721AQueryable.sol";
import "erc721a/contracts/ERC721A.sol";
import "erc721a/contracts/extensions/ERC721AQueryable.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

import {Utils} from './Utils.sol';
import {SVGRenderer} from './SVGRenderer.sol';

contract NFTManager is ERC721AQueryable, ERC2981, Pausable, Ownable, ReentrancyGuard {

    uint256 public constant MAX_PER_ADDRESS = 3;
    uint256 public constant PRICE = 0.001 ether;
    uint256 public constant MAX_NFT_ITEMS = 721;

    SVGRenderer public renderer;

    constructor() ERC721A("Eto Vass NFT Tutorial", "0xEV") Ownable(msg.sender) {
        renderer = new SVGRenderer();
        _setDefaultRoyalty(msg.sender, _feeDenominator() / 20); // 5% royalty
        pause();
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    modifier mintIsOpen {
        require(totalSupply() <= MAX_NFT_ITEMS, "Mint has ended");
        require(!paused(), "Mint is paused");
        _;
    }
    
    function numberMinted(address owner) public view returns (uint256) {
        return _numberMinted(owner);
    }

    function mint(uint256 quantity) public payable mintIsOpen nonReentrant { 
        uint256 total = totalSupply();
        require(total + quantity <= MAX_NFT_ITEMS, "Max limit exceeded");
        require(total <= MAX_NFT_ITEMS, "Mint ended");
        require(
            numberMinted(msg.sender) + quantity <= MAX_PER_ADDRESS,
            "Cannot mint that many items"
        );
        require(msg.value >= quantity * PRICE, "Insufficient funds");
        _safeMint(msg.sender, quantity);
    }

    function withdrawAll() public payable onlyOwner {
        uint balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }

    function tokenURI(uint256 tokenId) public view virtual override(IERC721A, ERC721A) returns (string memory) {
        require(_exists(tokenId), "URI query for nonexistent token");
 
        return renderAsDataUriInternal(tokenId);
    }

    function renderAsDataUriInternal(uint256 _tokenId) internal view returns (string memory) {
        string memory svg;
        string memory attributes;

        (svg, attributes) = renderer.renderSVG(_tokenId);

        string memory image = string.concat('"image":"data:image/svg+xml;base64,', Utils.encode(bytes(svg)),'"');

        string memory json = string.concat(
            '{"name":"On-chain NFT Tutorial #',
            Utils.toString(_tokenId),
            '","description":"This is NFT from the On-chain SVG NFT Tutorial by Eto Vass ",',
            attributes,
            ',', image,
            '}'
        );

        // option #1 - as JSON
        return string.concat('data:application/json;utf8,', json);

        // // option #2 - as BASE64 encoded
        // return
        //     string.concat(
        //         "data:application/json;base64,",
        //         Utils.encode(bytes(json))
        //     );    
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(IERC721A, ERC721A, ERC2981) returns (bool) {
        return ERC721A.supportsInterface(interfaceId) || ERC2981.supportsInterface(interfaceId);
    }
}