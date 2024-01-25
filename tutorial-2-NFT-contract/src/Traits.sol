// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {Utils} from './Utils.sol';
import {Random, RandomCtx} from './Random.sol';

library Traits {
    enum Figure {
        LINE,
        CIRCLE,
        RECTANGLE,
        ROUND_RECTANGLE
    }    

    struct TraitsInfo {
        Figure figure;
        uint numFigures;
        uint startingHue;
    }

    function randomTraits(RandomCtx memory rndCtx) internal pure returns (TraitsInfo memory) {
        TraitsInfo memory traits = TraitsInfo({
            figure: Figure(Random.randWithProbabilities(rndCtx, Random.probabilityArray(10, 20, 30, 40))),
            numFigures: (1 + Random.randWithProbabilities(rndCtx, Random.probabilityArray(10, 20, 30, 40))) * 25,
            startingHue: uint(Random.randRange(rndCtx, 0, 359))
        });

        return traits;
    } 

    function getTraitsAsJson(TraitsInfo memory traits) internal pure returns (string memory) {
        string memory result = string.concat(
            stringTrait("figure", toString(traits.figure)), ',',
            stringTrait("num figures", Utils.toString(traits.numFigures)), ',',
            stringTrait("starting hue", Utils.toString(traits.startingHue))
        );

        return string.concat('"attributes":[', result, ']');
    }

    function stringTrait(string memory traitName, string memory traitValue) internal pure returns (string memory) {
        return string.concat('{"trait_type":"', traitName,'","value":"',traitValue, '"}');
    }

    function toString(Figure figure) internal pure returns (string memory) {
        if (figure == Figure.CIRCLE) return "circle";
        if (figure == Figure.RECTANGLE) return "rectangle";
        if (figure == Figure.ROUND_RECTANGLE) return "round rectangle";
        
        return "line";
    }
}