// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {Utils} from './Utils.sol';
import {Random, RandomCtx} from './Random.sol';
import {Traits} from './Traits.sol';

contract SVGRenderer {
    function renderSVG(uint tokenId) public pure returns (string memory svg, string memory traitsAsString) {
        RandomCtx memory ctx = Random.initCtx(tokenId);

        Traits.TraitsInfo memory traits = Traits.randomTraits(ctx);
        traitsAsString = Traits.getTraitsAsJson(traits);
        
        svg = "";

        uint hue = traits.startingHue;
        
        for (uint i=0; i < traits.numFigures; i++) { 
            int x1 = Random.randRange(ctx, 0, 512);
            int y1 = Random.randRange(ctx, 0, 512);
            int x2 = Random.randRange(ctx, 0, 512);
            int y2 = Random.randRange(ctx, 0, 512);
            int r = Random.randRange(ctx, 10, 64);
            int sat = Random.randRange(ctx, 0, 100);            
            int opacity = Random.randRange(ctx, 10, 39);

            string memory fill = string.concat('"hsl(',Utils.toString(hue), ',', Utils.toString(sat),'%, 50%)" opacity="0.', Utils.toString(opacity), '"');

            if (traits.figure == Traits.Figure.LINE) {
                svg = string.concat(svg, 
                    '<line x1="', Utils.toString(x1), '" y1="', Utils.toString(y1), 
                        '" x2="', Utils.toString(x2), '" y2="', Utils.toString(y2), '" stroke=', fill, ' stroke-width="10"/>');
            } else if (traits.figure == Traits.Figure.CIRCLE) {
                svg = string.concat(svg, '<circle cx="', Utils.toString(x1), '" cy="', Utils.toString(y1), 
                '" r="', Utils.toString(r),'" fill=',fill, '/>');
            } else {    
                string memory rx = "";

                if (traits.figure == Traits.Figure.ROUND_RECTANGLE) {
                    rx = string.concat('rx="', Utils.toString(r), '"');
                }

                svg = string.concat(svg, 
                    '<rect x="', Utils.toString(Utils.min(x1, x2)), '" y="', Utils.toString(Utils.min(y1, y2)), 
                        '" width="', Utils.toString(Utils.abs(x2-x1)), '" height="', Utils.toString(Utils.abs(y2-y1)),
                        '" ', rx, ' fill=', fill, '/>');
            }
        }

        svg = string.concat('<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 512 512">',svg,'</svg>');
    }
}