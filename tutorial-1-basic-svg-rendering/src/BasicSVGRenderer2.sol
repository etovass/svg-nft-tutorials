// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {Utils} from './Utils.sol';
import {Random, RandomCtx} from './Random.sol';

/**
 * @author Eto Vass
 */

contract BasicSVGRenderer {
    function renderSVG(uint tokenId) public pure returns (string memory) {
        RandomCtx memory ctx = Random.initCtx(tokenId);
        
        string memory circles = "";

        int hue = Random.randRange(ctx, 0, 359);
        

        for (uint i=0; i < 50; i++) { 
            int cx = Random.randRange(ctx, 0, 512);
            int cy = Random.randRange(ctx, 0, 512);
            int r = Random.randRange(ctx, 24, 64);
            int sat = Random.randRange(ctx, 0, 100);            
            int opacity = Random.randRange(ctx, 10, 99);


            circles = string.concat(circles, '<circle cx="', Utils.toString(cx), '" cy="', Utils.toString(cy), 
                '" r="', Utils.toString(r),'" fill="hsl(',Utils.toString(hue), ',', Utils.toString(sat),'%, 50%)" opacity="0.', Utils.toString(opacity), '"/>');
        }


        return string.concat('<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 512 512">',circles,'</svg>');
    }
}