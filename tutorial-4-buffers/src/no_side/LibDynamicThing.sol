// SPDX-License-Identifier: VPL - VIRAL PUBLIC LICENSE
pragma solidity ^0.8.25;

import "./Append.sol";

library NoSideLibDynamicBytesArr {
    struct LinkedBytes {
        LibDynamicThing.LinkedThings ldt;
    }

    function newDynamicBytesArr() internal pure returns (LinkedBytes memory ret) {
        return LinkedBytes(LibDynamicThing.newLinkedThings());
    }

    function p(LinkedBytes memory ls, bytes memory b) internal pure {
        uint256 ptr;
        assembly {
            ptr := b
        }
        LibDynamicThing.p(ls.ldt, ptr);
    }

    function dump(LinkedBytes memory lb) internal pure returns (bytes[] memory ret) {
        uint256[] memory ptrs = LibDynamicThing.dump(lb.ldt);
        uint256 length = ptrs.length;
        ret = _allocateArr(length);
        assembly {
            for { let i := 0 } 1 {} {
                // hail solady
                let ptr := mload(add(ptrs, add(0x20, mul(i, 0x20))))
                mstore(add(ret, add(0x20, mul(i, 0x20))), ptr)
                i := add(i, 1)
                if iszero(lt(i, length)) { break }
            }
        }
        /* // does this
          uint256 length = ptrs.length;
          ret = new string[](length);
          uint256 ptr;
          string memory str;
          for (uint256 i; i < length; ++i) {
              ptr = ptrs[i];
              assembly {
                  str := ptr
              }
              ret[i] = str;
          }
        */
    }
}

library NoSideLibDynamicStringArr {
    struct LinkedStrings {
        LibDynamicThing.LinkedThings ldt;
    }

    function newDynamicStringArr() internal pure returns (LinkedStrings memory ret) {
        return LinkedStrings(LibDynamicThing.newLinkedThings());
    }

    function p(LinkedStrings memory ls, string memory str) internal pure {
        uint256 ptr;
        assembly {
            ptr := str
        }
        LibDynamicThing.p(ls.ldt, ptr);
    }

    function dump(LinkedStrings memory ls) internal pure returns (string[] memory ret) {
        uint256[] memory ptrs = LibDynamicThing.dump(ls.ldt);
        uint256 length = ptrs.length;
        ret = _allocateStringArr(length);
        assembly {
            for { let i := 0 } 1 {} {
                // hail solady
                let ptr := mload(add(ptrs, add(0x20, mul(i, 0x20))))
                mstore(add(ret, add(0x20, mul(i, 0x20))), ptr)
                i := add(i, 1)
                if iszero(lt(i, length)) { break }
            }
        }
        /* // does this
          uint256 length = ptrs.length;
          ret = new string[](length);
          uint256 ptr;
          string memory str;
          for (uint256 i; i < length; ++i) {
              ptr = ptrs[i];
              assembly {
                  str := ptr
              }
              ret[i] = str;
          }
        */
    }
}

library NoSideLibDynamicUint256Arr {
    struct LinkedUint256s {
        LibDynamicThing.LinkedThings ldt;
    }

    function newDynamicUint256Arr() internal pure returns (LinkedUint256s memory ret) {
        return LinkedUint256s(LibDynamicThing.newLinkedThings());
    }

    function p(LinkedUint256s memory ls, uint256 n) internal pure {
        LibDynamicThing.p(ls.ldt, n);
    }

    function dump(LinkedUint256s memory ls) internal pure returns (uint256[] memory ret) {
        ret = LibDynamicThing.dump(ls.ldt);
    }
}

library NoSideLibDynamicBuffer {
    struct DynamicBuffer {
        uint256 numThings; // not used. but for some reason having it as buffer reduces gas!?
        uint256 first;
        uint256 last;
    }

    struct Thing {
        uint256 ptr;
        uint256 next;
    }

    function newDynamicBuffer() internal pure returns (DynamicBuffer memory ret) {
        Thing memory first;
        assembly {
            mstore(add(ret, 0x20), first)
            mstore(add(ret, 0x40), first)
        }
    }

    function p(DynamicBuffer memory ls, bytes memory data) internal pure {
        LibDynamicThing.Thing memory t;
        assembly {
            mstore(t, data)
            let newPtr := t
            let lastPtr := mload(add(ls, 0x40))

            mstore(add(lastPtr, 0x20), newPtr)
            mstore(add(ls, 0x40), newPtr)
        }
    }

    // will need concat but had issues w it so deprecated it

    function getBuffer(DynamicBuffer memory lts) internal pure returns (bytes memory ret) {
        assembly {
            ret := mload(0x40)

            let len := 0x20 // offset

            let nextPtr := mload(add(lts, 0x20)) // lt.first
            for {} 1 {} {
                nextPtr := mload(add(nextPtr, 0x20)) // ptr to next LinkedThing

                if iszero(nextPtr) { break }

                let ptr := mload(nextPtr) // ptr to actual thing

                mcopy(add(ret, len), add(ptr, 0x20), mload(ptr))
                len := add(len, mload(ptr))
            }
            len := sub(len, 0x20) // undo offset

            mstore(0x40, add(ret, and(add(add(len, 0x20), 0x1f), not(0x1f))))
            mstore(ret, len)
        }
    }
}

library LibDynamicThing {
    struct LinkedThings {
        uint256 numThings;
        uint256 first;
        uint256 last;
    }

    struct Thing {
        uint256 ptr;
        uint256 next;
    }

    // will need concat but had issues w it so deprecated it

    function newLinkedThings() internal pure returns (LinkedThings memory ret) {
        Thing memory first;
        assembly {
            mstore(add(ret, 0x20), first)
            mstore(add(ret, 0x40), first)
        }

        /* // it does this ...
          Thing memory first;
          uint256 ptr;
          assembly {
              ptr := first
          }
          ret.first = ptr;
          ret.last = ptr;
       */
    }

    function p(LinkedThings memory lts, uint256 ptr) internal pure {
        Thing memory t;
        assembly {
            mstore(t, ptr)
            let newPtr := t
            let lastPtr := mload(add(lts, 0x40))

            mstore(add(lastPtr, 0x20), newPtr)
            mstore(add(lts, 0x40), newPtr)
            //mstore(lts, add(mload(lts), 1)) // TODO deprecate numThings
        }

        /*// it does this ...
          Thing memory t;
          t.ptr = ptr;
          uint256 newPtr;
          assembly {
              newPtr := t
          }
          uint256 lastPtr = lt.last;
          Thing memory lastThing;
          assembly {
              lastThing := lastPtr
          }
          lastThing.next = newPtr;
          lt.last = newPtr;
          ++lt.numThings;
        */
    }

    function dump(LinkedThings memory lts) internal pure returns (uint256[] memory ret) {
        assembly {
            ret := mload(0x40)
            let len
            let nextPtr := mload(add(lts, 0x20)) // lt.first
            for {} 1 {} {
                nextPtr := mload(add(nextPtr, 0x20))
                if iszero(nextPtr) { break }
                mstore(add(ret, add(0x20, mul(len, 0x20))), mload(nextPtr))
                len := add(len, 1)
            }
            mstore(0x40, add(ret, and(add(add(mul(len, 0x20), 0x20), 0x1f), not(0x1f))))
            mstore(ret, len)
        }

        /* // it does this ..
            uint256 length = lts.numThings;
            ret = new uint256[](length);
            uint256 length = lt.numThings;
            ret = new uint256[](length);
            Thing memory t;
            uint256 nextPtr = lt.first;
            assembly {
                t := nextPtr
            }
            for (uint256 i; i < length; ++i) {
                nextPtr = t.next;
                assembly {
                    t := nextPtr
                }
                ret[i] = t.ptr;
            }
        */
    }
}
