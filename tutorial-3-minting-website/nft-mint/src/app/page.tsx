'use client'

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import { web3config } from "../dapp.config";
import { Address } from "viem";
import { nftManagerAbi } from "../contracts-generated";
import { useState } from "react";
import { formatEther } from "viem";
import { writeContract, waitForTransactionReceipt, readContract } from "wagmi/actions";
import { wagmiConfig } from "@/wagmi";
import Link from "next/link";

enum MintState {
  IDLE,
  WAIT_TO_CONFIRM_TRANSACTION,
  WAITING_FOR_TRANSACTION_RECEIPT,
  TRANSACTION_CONFIRMED,
  TRANSACTION_ERROR
}

function MintNFT() {
  const {address} = useAccount();
  const [mintState, setMintState] = useState(MintState.IDLE);
  const [error, setError] = useState('');
  const [mintedId, setMintedId] = useState('');
  const [mintedTokenURI, setMintedTokenURI] = useState('');

  const {data: price, isLoading: isLoadingPrice, isError: isErrorPrice, error: errorPrice} = useReadContract({
    address: web3config.contractAddress as Address,
    abi: nftManagerAbi,
    functionName: 'PRICE'
  });

  const mint = async () => {
    setMintState(MintState.WAIT_TO_CONFIRM_TRANSACTION);

    try {  
      const mintPriceInWei = price;

      // 1 - call safeMint
      let tx = await writeContract(wagmiConfig, {
          address: web3config.contractAddress as Address,
          abi: nftManagerAbi,
          functionName: "safeMint",
          args: [address as Address],
          value: mintPriceInWei,
      });

      setMintState(MintState.WAITING_FOR_TRANSACTION_RECEIPT);

      // 2 - wait for transaction receipt
      let receipt = await waitForTransactionReceipt(wagmiConfig, {
          hash: tx
      });

      // 3 - get minted ID
      const mintedID = BigInt(receipt?.logs[0]?.topics[3] as string);
      setMintedId(mintedID.toString());

      // 4 - get token URI
      const tokenURI = await readContract(wagmiConfig, {
        address: web3config.contractAddress as Address,
        abi: nftManagerAbi,
        functionName: "tokenURI",
        args: [mintedID]
      });

      setMintedTokenURI(tokenURI);

      setMintState(MintState.TRANSACTION_CONFIRMED);
    } catch (error) {
      setMintState(MintState.TRANSACTION_ERROR);
      setError(error?.toString() ?? 'Unknown error');
    }
  }

  function formatTokenURI(tokenURI: string) {
    const json = JSON.parse(atob(tokenURI.split(',')[1]));
    delete json.image;
    return JSON.stringify(json, null, 2);
  }

  function getImageURL(mintedTokenURI: string): string | undefined {
    const json = JSON.parse(atob(mintedTokenURI.split(',')[1]));
    return json.image;
  }

  return (
    <div>
      {isLoadingPrice && <p>Loading price...</p>}
      {isErrorPrice && <span>Error: {errorPrice.message}</span>}
      {price &&
        <div className="flex flex-col items-center">
          <p>Minting from contract address: {web3config.contractAddress}</p>
          <div className="flex flex-col items-center mt-4 font-bold">
            {(mintState === MintState.IDLE || mintState === MintState.TRANSACTION_CONFIRMED) &&
                <button onClick={mint} className="bg-[#C2410C] text-white px-4 py-2 rounded-lg">Mint for {formatEther(price)} ETH</button>
            }
            {mintState === MintState.WAIT_TO_CONFIRM_TRANSACTION &&
              <p>Please confirm the transaction from your wallet...</p>
            }
            {mintState === MintState.WAITING_FOR_TRANSACTION_RECEIPT &&
              <p>Waiting for transaction receipt...</p>
            }
            {mintState === MintState.TRANSACTION_CONFIRMED &&
              <div className="flex flex-col items-center justify-center mt-4 font-bold text-green-500">
                <p>Transaction confirmed!</p>
                <p>Minted ID: {mintedId}</p>
                <img className="m-4 w-[256px] h-[256px] border-2 rounded-lg border-gray-500 p-4" src={getImageURL(mintedTokenURI)} alt="NFT" />
                <pre className="m-4 text-sm whitespace-break-spaces break-all border-2 rounded-lg border-gray-500 p-4" >Token URI: <br/>{formatTokenURI(mintedTokenURI)}</pre>
              </div>
            }
            {mintState === MintState.TRANSACTION_ERROR &&
              <div>
                <p className="text-red-500">Transaction failed!</p>
                <pre className="text-red-500">{error}</pre>
              </div>
            }
          </div>          
        </div>
      }
    </div>
  );
}

function ShowMyButton() {
  return (
    <Link href='/my-tokens'>
      <button className="bg-[#C2410C] font-bold text-white px-4 py-2 rounded-lg">View My Tokens</button>
    </Link>
  );
}

export default function Home() {
  const {address, isConnected} = useAccount();

  return (
    <main className="mt-10 flex flex-col gap-8 items-center justify-center ">
      <h1>SVG NFT Minting Website</h1>

      <ConnectButton label="Connect Wallet to Mint" />

      {isConnected && <ShowMyButton />}
      {isConnected && <MintNFT />}
    </main>
  );
}
