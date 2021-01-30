<script lang="ts">
    export let currentFile: GitFile;
    export let unsavedChanges: boolean = false;
    let editor: Jodit.IJodit;
    let title: string;
    let tagString: string;
    let titleHTML: string;
    let tags: string[];

    let bestPracticeEntry: BestPracticeEntry;

    import APIHelper from "../api";
    import { onMount } from "svelte";
    import Jodit from "jodit";
    import GitFile from "../gitFile";
    import BestPracticeEntry from "../bestPracticeEntry";
    import SurveyQuestion from "../surveyQuestion";
    import Control from "../control";
    import Debug from "../debug";

    onMount(() => {
        readDataFromFile(currentFile);
        window.onbeforeunload = function (event) {
            if (unsavedChanges) {
                event.returnValue =
                    "Page contains unsaved changes. Are you sure you want to close?";
            }
        };
    });

    function readDataFromFile(file: GitFile) {
        Debug.log("TextEdit - readDataFromFile - Loading: " + file.path);
        Debug.log(file.content);

        bestPracticeEntry = new BestPracticeEntry(atob(file.content));
        tagString = bestPracticeEntry.tags.join(",");
        titleHTML = htmlDecode(bestPracticeEntry.titleHTML);
        setTimeout(function () {
            initJodit();
        }, 1);
    }

    function initJodit() {
        Debug.log("initJodit");
        if (!editor) {
            editor = new Jodit.Jodit(document.getElementById("editor"), {
                uploader: {
                    insertImageAsBase64URI: true,
                },

                extraButtons: [
                    {
                        name: "insertDate",
                        icon: "save",
                        tooltip: "Save and commit",
                        exec: function (editor) {
                            //editor.s.insertHTML(new Date().toDateString());
                            console.log(editor.value);
                            saveAndCommit();
                        },
                    },
                ],
                "beautify-html": true,
            });
        }
        editor.value = bestPracticeEntry.descriptionHTML;
        editor.events.on("change", () => (unsavedChanges = true));
    }

    /**
     * Called when user presses SAVE button in Jodit (description html editor)
     */
    function saveAndCommit() {
        bestPracticeEntry.descriptionHTML = editor.value;
        bestPracticeEntry.titleHTML = titleHTML;
        bestPracticeEntry.tags = tagString.split(",");

        bestPracticeEntry.generateHTML().then((html) => {
            //@ts-ignore
            html = html_beautify(html, {
                indent_size: 2,
                space_in_empty_paren: true,
            });

            currentFile.content = html;

            APIHelper.writeFile(currentFile).then((file) => {
                Debug.log("File committed");
                Control.showInfolog("File saved and committed");
                currentFile.sha = file.sha;
                unsavedChanges = false;
            });
        });
    }

    function newSurveyQuestion() {
        bestPracticeEntry.surveyQuestions.push(new SurveyQuestion());
        bestPracticeEntry.surveyQuestions = bestPracticeEntry.surveyQuestions;
        unsavedChanges = true;
    }

    function deleteQuestion(idx: number) {
        bestPracticeEntry.surveyQuestions.splice(idx, 1);
        bestPracticeEntry.surveyQuestions = bestPracticeEntry.surveyQuestions;
        unsavedChanges = true;
    }
    function htmlDecode(input) {
        var doc = new DOMParser().parseFromString(input, "text/html");
        return doc.documentElement.textContent;
    }
</script>

<div id="bpEntryEditor">
    {#if bestPracticeEntry}
        <div id="bpEntryControls">
            <div id="editorback">
                <i
                    on:click={(x) => {
                        Debug.log(
                            "Go back - unsaved Changes: ",
                            unsavedChanges
                        );
                        if (unsavedChanges) {
                            Control.showPopup(
                                "There are unsaved changes. Go back and discard changes?",
                                true,
                                true,
                                false,
                                function (button) {
                                    switch (button) {
                                        case "OK":
                                            Control.openPath(
                                                GitFile.parentPath(currentFile),
                                                true
                                            );
                                            break;
                                    }
                                }
                            );
                        } else {
                            Control.openPath(
                                GitFile.parentPath(currentFile),
                                true
                            );
                        }
                    }}
                    class="fa fa-arrow-circle-left"
                />
                {#if unsavedChanges}
                    <i
                        id="saveButton"
                        on:click={(x) => {
                            saveAndCommit();
                        }}
                        class="fa fa-save"
                    />{/if}
            </div>
        </div>

        <div class="bestPracticeProperties">
            <label for="txtTitle">Title</label>
            <input
                id="txtTitle"
                bind:value={titleHTML}
                on:change={() => (unsavedChanges = true)}
            />
        </div>
        <div class="bestPracticeProperties">
            <label for="txtTags">Tags</label>
            <input
                id="txtTags"
                bind:value={tagString}
                on:change={() => (unsavedChanges = true)}
            />
        </div>

        <textarea id="editor" name="editor" />
        <div id="surveyQuestions">
            <h2>Survey questions</h2>
            <div id="surveyQuestionsButtons">
                <button class="customButton" on:click={newSurveyQuestion}
                    >New</button
                >
            </div>
            {#if bestPracticeEntry.surveyQuestions && bestPracticeEntry.surveyQuestions.length > 0}
            <table>
                <thead>
                    <tr
                        ><th>Question</th><th>How to measure</th><th>Target</th
                        ><th /></tr
                    >
                </thead>
                <tbody>
                    {#each bestPracticeEntry.surveyQuestions as q, idx}
                        <tr>
                            <td>
                                <input
                                    bind:value={q.question}
                                    on:change={() => (unsavedChanges = true)}
                                />
                            </td>
                            <td>
                                <input
                                    bind:value={q.howToMeasure}
                                    on:change={() => (unsavedChanges = true)}
                                /></td
                            >
                            <td
                                ><input
                                    bind:value={q.target}
                                    on:change={() => (unsavedChanges = true)}
                                /></td
                            >
                            <td>
                                <button
                                    class="customButton"
                                    on:click={(x) => deleteQuestion(idx)}
                                    >Delete</button
                                ></td
                            >
                        </tr>
                    {/each}
                </tbody>
            </table>
            {:else}
                No questions defined
            {/if}
        </div>
    {/if}
</div>
<svelte:head>
    <link type="text/css" rel="stylesheet" href="build/jodit.min.css" />
</svelte:head>

<style>
    #editor {
        min-width: 400px;
        min-height: 400px;
    }

    input {
        width: 100%;
        font-size: smaller;
    }
    .bestPracticeProperties {
        text-align: left;
    }

    #bpEntryControls {
        font-size: 30px;
    }
    #saveButton {
        color: red;
    }
    #bpEntryEditor {
        text-align: left;
    }

    #editorback {
        text-align: left;
    }
    #editorback i:hover {
        color: cadetblue;
        cursor: default;
    }
    #surveyQuestions table{
        width: 100%;
    }
    #surveyQuestions table td:nth-child(2){
        width: 200px;
    }
</style>
