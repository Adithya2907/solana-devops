<script lang="ts">
	import { DropdownMenu } from 'teil-ui';

	export let user: string;
</script>

<header>
	<div class="breadcrumb">
		<img class="logo" src="/solstromm.png" alt="Solstromm Logo" />
		<p>/</p>
		<p>{user}</p>
	</div>
	<div class="info">
		<p>Documentation</p>
		<p>Support</p>
		<i class="fa-regular fa-bell fa-lg" />
		<DropdownMenu.Container>
			<DropdownMenu.Trigger class="dropdown__trigger">
				<img
					class="avatar"
					src="https://api.dicebear.com/6.x/identicon/svg?seed=Bubba&radius=50&rowColor=00897b&backgroundColor=b6e3f4"
					alt="User Avatar"
				/>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="dropdown__content">
				<DropdownMenu.Arrow class="dropdown__arrow"></DropdownMenu.Arrow>
				<p>Settings</p>
				<form method="POST" action="/app/?/logout">
					<button type="submit" class="logout">Logout</button>
				</form>
			</DropdownMenu.Content>
		</DropdownMenu.Container>
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
		padding: 10px;
		gap: 5px;
		height: 60px;
		border-bottom: 1px solid var(--line-color);
	}

	.logo,
	.avatar {
		width: 25px;
		height: 25px;
	}

	.breadcrumb,
	.info {
		display: flex;
		align-items: center;
		padding: 0;
		gap: 10px;
	}

	.info {
		gap: 20px;
	}

	p {
		font-weight: 200;
		padding: 0;
		margin: 0;
	}

	.avatar {
		cursor: pointer;
	}

	:global(.dropdown__trigger), .logout {
		background: transparent;
		outline: none;
		border: none;
	}

	:global(.dropdown__arrow) {
		fill: var(--color-bg-1);
	}

	:global(.dropdown__content) {
		background: var(--color-bg-1);
		padding: 10px 25px;
		display: flex;
		flex-direction: column;
	}

	.logout {
		cursor: pointer;
		color: var(--white);
	}
</style>
