<script lang="ts">
	import type { ProjectDeploy, ListenerInfo } from '$lib/types/data';

	import BranchIcon from '~icons/ri/git-branch-line';
	import CommitIcon from '~icons/ri/git-commit-fill';
	import TagIcon from '~icons/ri/input-method-line';
	import VersionIcon from '~icons/ri/price-tag-3-line';

    import Frame from './frame.svelte';
    import Status from './status.svelte';
    import Button from './button.svelte';

    export let deploy: ProjectDeploy;
    export let listener: ListenerInfo;
    export let repo: string;
    export let user: string;
    export let message: string;
</script>

<Frame>
    <div class="container">
        <div class="main">
            <h2 class="title">{deploy.project}</h2>
            <h5 class="subtitle">{repo}</h5>
            <h5 class="subtitle">Build #<span class="issue">{deploy.id}</span></h5>
        </div>
        <div class="info production">
            <div class="multiline">
                <h5>Environment</h5>
                <p>Production</p>
            </div>
            <div class="multicol">
                <div class="multiline">
                    <h5>Status</h5>
                    <Status status={deploy.status} />
                </div>
                <div class="multiline">
                    <h5>created</h5>
                    <p>{deploy.time} by <span class="author">{user}</span></p>
                </div>
            </div>
            <div class="multicol">
                <div class="multiline">
                    <h5>source</h5>
                    <div class="iconline">
                        <BranchIcon />
                        <span>{listener.branch}</span>
                    </div>
                    <div class="iconline">
                        <CommitIcon />
                        <span
                            >{message}
                            (<a
                                href="https://github.com/{repo}/tree/{deploy.commit}">{deploy.commit}</a
                            >)</span
                        >
                    </div>
                </div>
                <div class="multiline">
                    <h5>TAG</h5>
                    <div class="iconline">
                        <TagIcon />
                        <span>prod</span>
                    </div>
                    <div class="iconline">
                        <VersionIcon />
                        <span>0.21.6</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="actions">
            <Button style="outline">View on GitHub</Button>
            <Button style="outline">Rebuild</Button>
            <Button style="outline">Deploy</Button>
            <Button style="outline">Rollback to build</Button>
        </div>
    </div>
</Frame>

<style>
    .container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px;
        height: 350px;
    }

    .main {
        display: flex;
        flex-direction: column;
        align-items: start;
        padding: 10px;
        gap: 10px;
    }

    .main .title {
        font-size: 30px;
        font-weight: bold;
        color: var(--white);
        text-transform: capitalize;
        margin: 0;
    }

    .main .subtitle {
        font-size: 22px;
        font-weight: 300;
        color: var(--gray-2);
        margin: 0;
    }

    .main .subtitle .issue {
        color: var(--white);
    }

    .actions {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 10px;
        gap: 10px;
    }

    :global(.actions > button) {
        width: 100%;
        justify-content: center;
    }
</style>