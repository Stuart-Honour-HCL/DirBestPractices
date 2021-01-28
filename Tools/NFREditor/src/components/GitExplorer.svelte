<script lang="ts">
    export let currentContents: GitContents;

    import { onMount } from "svelte";
    import moment from "moment";

    import Control from "../control";
    import type GitFile from "../gitFile";
    import GitContents, { ROOT_FOLDER } from "../gitContents";

    onMount(() => {});
</script>

<div id="explorer">
    {#if currentContents && currentContents.type == "dir"}
        <table>
            <thead>
                <tr>
                    <th />
                    <th>Name</th>
                    <th>Info</th>
                </tr>
            </thead>
            <tbody>
                {#if currentContents.path != ROOT_FOLDER}
                    <tr
                        on:click={(x) => {
                            Control.openPath(currentContents.parentPath());
                        }}
                    >
                        <td><i class="fa fa-folder" /></td>
                        <td>...</td>
                        <td>Root</td>
                    </tr>
                {/if}

                {#each currentContents.dirList as d, idx}
                    <tr
                        on:click={(x) => {
                            Control.openPath(currentContents.dirList[idx].path);
                        }}
                    >
                        <td>
                            {#if d.type == "file"}
                                <i class="fa fa-file" />
                            {:else}
                                <i class="fa fa-folder" />
                            {/if}
                        </td>
                        <td>{d.name}</td>
                        <td>{d.type}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {:else}
        Loading...
    {/if}
</div>

<style>
    #explorer {
        width: 80%;
        left: 10%;
        border-style: single;
        border-color: cadetblue;
        border-width: 1px;
        text-align: left;
        position: relative;
    }
    #explorer:hover {
        cursor: default;
       
    }
    #explorer td:hover { 
        color: cadetblue;
    }
    .fa-folder{
        color: #79b8ff;
    }
    .fa-file{
        color: gray;
    }
    table{
        width: 50%;
        left: 25%;
        position: relative;
    }
</style>

