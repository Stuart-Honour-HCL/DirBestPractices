import type BestPracticeEntry from "./bestPracticeEntry";
import Debug from "./debug";
import SurveyEntry from "./surveyEntry";

export default class NFRHelpers{
    static exportSurvey(paths: string[], data: object){
        Debug.log("Helpers - exportSurvey");
        Debug.log(paths);

        let res : SurveyEntry[] = [];
        paths.forEach(p =>{
            let bp : BestPracticeEntry = data[p];        
            bp.surveyQuestions.forEach(element => {
                let crtEntry = new SurveyEntry();
                crtEntry.path = p;
                crtEntry.question = element;
                res.push(crtEntry);
            });
        });
        return res;
    }

    static downloadFile(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
      
        element.style.display = 'none';
        document.body.appendChild(element);
      
        element.click();
      
        document.body.removeChild(element);
      }
}