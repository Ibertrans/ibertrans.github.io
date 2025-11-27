import {TIB} from './TIB.js';
const companies = {TIB};
export const API = {
    APICall: function APICall(tags){
        switch(tags[0]){
            case "TIB": 
                TIB.buy(tags[1], tags[2]);
                break;
            default:
                throw new Error("Company API not implemented");
        }
    },
    getData: function() {
        let dataOut = {
            trainData: [],
            trainRoutes: {}
        };
        for(const company of Object.values(companies)){
            dataOut.trainData.push(...company.getTrainData());
            Object.assign(dataOut.trainRoutes, company.getTrainRoutes());
        }
        return dataOut;
    }
}