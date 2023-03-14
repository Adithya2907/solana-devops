<script>

	import { HoverCard } from "teil-ui";
    export let data;

</script>
<header class="header">
	<a href="/">

		<img class="logo" alt="Solstromm logo" src="/logo.jpeg" />
	</a>
    <HoverCard.Container slot="component">
        <HoverCard.Trigger>
            <div
            class="ImageTrigger"
            target="_blank"
            rel="noreferrer noopener"
            >
                <img
                    class="Image normal"
                    src="https://api.dicebear.com/5.x/adventurer/svg"
                    alt="TeilUI"
                />
            </div>
        </HoverCard.Trigger>
        <HoverCard.Content class="hovercard__content" >
            <div>
            <p class="logged-user">Logged in as <b>{data.info?.login}</b></p>
            <form method="POST" action="?/logout">
                <button class="button logout" type="submit">Logout</button>
            </form>
            <HoverCard.Arrow class="HoverCardArrow" />
            </div>
        </HoverCard.Content>
    </HoverCard.Container>
</header>

<style>
    .hovercard__content {
		border-radius: 6px;
		padding: 20px;
		width: 300px;
		background-color: red !important;
		box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
		animation-duration: 400ms;
		animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
		will-change: transform, opacity;
	}
	.hovercard__content[data-side='top'] {
	animation-name: slideDownAndFade;
	}
	.hovercard__content[data-side='right'] {
	animation-name: slideLeftAndFade;
	}
	.hovercard__content[data-side='bottom'] {
	animation-name: slideUpAndFade;
	}
	.hovercard__content[data-side='left'] {
	animation-name: slideRightAndFade;
	}

	.HoverCardArrow {
	fill: #3b4252;
	}

	.hovercard__content div {
		background: red;
	}

	.ImageTrigger {
		cursor: pointer;
		border-radius: 100%;
		display: inline-block;
		padding: 5px;
		background: #3b4252;
		box-shadow: 0 2px 10px #2e344077;
	}
	.ImageTrigger:focus {
	box-shadow: 0 0 0 2px white;
	}

	.Image {
	display: block;
	border-radius: 100%;
	}
	.Image.normal {
	width: 45px;
	height: 45px;
	}
	.Image.large {
	width: 60px;
	height: 60px;
	}

	.Text {
	margin: 0;
	color: #eceff4;
	font-size: 15px;
	line-height: 1.5;
	}
	.Text.faded {
	color: #4c566a;
	}
	.Text.bold {
	font-weight: 500;
	}
	.popper-content {
	z-index: 99;
	}

	button {
		border: 1px solid var(--solana-accent);
		background: var(--solana-primary);
		color: white;
		padding: 5px;
		border-radius: 5px;
		transition: all 0.3s;
	}

	button:hover {
		cursor: pointer;
		background: var(--solana-accent);
	}

	.logo {
		justify-self: center;
		height: 80px;
		transition: all 0.3s;
	}
	.logo:hover {
		cursor: pointer;
	}

    header {
		padding: 20px;
	}
</style>