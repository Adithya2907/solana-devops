<script lang='ts'>
    import Header from '$lib/components/header.svelte';
    import NavBar from '$lib/components/navbar.svelte';

    export let data;
</script>

<div class="page">
    <Header user={data.info?.login ?? ''}></Header>
    <div class="main">
        <NavBar></NavBar>
        <slot></slot>
    </div>
</div>

<style>
    .page {
        display: flex;
        flex-direction: column;
        height: 100vh;
    }

    .main {
        display: flex;
        height:  100%;
    }
</style>