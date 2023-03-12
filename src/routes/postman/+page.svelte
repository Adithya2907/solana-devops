<script lang="ts">
     import { onMount } from 'svelte';
     import { clusterApiUrl } from '@solana/web3.js';
    import { WalletProvider } from '@svelte-on-solana/wallet-adapter-ui';
    import { AnchorConnectionProvider } from '@svelte-on-solana/wallet-adapter-anchor';
    import { workSpace } from '@svelte-on-solana/wallet-adapter-anchor';

    const network = clusterApiUrl('devnet');
    import idl from './counter.json';

    import { WalletMultiButton } from '@svelte-on-solana/wallet-adapter-ui';
  import { walletStore } from '@svelte-on-solana/wallet-adapter-core';
	import * as web3 from '@solana/web3.js';


    let wallets;
    const localStorageKey = 'walletAdapter';
    onMount(async () => {
        const {
        PhantomWalletAdapter,
        GlowWalletAdapter,
        } = await import('@solana/wallet-adapter-wallets');
        const walletsMap = [
        new PhantomWalletAdapter(),
        new GlowWalletAdapter()
        ];
        wallets = walletsMap;
  });



  async function sendTweet() {
    const tweetAccount = web3.Keypair.generate();
    console.log(tweetAccount.publicKey.toString())

    try {
        console.log($walletStore.publicKey?.toString())
        console.log("sending");
        await $workSpace.program?.rpc.sendTweet("abc", "abc", {
            accounts: {
                author: $walletStore.publicKey?.toString(),
                tweet: tweetAccount.publicKey,
                systemProgram: $workSpace.systemProgram?.programId,
            },
            signers: [tweetAccount],
        })
        console.log("GG boiszz");
    } catch (error) {
        console.log("Error", error);
    }
  }

  async function deleteTweet() {
    console.log("Trying to delete");
    try {
        await $workSpace.program?.rpc.deleteTweet({
            accounts: {
                tweet: new web3.PublicKey("DgpsiDWFKJMh6hjk1SPFww5GwG92kmKRaH78WRwiMmT"),
                author: $walletStore.publicKey,
            }
        })
        console.log("GG Boiszz");
    } catch (error) {
        console.log("Error", error);
    }
  }

  async function createCounter() {
    console.log("Creating counter");
    try {
        await $workSpace.program?.rpc.create({
            accounts: {
                baseAccount: $workSpace.baseAccount.publicKey,
                user: $walletStore.publicKey,
                systemProgram: $workSpace.systemProgram.programId,
            },
            signers: [$workSpace.baseAccount]
        })
        console.log("Gg boisszz");
    } catch (error) {
        console.log("Error", error);
    }
  }

  async function increment() {
    console.log("Incrementing");
    try {
        await $workSpace.program?.rpc.increment({
            accounts: {

                baseAccount: $workSpace.baseAccount.publicKey,
            }
        })
        console.log("Gg boizzz");
    }catch(e) {
        console.log("Error", e);
    }
  }
</script>

<WalletProvider {localStorageKey} {wallets} autoConnect />
<AnchorConnectionProvider {network} {idl} />
<div>
    <WalletMultiButton/>
    {#if $walletStore?.connected}
    <p class="warning">You are connected to DevNet!</p>
    <button on:click={sendTweet}>Send Tweet</button>
    <button on:click={deleteTweet}>Delete Tweet</button>
    <button on:click={createCounter}>Create counter</button>
    <button on:click={increment}>Increment</button>
    {:else}
    <p class="warning">You are not connected...</p>
    {/if}
</div>