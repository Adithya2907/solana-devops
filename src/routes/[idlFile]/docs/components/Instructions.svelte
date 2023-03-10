<script lang="ts">
	import { IdlTypeToString, IsMut, IsSigner, type IDL } from '../IDL';
	export let idl: IDL;
</script>

<div class="grid grid--3-cols">
	<div class="grid-header">
		<div>
			<h2 class="name">Name</h2>
		</div>
		<div>
			<h2>Arguements</h2>
		</div>
		<div>
			<h2>Accounts</h2>
		</div>
	</div>
	{#if idl.instructions}
		{#each idl.instructions as i}
			<h2>{i.name}</h2>
			<div class="args">
				{#each i.args as arg}
					<div class="arg">
						<span>{arg.name}</span>
						<span class="bg-text bg--grey">{IdlTypeToString(arg.type)}</span>
					</div>
				{/each}
			</div>
			<div class="accounts">
				{#each i.accounts as account}
					<div class="account" style="margin-bottom: 5px">
						<span class="text-clr-green">{account.name}</span>
						{#if IsMut(account)}
							<span class="bg-text bg--is-mut">isMut</span>
						{/if}
						{#if IsSigner(account)}
							<span class="bg-text bg--is-signer">isSigner</span>
						{/if}
					</div>
				{/each}
			</div>
			<div class="line" />
		{/each}
	{:else}
		<h2 class="text-center grid-span">There's nothing here!</h2>
	{/if}
</div>
