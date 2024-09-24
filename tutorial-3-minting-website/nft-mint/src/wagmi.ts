import '@rainbow-me/rainbowkit/styles.css';

import { fallback, http } from 'wagmi';
import { sepolia }  from 'wagmi/chains';
import { web3config } from './dapp.config';
import { darkTheme, getDefaultConfig } from '@rainbow-me/rainbowkit';

export const wagmiConfig = getDefaultConfig({
    appName: 'My NFT Minting App',
    projectId: 'YOUR_WALLET_CONNECT_PROJECT_ID',
    chains: [sepolia],
    transports: {
        [sepolia.id]: fallback([
            http(`https://eth-sepolia.g.alchemy.com/v2/${web3config.alchemyApiKey}`),
        ])
    
    },
    ssr: true
});

export const myRainbowTheme = darkTheme({
    accentColor: '#C2410C',
    accentColorForeground: 'white',
    borderRadius: 'large'
});
