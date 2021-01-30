<script lang="ts">
    export let currentContents: GitContents;

    import { onMount } from "svelte";
    import moment from "moment";

    import Control from "../control";
    import type GitFile from "../gitFile";
    import GitContents, { ROOT_FOLDER } from "../gitContents";
    import Debug from "../debug";
    import APIHelper from "../api";

    onMount(() => {});

    function openNewFileDialog() {
        Debug.log("Showing popup");
        Control.showPopup(
            "New file name (.html)",
            true,
            true,
            true,
            function (button, input) {
                Debug.log("Closed popup with:", button, input);
                if (button == "Cancel") {
                    return;
                }
                if (!input) {
                    Control.showInfolog("File name can't be blank");
                } else {
                    let fullName: string = input;
                    if (!fullName.toLowerCase().endsWith(".html")) {
                        fullName = `${fullName}.html`;
                    }
                    APIHelper.createNewFile(
                        `${currentContents.path}/${fullName}`
                    )
                        .then((file) => {
                            Control.showInfolog(
                                "New file created: " + file.path
                            );
                            currentContents.dirList.push(file);
                            currentContents.dirList = currentContents.dirList;
                        })
                        .catch((reason) => {
                            Control.showInfolog(
                                "ERROR creating new file: " + reason
                            );
                        });
                }
            }
        );
    }

    function openParentPath(idx: number) {
        let parts = currentContents.pathComponents();
        let fullPath = parts[0];
        for (let i = 1; i <= idx; ++i) {
            fullPath += "/" + parts[i];
        }

        Debug.log("Opening path:", fullPath);
        Control.openPath(fullPath);
    }
</script>

<div id="explorer">
    {#if currentContents && currentContents.type == "dir"}
        <div id="explorerControls">
            <div id="expButtons">
                {#if currentContents.depthLevel() >= 2}
                    <button class="customButton" on:click={openNewFileDialog}>New file</button>
                {/if}
            </div>
            <div id="explorerPath">
                {#each currentContents.pathComponents() as c, idx}
                    /<span
                        class="patchComponent"
                        on:click={(x) => {
                            openParentPath(idx);
                        }}>{c}</span
                    >
                {/each}
            </div>
        </div>
        <table>
            <thead>
                <tr>
                    <th />
                    <th>Name</th>
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
    .fa-folder {
        color: #79b8ff;
    }
    .fa-file {
        color: gray;
    }
    table {
        width: 60%;
        left: 20%;
        position: relative;
    }
    table td:nth-child(1) {
        width: 50px;
    }

    #explorerControls {
        width: 70%;
        left: 20%;
        position: relative;
        min-height: 50px;
        font-size: 14px;
    }

    #expButtons {
        height: 32px;
        padding-bottom: 5px;
    }

    .patchComponent:hover {
        text-decoration: underline;
    }
</style>
