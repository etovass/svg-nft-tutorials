#!/bin/sh

function runTest() {
    echo "Running test for $1 $2"
    export NFT_ID=$1
    export NFT_RENDERER=$2
    result=$(forge test --match-test testSvgRenderer --match-path test/BasicSVGRenderer.t.sol -vv)
    
    echo "$result"
    
    NFT_GAS=$(echo "$result" | sed -n 's/.*NFT_GAS=\([0-9]*\).*/\1/p')
    NFT_OUTPUT_LENGTH=$(echo "$result" | sed -n 's/.*NFT_OUTPUT_LENGTH=\([0-9]*\).*/\1/p')

    if [ "$2" -eq 0 ]; then
        printf "%s, %s" "$1" "$NFT_OUTPUT_LENGTH" >> results.csv
    fi

    printf ", %s" "$NFT_GAS" >> results.csv
}

printf "circles, svg lenght, string concat, abi encode packed, dynamic buffer\n" > results.csv

for i in 1 5 10 50 100 200 300 500 1000
do
    runTest $i 0
    runTest $i 1
    runTest $i 2
    printf "\n" >> results.csv
done


