<script lang="ts">
import Control from "../control";
import { ROOT_FOLDER } from "../gitContents";


</script>

<div id="mainMenu">
    <div class="row" id="mainMenuButtons">
        <div class="col-md-12 mb-3">
            <button type="button" class="btn btn-primary btn-lg btn-block" on:click={x => Control.openPath(ROOT_FOLDER)}
                > <i class="fa fa-edit" /> Edit best practices</button
            >
        </div>
        <div class="col-md-12 mt-3">
            <button type="button" class="btn btn-primary btn-lg btn-block"  on:click={x => Control.openExporter()}
                > <i class="fa fa-download" /> Export survey and documentation</button
            >
        </div>
    </div>
</div>

<style>
    #mainMenuButtons {
        position: absolute;
        width: 50%;
        height: 250px;       
    }
    #mainMenu {
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
