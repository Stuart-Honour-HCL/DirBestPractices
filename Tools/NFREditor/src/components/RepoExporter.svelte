<script lang="ts">
    import { onMount } from "svelte";
    import Tabulator from "tabulator-tables";
    let table: Tabulator;
    let progressCurrentPath: string;
    let dataLoading: boolean = false;
    let bpEntries = {};

    import moment from "moment";

    import Control from "../control";
    import GitFile from "../gitFile";

    import Debug from "../debug";
    import APIHelper from "../api";
    import GitContents, { ROOT_FOLDER } from "../gitContents";
    import BestPracticeEntry from "../bestPracticeEntry";
    import NFRHelpers from "../helpers";

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
        { title: "File", field: "name" },
        { title: "Title", field: "title" },
        { title: "Size", field: "size" },
        { title: "Questions", field: "qCount" },
    ];

    function progressUpdate(crtPath: string) {
        progressCurrentPath = crtPath;
    }

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
                    //row.toggleSelect(); //toggle row selected state on row click
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
            document.getElementById("exporterOutput").innerHTML =
                bpEntries[data.path].descriptionHTML;
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
</script>

<div id="exporter">
    <div id="exporterControls">
        <button type="button" class="btn btn-primary" on:click={scanRepo}
            ><i class="fa fa-search" /> Scan repo</button
        >
        <button type="button" class="btn btn-primary" on:click={exportSuvey}
            ><i class="fa fa-list" /> Export survey</button
        >
        <button type="button" class="btn btn-primary" on:click={scanRepo}
            ><i class="fa fa-edit" /> Edit entry</button
        >
        <button type="button" class="btn btn-primary" on:click={scanRepo}
            ><i class="fa fa-book" /> Export documentation</button
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
