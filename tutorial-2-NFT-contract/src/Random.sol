// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

struct RandomCtx {
    uint256 seed;
    uint256 counter;
}

library Random {
    function initCtx(uint startingSeed) internal pure returns (RandomCtx memory) {
        return RandomCtx(startingSeed, 5111111191 * startingSeed);      
    }

    function initCtxFromContract(uint startingSeed) internal view returns (RandomCtx memory) {
        RandomCtx memory ctx = initCtx(startingSeed);
        setSeedFromConract(ctx, startingSeed);
        return ctx;
    }

    function setSeedFromConract(RandomCtx memory ctx, uint startingSeed) internal view {
        ctx.seed = uint(keccak256(
            abi.encode(
                startingSeed,
                blockhash(block.number - 1),
                block.coinbase,
                block.prevrandao,
                block.timestamp
            )
        ));
    }

    function randInt(RandomCtx memory ctx) internal pure returns (uint256) {
        ctx.counter++;

        ctx.seed = uint(keccak256(
            abi.encode(
                ctx.seed, ctx.counter
            )
        ));
        
        return ctx.seed;
    }
    
    function randRange(RandomCtx memory ctx, int from, int to) internal pure returns (int256) { unchecked {
        if (from > to) {
            to = from;
        }
        uint rnd = randInt(ctx);

        return from + int(rnd >> 1) % (to - from + 1);
    }}

    function randWithProbabilities(RandomCtx memory ctx, uint16[] memory probabilities) internal pure returns (uint8) { unchecked {
        uint probSum = 0;

        for (uint8 i = 0; i < probabilities.length; i++) {
            probSum += uint(probabilities[i]);
        }

        int rnd = Random.randRange(ctx, 1, int(probSum));

        probSum = 0;
        for (uint8 i = 0; i < probabilities.length; i++) {
            probSum += uint(probabilities[i]);

            if (int(probSum) >= rnd) {
                return i;
            }
        }

        return 0;
    }}

    function probabilityArray(uint16 a0, uint16 a1) internal pure returns (uint16[] memory) {
        uint16[] memory result = new uint16[](2);
        result[0] = a0;
        result[1] = a1;
        return result;    
    } 

    function probabilityArray(uint16 a0, uint16 a1, uint16 a2) internal pure returns (uint16[] memory) {
        uint16[] memory result = new uint16[](3);
        result[0] = a0;
        result[1] = a1;
        result[2] = a2;
        return result;    
    } 

    function probabilityArray(uint16 a0, uint16 a1, uint16 a2, uint16 a3) internal pure returns (uint16[] memory) {
        uint16[] memory result = new uint16[](4);
        result[0] = a0;
        result[1] = a1;
        result[2] = a2;
        result[3] = a3;
        return result;    
    } 

    function probabilityArray(uint16 a0, uint16 a1, uint16 a2, uint16 a3, uint16 a4) internal pure returns (uint16[] memory) {
        uint16[] memory result = new uint16[](5);
        result[0] = a0;
        result[1] = a1;
        result[2] = a2;
        result[3] = a3;
        result[4] = a4;
        return result;    
    }
}