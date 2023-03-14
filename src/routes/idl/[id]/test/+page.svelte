<script lang="ts">
	import type { PageData } from './$types';

	import { onMount } from 'svelte';

	// solana walle related
	import { clusterApiUrl } from '@solana/web3.js';
	import { WalletProvider } from '@svelte-on-solana/wallet-adapter-ui';
	import { AnchorConnectionProvider } from '@svelte-on-solana/wallet-adapter-anchor';
	import { workSpace } from '@svelte-on-solana/wallet-adapter-anchor';
	import { WalletMultiButton } from '@svelte-on-solana/wallet-adapter-ui';
	import { walletStore } from '@svelte-on-solana/wallet-adapter-core';
	import * as web3 from '@solana/web3.js';

	import {
		IdlTypeToString,
		IsMut,
		IsSigner,
		type CustomAccountType,
		type Instruction
	} from '../IDL';

	// IDL file from S3
	export let data: PageData;
	import type { IDL } from '../IDL';

	const network = clusterApiUrl('devnet');

	let idl = data.json;

	// populating the accounts and arguments arrays inside each instruction
	data.json.instructions?.forEach((instruction: Instruction) => {
		if (instruction.accounts.length > 0) {
			const customAccountArray: CustomAccountType[] = [];
			for (let ind = 0; ind < instruction.accounts.length; ind++) {
				const cust: CustomAccountType = {
					value: '',
					keypair: null,
					generateKeypair: false,
					accountType: 0
				};
				customAccountArray.push(cust);
			}
			instruction.accountValues = customAccountArray;
		}
		if (instruction.args.length > 0)
			instruction.argumentvalues = new Array<string>(instruction.args.length);
	});

	// setting up the wallet and anchor
	let wallets;
	const localStorageKey = 'walletAdapter';
	onMount(async () => {
		const { PhantomWalletAdapter, GlowWalletAdapter } = await import(
			'@solana/wallet-adapter-wallets'
		);
		const walletsMap = [new PhantomWalletAdapter(), new GlowWalletAdapter()];
		wallets = walletsMap;
	});

	let anchorSuccess = null;
	let anchorError = null;

	async function makeRpcCall(name: string, instructionIndex: number) {
		instructionResponse = -1;
		anchorSuccess = null;
		anchorError = null;

		const accounts = {};
		const signers = [];

		if (idl.instructions[instructionIndex].accountValues) {
			idl.instructions[instructionIndex].accountValues?.forEach((customAccount, i) => {
				if (idl.instructions[instructionIndex].accountValues[i].generateKeypair) {
					const keypair = web3.Keypair.generate();
					idl.instructions[instructionIndex].accountValues[i].keypair = keypair;
					idl.instructions[instructionIndex].accountValues[i].value = keypair.publicKey;
					accounts[idl.instructions[instructionIndex].accounts[i].name] =
						idl.instructions[instructionIndex].accountValues[i].value;
					if (idl.instructions[0].accounts[i].isSigner) signers.push(keypair);
				} else {
					accounts[idl.instructions[instructionIndex].accounts[i].name] =
						idl.instructions[instructionIndex].accountValues[i].value;
				}
			});
		}

		try {
			if (idl.instructions[instructionIndex].argumentvalues) {
				await $workSpace.program?.rpc[name](...idl.instructions[instructionIndex].argumentvalues, {
					accounts,
					signers
				});
			} else {
				await $workSpace.program?.rpc[name]({
					accounts,
					signers
				});
			}

			anchorSuccess = 'Instruction exeucted successfully!';
		} catch (error) {
			console.log(error);
			anchorError = error;
		}
		instructionResponse = instructionIndex;
	}

	function selectHandler(i: number, ac: number) {
		switch (idl.instructions[i].accountValues[ac].accountType) {
			case 0: {
				idl.instructions[i].accountValues[ac].value = '';
				idl.instructions[i].accountValues[ac].keypair = null;
				idl.instructions[i].accountValues[ac].generateKeypair = false;
				break;
			}
			case 1: {
				const keypair = web3.Keypair.generate();
				idl.instructions[i].accountValues[ac].value = keypair.publicKey;
				idl.instructions[i].accountValues[ac].keypair = keypair;
				idl.instructions[i].accountValues[ac].generateKeypair = true;
				break;
			}
			case 2: {
				idl.instructions[i].accountValues[ac].value = '';
				idl.instructions[i].accountValues[ac].keypair = null;
				idl.instructions[i].accountValues[ac].generateKeypair = false;
				break;
			}
			default:
				break;
		}
	}

	const accountTypes = [
		{ name: 'Public Key', value: 0 },
		{ name: 'Generate Keypair', value: 1 },
		{ name: 'System Program', value: 2 }
	];

	// to keep track of which instruction is being processed
	let instructionResponse = -1;
</script>

<WalletProvider {localStorageKey} {wallets} autoConnect />
<AnchorConnectionProvider {network} {idl} />
<header>
	<WalletMultiButton />
</header>
<div class="postman">
	<div>
		<h1>Instructions Client for you programs</h1>
		{#if $walletStore?.connected}
			{#if idl.instructions}
				{#each idl.instructions as instruction, i}
					<form class="instruction">
						<h2>{instruction.name}</h2>
						<div class="line" />
						<!-- Arguments -->
						<h3>Arguments</h3>
						{#each instruction.args as arg, ar}
							<div class="arg">
								<span class="text-clr-green">{arg.name}</span>
								<span class="bg-text bg--grey">{IdlTypeToString(arg.type)}</span>
								<input bind:value={idl.instructions[i].argumentvalues[ar]} type="text" />
							</div>
						{/each}
						<div class="line" />
						<!-- Accounts -->
						<h3>Accounts</h3>
						{#each instruction.accounts as account, ac}
							<div class="account" style="margin-bottom: 5px">
								<span class="text-clr-green">{account.name}</span>
								<div>
									{#if IsMut(account)}
										<span class="bg-text bg--is-mut">isMut</span>
									{/if}
									{#if IsSigner(account)}
										<span class="bg-text bg--is-signer">isSigner</span>
									{/if}
								</div>
								<input
									placeholder="Enter public key"
									bind:value={idl.instructions[i].accountValues[ac].value}
									type="text"
								/>
								<select
									bind:value={idl.instructions[i].accountValues[ac].accountType}
									on:change={() => selectHandler(i, ac)}
								>
									{#each accountTypes as t}
										<option value={t.value}>{t.name}</option>
									{/each}
								</select>
							</div>
						{/each}
						<div class="line" style="margin-top: 30px" />
						<button on:click={() => makeRpcCall(instruction.name, i)}>Run instruction</button>
						<div class="line" />
						{#if instructionResponse == i}
							<div>
								<h3>Response</h3>
								{#if anchorSuccess}
									<p class="success response">Success!</p>
								{/if}
								{#if anchorError}
									<p class="error response">{anchorError}</p>
								{/if}
							</div>
						{/if}
					</form>
				{/each}
			{:else}
				<p>No instructions found!</p>
			{/if}
		{:else}
			<h2>Please connect to your wallet!</h2>
		{/if}
	</div>
</div>

<style>
	.header {
		text-align: right;
	}

	.postman {
		max-width: 70%;
		margin: 0 auto;
	}

	.instruction {
		background: var(--solana-secondary);
		border-radius: 8px;
		box-shadow: 0 0.75rem 1.5rem rgb(20 24 22 / 50%);
		border-color: #111;
		overflow: hidden;
		margin-bottom: 30px;
		padding: 30px 30px;
	}

	h2 {
		margin-top: 0;
		font-size: 2rem;
		font-weight: bold;
	}

	.arg {
		width: 50%;
		display: grid;
		grid-template-columns: 1fr 0.5fr 6fr;
		gap: 30px;
		margin-bottom: 15px !important;
		justify-content: center;
		align-items: center;
		height: 32px;
	}

	.arg input {
		align-self: stretch;
	}

	.line {
		border-bottom: 3px solid #282d2b;
	}

	.account {
		display: grid;
		grid-template-columns: 1fr 1fr 4fr 0.5fr;
		gap: 10px;
		height: 32px;
		margin-bottom: 15px !important;
	}

	input {
		padding-left: 10px;
		padding-right: 10px;
		border-radius: 8px;
		outline: none;
		border: none;
		background: var(--solana-secondary);
		border: 1px solid #5b5f5d;
		color: white;
		box-shadow: 1px 1px 2px rgb(255 255 255 / 25%);
	}

	select {
		background: var(--solana-secondary);
		border: 1px solid #5b5f5d;
		color: white;
		font-family: 'Rubik', sans-serif;
		border-radius: 10px;
		transition: all 0.3s;
		font-size: 1rem;
		box-shadow: 1px 1px 2px rgb(255 255 255 / 25%);
		padding: 5px;
	}

	select:hover {
		cursor: pointer;
		background: #333b3a;
		border: 1px solid #333b3a;
	}

	option {
		font-size: 1rem;
	}

	button {
		background: var(--solana-accent);
		border: none;
		outline: none;
		padding: 15px;
		color: #1b4e3f;
		border-radius: 8px;
		transition: all 0.3s;
		margin-bottom: 10px;
		margin-top: 10px;
	}

	button:hover {
		background: #19b784;
		color: white;
		cursor: pointer;
	}

	.response {
		background: var(--solana-primary);
		padding: 20px 10px;
		border-radius: 8px;
	}

	.success {
		color: var(--solana-accent);
	}

	.error {
		color: red;
	}

	header {
		display: flex;
		justify-content: flex-end;
		margin: 30px;
	}
</style>
