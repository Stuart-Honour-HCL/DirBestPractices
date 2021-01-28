<script lang="ts">
import { onMount } from "svelte";
import moment from "moment";

    import Control from "../control";
    export let message: string;
    let time: Date;

    onMount(()=>{
        time = new Date();
    });

</script>

<div id="infolog">
    {#if time && message}
    <div id="infoMessage">[{moment(time).format("hh:mm:ss")}] {message}</div>
    {/if}
</div>

<style>
    #infolog {       
        position: absolute;
        right: 0px;
        width: 25%; 
        border-style: double;
        border-color: darkgray;
        border-width: 3px;
        z-index: 1000;
        background-color: black;
        color:blanchedalmond;
    }
    
</style>
