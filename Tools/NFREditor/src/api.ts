import BestPracticeEntry from "./bestPracticeEntry";
import GitContents from "./gitContents";
import GitFile from "./gitFile";

export default class APIHelper {
    static token: string;
    static user: string;
    static repo: string;

    static getContent(path: string): Promise<GitContents>{
        if (!APIHelper.token || !APIHelper.user || !APIHelper.repo) {
            console.error("Token, user and repo must be set");
        }

        return new Promise<GitContents>((resolve, reject) => {
            APIHelper.apiGET(`${APIHelper.user}/${APIHelper.repo}/contents/${path}`, APIHelper.token).then(content => {
                let res = new GitContents();
                res.path = path;

                if(Array.isArray(content)){
                    console.log("Read dir:" + path + ". Number of entries: " + content.length);
                    res.type = "dir";
                    res.dirList = content;              
                }
                else{
                    console.log("Read file:" + path);
                    if (content.content) {
                        console.log("Content: " + atob(content.content));
                    }
                    res.type = "file";
                    res.file = content;
                }
                resolve(res);                
               
            }).catch(reason => {
                reject(reason);
            });
        });
    }

    static writeFile(file: GitFile): Promise<GitFile> {
        if (!APIHelper.token || !APIHelper.user || !APIHelper.repo) {
            console.error("Token, user and repo must be set");
        }

        return new Promise<GitFile>((resolve, reject) => {

            APIHelper.apiPUT(APIHelper.user, APIHelper.repo, file.path, APIHelper.token, file).then(fu => {
                let updatedFile: GitFile = fu["content"] as GitFile;
                console.log("Updated file SHA:" + updatedFile.sha);
                resolve(updatedFile);
            }).catch(reason => {
                console.log("Update fail reason:" + reason);
                reject(reason);
            });
        });
    }
    
    static createNewFile(path: string): Promise<GitFile> {
        if (!APIHelper.token || !APIHelper.user || !APIHelper.repo) {
            console.error("Token, user and repo must be set");
        }

        return new Promise<GitFile>((resolve, reject) => {

            let newBP = new BestPracticeEntry();
            newBP.generateHTML().then(content => {
                let gitFile = new GitFile();
                gitFile.content = content;
                gitFile.sha = undefined;

                APIHelper.apiPUT(APIHelper.user, APIHelper.repo, path, APIHelper.token, gitFile).then(fu => {
                    let updatedFile: GitFile = fu["content"] as GitFile;
                    console.log("Updated file SHA:" + updatedFile.sha);
                    resolve(updatedFile);
                }).catch(reason => {
                    console.log("Update fail reason:" + reason);
                    reject(reason);
                });
            });
          
        });
    }

        
    static apiGET(endpoint, token): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            fetch(`https://api.github.com/repos/${endpoint}`, {
                headers: token ? {
                    Authorization: `Bearer ${token}`
                } : undefined
            }).then(response => {
                if (response.ok) {
                    return response.json();
                }
                reject(response.status);
            }).then(data => {
                resolve(data);
            }).catch(reason => {
                reject(reason);
            });
        });
    }

    static apiPUT(user: string, repository: string, path: string, token, file: GitFile): Promise<Object> {

        let body = {
            content: btoa(file.content),
            message: `Updating ${path} at: ${new Date().toTimeString()}`,
            sha: file.sha,
            path: path           
        };

        path = encodeURI(path);
        let endpoint = `${user}/${repository}/contents/${path}`;
        return new Promise<Object>((resolve, reject) => {
            fetch(`https://api.github.com/repos/${endpoint}`, {
                headers: token ? {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                } : undefined,
                method: "PUT",
                body: JSON.stringify(body)
            }).then(response => {
                if (response.ok) {
                    return response.json();
                }
                reject(response.statusText);
            }).then(data => {
                resolve(data as Object);
            }).catch(reason => {
                reject(reason);
            });
        });



    }
}