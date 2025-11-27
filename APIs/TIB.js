import dataIn from "../ExampleData.json" with { type: 'json' };
export const TIB = {
    buy: function buy(day, routeMinified){
    const route = routeMinified.split("-").join(" ").split("_").join(" -> ");
    alert(`You have purchased a train from TIB on route ${route} on ${day}.`)
    },
    getTrainData: function getTrainData(){
        return dataIn["trainData"];
    },
    getTrainRoutes: function getTrainRoutes(){
        return dataIn["trainRoutes"];
    }
}