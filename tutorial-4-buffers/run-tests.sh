#!/bin/sh

function runTest() {
    echo "Running test for $1 $2"
    export NFT_ID=$1
    export NFT_RENDERER=$2
    result=$(forge test --match-test testSvgRenderer --match-path test/BasicSVGRenderer.t.sol -vv)
    
    echo "$result"
    
    NFT_GAS=$(echo "$result" | sed -n 's/.*NFT_GAS=\([0-9]*\).*/\1/p')
    NFT_OUTPUT_LENGTH=$(echo "$result" | sed -n 's/.*NFT_OUTPUT_LENGTH=\([0-9]*\).*/\1/p')

    if [ "$2" -eq 2 ]; then
        printf "%s, %s" "$1" "$NFT_OUTPUT_LENGTH" >> results.csv
    fi

    printf ", %s" "$NFT_GAS" >> results.csv
}

printf "circles, svg lenght (bytes), the dude dynamic buffer GAS, string concat, abi encode packed, solady dynamic buffer GAS, no_side dynamic buffer GAS\n" > results.csv

for i in 10 50 100 200 300 500 1000 1200 1500 2000 3000 5000 10000 15000
do
    runTest $i 2
    runTest $i 0
    runTest $i 1
    runTest $i 3
    runTest $i 4
    printf "\n" >> results.csv
done


