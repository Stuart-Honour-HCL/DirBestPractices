<script lang="ts">
    export let currentFile: GitFile;
    let editor: Jodit.IJodit;
    let title: string;
    let tagString: string;
    let titleHTML: string;
    let tags: string[];
    let bestPracticeEntry: BestPracticeEntry;

    import APIHelper from "../api";
    import { onMount } from "svelte";
    import Jodit from "jodit";
    import type GitFile from "../gitFile";
    import BestPracticeEntry from "../bestPracticeEntry";
    import SurveyQuestion from "../surveyQuestion";
    import Control from "../control";
    import Debug from "../debug";

    onMount(()=>{
        readDataFromFile(currentFile);
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
            });
        });
    }

    function newSurveyQuestion() {
        bestPracticeEntry.surveyQuestions.push(new SurveyQuestion());
        bestPracticeEntry.surveyQuestions = bestPracticeEntry.surveyQuestions;
    }

    function deleteQuestion(idx: number) {
        bestPracticeEntry.surveyQuestions.splice(idx, 1);
        bestPracticeEntry.surveyQuestions = bestPracticeEntry.surveyQuestions;
    }
    function htmlDecode(input) {
        var doc = new DOMParser().parseFromString(input, "text/html");
        return doc.documentElement.textContent;
    }
</script>

<main>
    {#if bestPracticeEntry}
        <i
            on:click={(x) => {
                saveAndCommit();
            }}
            class="fa fa-save"
        />
        <div class="bestPracticeProperties">
            <label for="txtTitle">Title</label>
            <input id="txtTitle" bind:value={titleHTML} />
        </div>
        <div class="bestPracticeProperties">
            <label for="txtTags">Tags</label>
            <input id="txtTags" bind:value={tagString} />
        </div>

        <textarea id="editor" name="editor" />
        <div id="surveyQuestions">
            <h2>Survey questions</h2>
            <button on:click={newSurveyQuestion}>New</button>
            {#each bestPracticeEntry.surveyQuestions as q, idx}
                <div class="questionLine">
                    <input bind:value={q.question} />
                    <input bind:value={q.howToMeasure} />
                    <button on:click={(x) => deleteQuestion(idx)}>Delete</button
                    >
                </div>
            {/each}
        </div>
    {/if}
</main>
<svelte:head>
    <link type="text/css" rel="stylesheet" href="build/jodit.min.css" />
</svelte:head>

<style>
    #editor {
        min-width: 400px;
        min-height: 400px;
    }

    input {
        min-width: 500px;
        font-size: smaller;
    }
    .bestPracticeProperties {
        text-align: left;
    }
</style>
