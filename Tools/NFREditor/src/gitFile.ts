export default class GitFile{
    content: string;
    download_url: string;
    name : string;
    path: string;
    type: string;
    sha: string;
    size: number;
    message: string;

    
    static parentPath(file: GitFile): string{
        let idx = file.path.lastIndexOf("/");
        if(idx > 0){
            return file.path.substr(0, idx);
        }
        else{
            return null;
        }
    }
    
    pathComponents(): string[]{
        return this.path.split("/");
    }
}