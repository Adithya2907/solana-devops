<script lang="ts">
	import { page } from '$app/stores';

	export let href: string;

	$: active = $page.url.pathname === href;
</script>

<li class="navel">
	<a {href} class:active>
		<slot />
	</a>
</li>

<style>
	li {
		display: block;
		width: 100%;
		height: 40px;
	}

	a {
		display: flex;
		width: 100%;
		height: 100%;
		padding: 0 25px;
		color: var(--gray-2);
		align-items: center;
		border-radius: 5px;
	}

	a:hover,
	a.active {
		text-decoration: none;
		color: var(--white);
		background: var(--color-bg-1);
	}
</style>
