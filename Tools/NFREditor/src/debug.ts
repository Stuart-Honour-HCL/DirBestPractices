export default class Debug {
    static enabled: true;

    static log(...data: any[]) {
        if (Debug.enabled) {
            console.log(data);
        }
    }
}