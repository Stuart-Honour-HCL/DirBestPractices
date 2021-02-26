<script lang="ts">
    import { onMount } from "svelte";
    import Tabulator from "tabulator-tables";
    let table: Tabulator;
    let progressCurrentPath: string;
    let dataLoading: boolean = false;
    let bpEntries = {};
    let selectedEntry: BestPracticeEntry;
    let selectedRows = undefined;

    import moment from "moment";

    import Control from "../control";
    import GitFile from "../gitFile";

    import Debug from "../debug";
    import APIHelper from "../api";
    import GitContents, { ROOT_FOLDER } from "../gitContents";
    import BestPracticeEntry from "../bestPracticeEntry";
    import NFRHelpers from "../helpers";

    import {
        Button,
        Modal,
        ModalBody,
        ModalFooter,
        ModalHeader,
    } from "sveltestrap";
    let open = false;
    const toggle = () => (open = !open);

    onMount(() => {});

    const columns = [
        {
            rowHandle: true,
            formatter: "handle",
            headerSort: false,
            frozen: true,
            width: 30,
            minWidth: 30,
        },
        {
            formatter: "rowSelection",
            titleFormatter: "rowSelection",
            align: "center",
            headerSort: false,
            width: 30,
        },
        { title: "NFR", field: "nfr" },
        { title: "File", field: "name", bottomCalc: "count" },
        { title: "Title", field: "title" },
        { title: "Size", field: "size" },
        { title: "Questions", field: "qCount", bottomCalc: "sum" },
    ];

    function progressUpdate(crtPath: string) {
        progressCurrentPath = crtPath;
    }

    /**
     * Scans whole GitHub repo and generates Tabulator table
     */
    function scanRepo() {
        progressCurrentPath = "";
        dataLoading = true;
        document.getElementById("fileTable").innerHTML = "";

        APIHelper.scanRepo(ROOT_FOLDER, progressUpdate).then((files) => {
            Debug.log("Got " + files.length + " files");
            table = new Tabulator(document.getElementById("fileTable"), {
                data: transformFiles(files),
                columns: columns,
                movableRows: true,
                rowMoved: function (row) {
                    //row - row component
                },
                layout: "fitColumns",
                pagination: "local",
                paginationSize: 100,
                selectable: true,
                rowClick: function (e, row) {
                    //e - the click event object
                    //row - row component
                    showContents(row);
                    table.deselectRow();

                    row.toggleSelect(); //toggle row selected state on row click
                    selectedRows = table.getSelectedRows();
                },
                rowSelectionChanged: function (data, rows) {
                    if (table) {
                        selectedRows = table.getSelectedRows();
                    }
                }
            });
            dataLoading = false;
        });
    }

    /**
     * Just for testing purposes - to be deleted
     */
    function TEST_scanRepo() {
        progressCurrentPath = "";
        dataLoading = true;
        document.getElementById("fileTable").innerHTML = "";

        NFRHelpers.TEST_GetContents().then((json) => {
            let files: GitFile[] = JSON.parse(json);

            Debug.log("Got " + files.length + " files");
            table = new Tabulator(document.getElementById("fileTable"), {
                data: transformFiles(files),
                columns: columns,
                movableRows: true,
                rowMoved: function (row) {
                    //row - row component
                },
                layout: "fitColumns",
                pagination: "local",
                paginationSize: 100,
                selectable: true,
                rowClick: function (e, row) {
                    //e - the click event object
                    //row - row component
                    showContents(row);
                    table.deselectRow();

                    row.toggleSelect(); //toggle row selected state on row click
                    selectedRows = table.getSelectedRows();
                },
                rowSelectionChanged: function (data, rows) {
                    if (table) {
                        selectedRows = table.getSelectedRows();
                    }
                },
            });
            dataLoading = false;
        });
    }

    // Adds calculated columns
    function transformFiles(files: GitFile[]) {
        let res: GitFile[] = [];
        let resultLog = undefined;
        files.forEach((f) => {
            try {
                let crt = new GitFile();
                crt.name = f.name;
                crt.path = f.path;
                crt.sha = f.sha;
                crt.content = atob(f.content);
                crt["nfr"] = crt.pathComponents()[1];
                crt["size"] = crt.content.length;

                let bpe = new BestPracticeEntry(crt.content);
                crt["qCount"] = bpe.surveyQuestions.length;
                crt["title"] = BestPracticeEntry.htmlDecode(bpe.titleHTML);
                res.push(crt);
                bpEntries[f.path] = bpe;
            } catch (ex) {
                resultLog += `Failed to parse: ${f.path}. `;
            }
        });
        if (resultLog) {
            Control.showInfolog(
                `Parsed successfully ${res.length} entries. ` + resultLog
            );
        } else {
            Control.showInfolog(`Parsed successfully ${res.length} entries`);
        }
        return res;
    }

    function showContents(row) {
        let data = row.getData();
        Debug.log("RepoExported - showContents ", data);
        if (data && data.path && bpEntries[data.path]) {
            selectedEntry = bpEntries[data.path];
            //open = true;
            /*document.getElementById("exporterOutput").innerHTML =
                bpEntries[data.path].descriptionHTML;*/
        }
    }

    function exportSuvey() {
        let rows = table.getSelectedRows();
        let paths: string[] = [];
        rows.forEach((element) => {
            paths.push(element.getData().path);
        });
        let res = NFRHelpers.exportSurvey(paths, bpEntries);
        NFRHelpers.downloadFile("survey.json", JSON.stringify(res));
    }

    function showCurrentEntryModal() {
        open = true;
    }

    function exportDocument() {
        let rows = table.getSelectedRows();
        let paths: string[] = [];
        rows.forEach((element) => {
            paths.push(element.getData().path);
        });

        NFRHelpers.createOutputDocument(paths, bpEntries).then((res) => {
            NFRHelpers.downloadFile("bestPractices.html", res);
        });
    }
</script>

<div id="exporter">
    <div id="exporterControls">
        <button type="button" class="btn btn-primary" on:click={scanRepo}
            ><i class="fa fa-search" /> Scan repo</button
        >
        <button
            type="button"
            class="btn btn-primary"
            disabled={!selectedRows || selectedRows.length == 0}
            on:click={exportSuvey}
            ><i class="fa fa-list" /> Export survey</button
        >
        <button
            type="button"
            class="btn btn-primary"
            disabled={!selectedRows || selectedRows.length != 1}
            on:click={showCurrentEntryModal}
            ><i class="fa fa-file" /> View entry</button
        >
        <button
            type="button"
            class="btn btn-primary"
            disabled={!selectedRows || selectedRows.length != 1}
            on:click={scanRepo}><i class="fa fa-edit" /> Edit entry</button
        >
        <button
            type="button"
            class="btn btn-danger"
            disabled={!selectedRows || selectedRows.length == 0}
            on:click={exportDocument}
            ><i class="fa fa-book" /> Export documentation</button
        >

        <button type="button" class="btn btn-success" on:click={TEST_scanRepo}
            ><i class="fa fa-book" /> Test - sample repo</button
        >
    </div>
    <div id="exporterStats" />
    <div id="exporterSelector">
        <div id="exporterSelTable">
            {#if dataLoading}
                <p>Loading... {progressCurrentPath}</p>
            {/if}
            <div id="fileTable">
                <p>Scan repo to retrieve entries</p>
            </div>
        </div>
    </div>
    <div id="exporterOutput" />
    {#if selectedEntry}
        <Modal isOpen={open} {toggle} transitionOptions={{}} size={"xl"}>
            <ModalHeader {toggle}>{@html selectedEntry.titleHTML}</ModalHeader>
            <ModalBody>
                {@html selectedEntry.descriptionHTML}
                <hr />
                <h3>Questions</h3>
                <ol>
                    {#each selectedEntry.surveyQuestions as q, idx}
                        <li>{q.question}</li>
                    {/each}
                </ol>
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" on:click={toggle}>Close</Button>
            </ModalFooter>
        </Modal>
    {/if}
</div>
<svelte:head>
    <link href="build/tabulator.min.css" rel="stylesheet" />
</svelte:head>

<style>
    #exporter {
        width: 90%;
        left: 5%;

        text-align: left;
        position: relative;
    }
    #exporterSelector {
        margin-top: 10px;
    }
</style>
