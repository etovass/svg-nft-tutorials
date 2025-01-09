// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/**
 * @author Eto Vass
 */

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
}