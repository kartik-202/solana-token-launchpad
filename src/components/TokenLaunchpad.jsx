import { clusterApiUrl, Keypair, SystemProgram, Transaction } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccount, createAssociatedTokenAccountInstruction, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, createMint, createMintToInstruction, ExtensionType, getAssociatedTokenAddressSync, getMinimumBalanceForRentExemptMint, getMintLen, LENGTH_SIZE, MINT_SIZE, TOKEN_2022_PROGRAM_ID, TYPE_SIZE } from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { createInitializeInstruction,pack } from '@solana/spl-token-metadata';


export function TokenLaunchpad() {


        const wallet=useWallet();
        const {connection}=useConnection();
        const mintkeypair=Keypair.generate();

    async function createToken(){
        const metadata = {
            mint:mintkeypair.publicKey,
            name: document.getElementsByClassName("name")[0].value,
            symbol: document.getElementsByClassName("symbol")[0].value,
            image: document.getElementsByClassName("image")[0].value,
            supply: document.getElementsByClassName("supply")[0].value,
            uri: 'https://cdn.100xdevs.com/metadata.json',
            additionalMetadata: [],
        };
        
        const mintLen = getMintLen([ExtensionType.MetadataPointer]);
        const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
   
        const lamports = await connection.getMinimumBalanceForRentExemption(mintLen+metadataLen);
       
        
        const transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: wallet.publicKey,
                newAccountPubkey: mintkeypair.publicKey,
                space: MINT_SIZE,
                lamports,
                programId:TOKEN_2022_PROGRAM_ID,
            }),
          
            createInitializeMetadataPointerInstruction(   mintkeypair.publicKey,wallet.publicKey,mintkeypair.publicKey,TOKEN_2022_PROGRAM_ID),
            createInitializeInstruction({
                programId:TOKEN_2022_PROGRAM_ID,
                metadata:mintkeypair.publicKey, 
                updateAuthority:wallet.publicKey, 
                mint:mintkeypair.publicKey, 
                mintAuthority:wallet.publicKey, 
                name:metadata.name, 
                symbol:metadata.symbol, 
                uri:metadata.uri,
            }),
            createInitializeMintInstruction(mintkeypair.publicKey, 9, wallet.publicKey, wallet.publicKey, TOKEN_2022_PROGRAM_ID),
        
        );

        transaction.feePayer=wallet.publicKey;
        transaction.recentBlockhash=(await connection.getLatestBlockhash()).blockhash;
        transaction.partialSign(mintkeypair);


        await wallet.sendTransaction(transaction,connection);

        console.log(`Token mint created at ${mintkeypair.publicKey.toBase58()}`);

        const associatedToken=getAssociatedTokenAddressSync(
        mintkeypair.publicKey,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
        )

        const transaction2=new transaction().add(
            createAssociatedTokenAccountInstruction(
                wallet.publicKey,
                associatedToken,
                wallet.publicKey,
                mintkeypair.publicKey,
                TOKEN_2022_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID,
            )
        )
        await wallet.sendTransaction(transaction2,connection);
        
        const transaction3=new transaction().add(
            createMintToInstruction(mintkeypair.publicKey, associatedToken, wallet.publicKey, 1000000000, [], TOKEN_2022_PROGRAM_ID)
        )
        await wallet.sendTransaction(transaction3,connection);
        console.log(`token minted`);
    }
    
    return  <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
    }}>
        <h1>Solana Token Launchpad</h1>
        <input className='name' type='text' placeholder='Name'></input> <br />
        <input className='symbol' type='text' placeholder='Symbol'></input> <br />
        <input className='image' type='text' placeholder='Image URL'></input> <br />
        <input className='supply' type='text' placeholder='Initial Supply'></input> <br />
        <input className='URI' type='text' placeholder='uri'></input> <br />
        <button className='btn' onClick={createToken}>Create a token</button>
    </div>
}