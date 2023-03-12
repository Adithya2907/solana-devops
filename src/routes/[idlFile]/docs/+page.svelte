<script lang="ts">
	import '../../styles.css';
	export let data;
	import type { IDL } from '../IDL';
	import { Tabs } from 'teil-ui';
	let error = false;

	let idl: IDL;
	if (data.idlJson == 'ERROR') {
		error = true;
	} else {
		idl = JSON.parse(data.idlJson);
	}
	import Instructions from './components/Instructions.svelte';
	import Accounts from './components/Accounts.svelte';
	import Types from './components/Types.svelte';
	import Errors from './components/Errors.svelte';
	import Constants from './components/Constants.svelte';
	import Events from './components/Events.svelte';
</script>

<main>
	<a href="/">Go back</a>
	{#if error}
		<h1>An error occured!</h1>
	{:else}
		<h1>IDL API Docs</h1>
		<h3 class="idl-name text-center">{idl.name}</h3>

		<Tabs.Container class="tabs__container" value="1" slot="component">
			<Tabs.List class="tabs__list">
				<Tabs.Trigger value="1" class="tabs__trigger">Instructions</Tabs.Trigger>
				<Tabs.Trigger value="2" class="tabs__trigger">Accounts</Tabs.Trigger>
				<Tabs.Trigger value="3" class="tabs__trigger">Types</Tabs.Trigger>
				<Tabs.Trigger value="4" class="tabs__trigger">Errors</Tabs.Trigger>
				<Tabs.Trigger value="5" class="tabs__trigger">Constants</Tabs.Trigger>
				<Tabs.Trigger value="6" class="tabs__trigger">Events</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="1" class="tabs__content">
				<Instructions {idl} />
			</Tabs.Content>
			<Tabs.Content value="2" class="tabs__content"><Accounts {idl} /></Tabs.Content>
			<Tabs.Content value="3" class="tabs__content"><Types {idl} /></Tabs.Content>
			<Tabs.Content value="4" class="tabs__content"><Errors {idl} /></Tabs.Content>
			<Tabs.Content value="5" class="tabs__content">
				<Constants {idl} />
			</Tabs.Content>
			<Tabs.Content value="6" class="tabs__content"><Events {idl} /></Tabs.Content>
		</Tabs.Container>
	{/if}
</main>

<style>
	.idl-name {
		padding-bottom: 30px;
		border-bottom: 1px solid #282d2b;
	}
</style>
