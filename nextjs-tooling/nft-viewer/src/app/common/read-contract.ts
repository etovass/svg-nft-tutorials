import { Chain, Client, HttpTransport, PublicClient, createPublicClient, defineChain, http } from 'viem'
import { mainnet, goerli, sepolia, optimism, optimismGoerli, optimismSepolia } from 'viem/chains';
import { Address} from 'abitype';

export const CUSTOM_NETWORK_ID = "custom";

export const NETWORKS = [
    {id: "mainnet", label: "Ethereum Mainnet", chain: mainnet},
    {id: "goerli", label: "Ethereum Goerli", chain: goerli},
    {id: "sepolia", label: "Ethereum Sepolia", chain: sepolia},
    {id: "optimism-mainnet", label: "Optimism Mainnet", chain: optimism},
    {id: "optimism-goerli", label: "Optimism Goerli", chain: optimismGoerli},
    {id: "optimism-sepolia", label: "Optimism Sepolia", chain: optimismSepolia},
    {id: CUSTOM_NETWORK_ID, label: "Custom", chain: null},
];

function findNetworkIndexById(networkId: string) {
    for (let i = 0; i < NETWORKS.length; i++) {
       if (NETWORKS[i].id == networkId) return i;
    }
    
    throw "Invalid network id: " + networkId;
}

export async function readContract(networkId: string, address: string, functionName: string, tokenId: number, tokenIdType: string, customNodeUrl: string) {
    let client: PublicClient;

    let networkIndex = findNetworkIndexById(networkId);

    console.log(networkIndex)
    
    if (NETWORKS[networkIndex].id == CUSTOM_NETWORK_ID) {
        const customChain = defineChain({
            id: 7777777,
            name: 'custom',
            nativeCurrency: {
              decimals: 18,
              name: 'Ether',
              symbol: 'ETH',
            },
            rpcUrls: {
              default: {
                http: [customNodeUrl],
              }
            }
        });
        client = createPublicClient({
            chain: customChain,
            transport: http(),
        });

    } else {
        let transport: HttpTransport;

        if (process.env.NEXT_PUBLIC_INFURA_API_KEY) {
            transport = http(`https://${NETWORKS[networkIndex].id}.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`);
        } else {
            console.warn("INFURA_API_KEY is not set, using default cloudflare public nodes, which are limited and will return errors in some contracts")
            transport = http();
        }

        client = createPublicClient({
            chain: NETWORKS[networkIndex].chain as Chain,
            transport,
        });
    }

    let addressString = address as Address;

    let abi = [{
        inputs: [{ name: 'tokenId', type: tokenIdType }],
        name: functionName,
        outputs: [{ name: '', type: 'string' }],
        type: 'function',
    }];

    let args = [
        tokenId.toString()
    ]

    let result = await client.readContract({address: addressString, functionName, abi, args});

    return result;
}