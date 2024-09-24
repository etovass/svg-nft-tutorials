import { Chain, Client, HttpTransport, PublicClient, createPublicClient, defineChain, http } from 'viem'
import { mainnet, goerli, sepolia, optimism, optimismGoerli, optimismSepolia, base, baseSepolia } from 'viem/chains';
import { Address} from 'abitype';

export const CUSTOM_NETWORK_ID = "custom";

export const NETWORKS = [
    {id: "eth-mainnet", label: "Ethereum Mainnet", chain: mainnet},
    {id: "eth-sepolia", label: "Ethereum Sepolia", chain: sepolia},
    {id: "opt-mainnet", label: "Optimism Mainnet", chain: optimism},
    {id: "opt-sepolia", label: "Optimism Sepolia", chain: optimismSepolia},
    {id: "base-mainnet", label: "Base Mainnet", chain: base},
    {id: "base-sepolia", label: "Base Sepolia", chain: baseSepolia},
    {id: CUSTOM_NETWORK_ID, label: "Custom", chain: null},
];

function findNetworkIndexById(networkId: string) {
    for (let i = 0; i < NETWORKS.length; i++) {
       if (NETWORKS[i].id == networkId) return i;
    }
    
    throw "Invalid network id: " + networkId;
}

export async function readContract(networkId: string, address: string, functionName: string, tokenId: number, tokenIdType: string, customNodeUrl: string, secondParamValue?: string, secondParamType?: string) {
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

        if (process.env.NEXT_PUBLIC_ALCHEMY_API_KEY) {
            transport = http(`https://${NETWORKS[networkIndex].id}.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`);
        } else {
            console.warn("ALCHEMY_API_KEY is not set, using default cloudflare public nodes, which are limited and will return errors in some contracts")
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
    ];

    if (secondParamValue) {
        abi[0].inputs.push({ name: '_seed', type: (secondParamType || "uint256") });
        args.push(secondParamValue);
    }

    let result = await client.readContract({address: addressString, functionName, abi, args});

    return result;
}