import './App.css'
import { TokenLaunchpad } from './components/TokenLaunchpad'
import { ConnectionProvider, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl, Keypair, SystemProgram, Transaction } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';
import { createMint } from '@solana/spl-token';

function App() {

  return (
    <ConnectionProvider endpoint={"https://api.devnet.solana.com"}>
    <WalletProvider wallets={[]} autoConnect>
    <WalletModalProvider>
    <div style={{
      display:'flex',
      justifyContent:'space-between',
      padding:20
    }
    }>
      <WalletMultiButton />
      <WalletDisconnectButton />
    </div>

    <TokenLaunchpad></TokenLaunchpad>
    
    
    </WalletModalProvider>
    </WalletProvider>
    </ConnectionProvider>
  )
}

export default App
