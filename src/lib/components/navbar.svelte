<script lang='ts'>
    import NavEl from './navel.svelte';
</script>

<nav>
    <ul>
        <NavEl href="/app">Dashboard</NavEl>
        <NavEl href="/">Overview</NavEl>
        <NavEl href="/">Overview</NavEl>
        <NavEl href="/">Members</NavEl>
        <NavEl href="/">Settings</NavEl>
    </ul>
</nav>

<style>
    nav {
        display: flex;
        flex-direction: column;
        border-right: 1px solid var(--line-color);
        padding: 50px 10px;
        width: 360px;
        gap: 10px;
        height: 100%;
    }

    ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }
</style>