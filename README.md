# SVG On-chain NFT Tutorials
- Part 1: Basic SVG Rendering - https://www.fullyonchain.art/articles/fully-on-chain-svg-nfts-rendering
- Part 2: ERC-721 NFT Contract - to be released soon
- Part 3: Minting website - to be released soon

# SVG On-chain NFT Tooling

A tutorial for building fully on-chain SVG NFT projects. Inspired (and based on, but also enhanced): https://github.com/w1nt3r-eth/hot-chain-svg/

## Benefits
- Based on Foundry - super fast and simple
- Validates SVG files and Traits JSON
- Outputs GAS usage
- Generate PNG files for quickly reviewing the generated collection


## Demo 
https://github.com/etovass/svg-nft-tutorials/assets/153132866/72c6e9e2-8d53-4a44-ac9e-d92f2dbc0880

## Getting Started

Clone the repostiry and modify it to meet your needs

```
$ git clone https://github.com/etovass/svg-nft-tutorials
$ cd svg-nft-tutorials
$ cd next-js-tooling/nft-viewer
$ npm update
$ cd ts-tooling
$ npm update
```

## Hot Reload

From project home directory execute:

```
$ cd tutorial-1-basic-svg-rendering
$ ./start-hot-reload.sh
```

Now go to http://localhost:9901 to see the result

Modify ``tutorial-1-basic-svg-rendering/src/BasicSVGRenderer2.sol`` to experience the hot reload

If you want to watch another file or use another test method, then edit ``start-hot-reload.sh``

The default content for ``start-hot-reload.sh`` is :

```
npm  --prefix ../ts-tooling run hot-reload ../tutorial-1-basic-svg-rendering/ test/BasicSVGRenderer.t.sol testSvgRenderer 123
```

where:
- ``../tutorial-1-basic-svg-rendering/`` is the root directory of the foundry project 
- ``test/BasicSVGRenderer.t.sol`` is the relative path (from the rood foundry project directory) to the test that we want to execute
- ``testSvgRenderer`` is the test method in the test contract 
- ``123`` is the default/initial ID of the token that will be shown. You can change it late in the browser easily 
