'use client'

import { nftManagerAbi } from "@/contracts-generated";
import { web3config } from "@/dapp.config";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Address } from "viem";
import { useAccount, useReadContract } from "wagmi";

function getImageURL(mintedTokenURI: string): string | undefined {
  const json = JSON.parse(atob(mintedTokenURI.split(',')[1]));
  return json.image;
}

function GetTokenURI({address, tokenId }: { address: string, tokenId: number }) {
  const {data: tokenURI, isLoading: isLoadingTokenURI, isError: isErrorTokenURI, error: errorTokenURI} = useReadContract({
    address: web3config.contractAddress as Address,
    abi: nftManagerAbi,
    functionName: "tokenURI",
    args: [BigInt(tokenId)]
  })

  if (isLoadingTokenURI) return <div>Loading...</div>;
  if (isErrorTokenURI) return <div>Error: {errorTokenURI?.message}</div>;

  return <div className="w-[128px] h-[128px] flex flex-col items-center p-4 border-2 border-gray-300 rounded-lg"><img src={getImageURL(tokenURI as string)} /></div>;
}

function GetAndShowToken({address, tokenNumber }: { address: string, tokenNumber: number }) {
  const {data: tokenId, isLoading: isLoadingToken, isError: isErrorToken, error: errorToken} = useReadContract({
    address: web3config.contractAddress as Address,
    abi: nftManagerAbi,
    functionName: "tokenOfOwnerByIndex",
    args: [address as Address, BigInt(tokenNumber)]
  })

  if (isLoadingToken) return <div>Loading...</div>;
  if (isErrorToken) return <div>Error: {errorToken?.message}</div>;

  return (
    <div>
        <GetTokenURI address={address} tokenId={Number(tokenId)} />
    </div>
  )
}

function VisualizeMyTokens({address, balance}: {address: string, balance: number}) {
  let tokens = [];

  for (let i = 0; i < balance; i++) {
    tokens.push(<GetAndShowToken address={address} tokenNumber={i} />);
  }
  
  return (
    <div className="flex flex-row flex-wrap items-center justify-center gap-4">
        {tokens}
    </div>
  );
}

function ShowMyTokens({address}: {address: string}) {
  const {data: tokens, isLoading: isLoadingTokens, isError: isErrorTokens, error: errorTokens} = useReadContract({
    address: web3config.contractAddress as Address,
    abi: nftManagerAbi,
    functionName: "balanceOf",
    args: [address as Address]
  })

  if (isLoadingTokens) return <div>Loading...</div>;
  if (isErrorTokens) return <div>Error: {errorTokens?.message}</div>;

  return (
    <div className="flex flex-col items-center justify-center gap-4">
        <h1>My Tokens: {tokens?.toString()}</h1>
        <VisualizeMyTokens address={address} balance={Number(tokens)} />
    </div>
  );
}

export default function MyTokens() {
  const {isConnected, address} = useAccount();

  return (
    <main className="mt-10 flex flex-col gap-8 items-center justify-center ">
      <ConnectButton label="Connect Wallet to view your tokens" />

      {isConnected && <ShowMyTokens address={address as string} />}
    </main>
  );
}
  
  