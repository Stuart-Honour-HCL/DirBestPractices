<script lang="ts">
    import APIHelper from "../api";
    import Control from "../control";

    let user: string;
    let repo: string;
    let token: string;

    function saveAuth() {
        if (user && repo && token) {
            APIHelper.user = user;
            APIHelper.repo = repo;
            APIHelper.token = token;

            APIHelper.getContent("Best practices")
                .then((content) => {
                    Control.showInfolog("Authentication OK");
                    document.cookie = `nfrGitUser=${user}`;
                    document.cookie = `nfrGitRepo=${repo}`;
                    document.cookie = `nfrGitToken=${token}`;
                    
                    Control.signalAuthChanged();
                })
                .catch((reason) => {
                    Control.showInfolog(
                        "Failed to retrieve root directory. Check if token still valid. Message: " +
                            reason
                    );
                });
        } else {
            Control.showInfolog("Please provide git user, repo and token");
        }
    }
</script>

<main>
    <h1>Best practices. Together</h1>

    <div id="authForm">
        <div class="formEntry">
            <label for="user">User</label>
            <input bind:value={user} id="user" placeholder="Git user" />
        </div>
        <div class="formEntry">
            <label for="repo">Repo</label>
            <input bind:value={repo} id="repo" placeholder="Git repo name" />
        </div>
        <div class="formEntry">
            <label for="token">Token</label>
            <input bind:value={token} id="token" placeholder="Git token" />
        </div>
        <div class="controls">
            <button on:click={saveAuth}>Submit</button>
        </div>
    </div>
</main>

<style>
    main {
        padding: 1em;
        max-width: 500px;
        margin: 0 auto;
    }

    h1 {
        text-align: center;
        color: #ff3e00;
        text-transform: uppercase;
        font-size: 4em;
        font-weight: 100;
    }

    input {
        width: 80%;
        font-size: smaller;
    }
</style>
