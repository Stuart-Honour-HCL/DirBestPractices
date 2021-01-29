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
    function openInNewTab(url) {
        var win = window.open(url, "_blank");
        win.focus();
    }
</script>

<main>
    <h1>Best practices. Together</h1>

    <div id="authForm">
        <table>
            <tr>
                <td> <label for="user">User</label></td>
                <td
                    ><input
                        bind:value={user}
                        id="user"
                        placeholder="Git user"
                    /></td
                ><td />
            </tr>
            <tr>
                <td> <label for="repo">Repo</label></td>
                <td>
                    <input
                        bind:value={repo}
                        id="repo"
                        placeholder="Git repo name"
                    />
                </td><td />
            </tr>
            <tr>
                <td> <label for="token">Token</label></td>
                <td>
                    <input
                        bind:value={token}
                        id="token"
                        placeholder="Git token"
                    /></td
                ><td> <i title="How to generate a token" 
                    class="fa fa-info-circle" 
                    on:click={(x) => {openInNewTab('https://github.com/settings/tokens');}} /></td>
            </tr>
        </table>

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
    table {
        width: 100%;
    }
</style>
