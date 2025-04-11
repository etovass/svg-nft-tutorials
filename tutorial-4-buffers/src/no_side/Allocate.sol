// SPDX-License-Identifier: VPL - VIRAL PUBLIC LICENSE
pragma solidity ^0.8.25;

function _allocateBytes(uint256 len) pure returns (bytes memory ret) {
    assembly {
        ret := mload(0x40)

        // new "memory end" including padding
        mstore(0x40, add(ret, and(add(add(len, 0x20), 0x1f), not(0x1f))))

        mstore(ret, len)
    }
}

function _allocateString(uint256 len) pure returns (string memory ret) {
    assembly {
        ret := mload(0x40)

        // new "memory end" including padding
        mstore(0x40, add(ret, and(add(add(len, 0x20), 0x1f), not(0x1f))))

        mstore(ret, len)
    }
}

function _allocateArr(uint256 len) pure returns (bytes[] memory ret) {
    assembly {
        ret := mload(0x40)

        // new "memory end" including padding
        mstore(0x40, add(ret, and(add(add(mul(len, 0x20), 0x20), 0x1f), not(0x1f))))
        mstore(ret, len)
    }
}

function _allocateStringArr(uint256 len) pure returns (string[] memory ret) {
    assembly {
        ret := mload(0x40)

        // new "memory end" including padding
        mstore(0x40, add(ret, and(add(add(mul(len, 0x20), 0x20), 0x1f), not(0x1f))))
        mstore(ret, len)
    }
}

function _allocateUintArr(uint256 len) pure returns (uint256[] memory ret) {
    assembly {
        ret := mload(0x40)

        // new "memory end" including padding
        mstore(0x40, add(ret, and(add(add(mul(len, 0x20), 0x20), 0x1f), not(0x1f))))

        mstore(ret, len)
    }
}

function _allocateIntArr(uint256 len) pure returns (int256[] memory ret) {
    assembly {
        ret := mload(0x40)

        // new "memory end" including padding
        mstore(0x40, add(ret, and(add(add(mul(len, 0x20), 0x20), 0x1f), not(0x1f))))

        mstore(ret, len)
    }
}

function _allocateAddressArr(uint256 len) pure returns (address[] memory ret) {
    assembly {
        ret := mload(0x40)

        // new "memory end" including padding
        mstore(0x40, add(ret, and(add(add(mul(len, 0x20), 0x20), 0x1f), not(0x1f))))

        mstore(ret, len)
    }
}
