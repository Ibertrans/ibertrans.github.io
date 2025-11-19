import exampleData from "./ExampleData.json" with { type: 'json' };
const data = exampleData["trainData"];
var routes = exampleData["trainRoutes"];
routes = addReverseRoutes(routes);

function addReverseRoutes(routesToReverse){
    const routeReverseRegex = /^(.*?)\s*->\s*(.*)$/;
    for(var company in routesToReverse){
        for(var routeKey in routesToReverse[company]){
            const reverseKey = routeKey.replace(routeReverseRegex, "$2 -> $1");
            routesToReverse[company][reverseKey] = {"Stops": [], "Times": []};
            routesToReverse[company][reverseKey]["Stops"] = [...routesToReverse[company][routeKey]["Stops"]].reverse();
            for(var i in routesToReverse[company][routeKey]["Times"]){
                const routeLength = routesToReverse[company][routeKey]["Times"].length;
                routesToReverse[company][reverseKey]["Times"][i] = routesToReverse[company][routeKey]["Times"][routeLength - 1] - routesToReverse[company][routeKey]["Times"][routeLength - 1 - i];
            }
        }
    }
    return routesToReverse;
}
console.log({"trainData" : data, "trainRoutes" : routes});

const testDiv = document.getElementById("test-div");
const updateButton = document.getElementById("update-button")
updateButton.onclick = update;
const stationFromSelector = document.getElementById("station-from-selector");
const stationToSelector = document.getElementById("station-to-selector");
updateStationSelectors(routes);

function updateStationSelectors(inputRoutes){
    var out = [];
    for(var company in inputRoutes){
        for(var route in inputRoutes[company]){
            inputRoutes[company][route]["Stops"].forEach(stop => {
                if(!out.includes(stop)){
                    out.push(stop);
                }
            })
        }
    }
    out.sort();
    out.forEach(stop => {
        const option = document.createElement("option");
        option.value = stop;
        option.text = stop;
        stationToSelector.appendChild(option);
        stationFromSelector.appendChild(option.cloneNode(true));
    })
}

function update(){
    console.log("update")
    testDiv.innerHTML = "Loading...";
    var strOut = "";
    const selectedDay = document.getElementById("day-selector").value;
    
    let dataToDisplay = data;
    if (selectedDay !== "") {
        dataToDisplay = dataToDisplay.filter(train => train && train["Date"] === selectedDay);
    }
    if(stationToSelector.value !== "" || stationFromSelector.value !== ""){
        dataToDisplay = (stationToSelector.value !== "" && stationFromSelector.value !== "")
        ? dataToDisplay.filter(train =>
            train
            && routes[train["Company"]][train["Route"]]["Stops"].includes(stationFromSelector.value)
            && routes[train["Company"]][train["Route"]]["Stops"].indexOf(stationToSelector.value) > routes[train["Company"]][train["Route"]]["Stops"].indexOf(stationFromSelector.value)
        )
        : (
            stationToSelector.value !== ""
            ? dataToDisplay.filter(train =>
                train
                && routes[train["Company"]][train["Route"]]["Stops"].includes(stationToSelector.value)
                && routes[train["Company"]][train["Route"]]["Stops"].indexOf(stationToSelector.value) > 0
            )
            : dataToDisplay.filter(train =>
                train
                && routes[train["Company"]][train["Route"]]["Stops"].includes(stationFromSelector.value)
                && routes[train["Company"]][train["Route"]]["Stops"].indexOf(stationFromSelector.value) < routes[train["Company"]][train["Route"]]["Stops"].length - 1
            )
        )
    }

    dataToDisplay.forEach(element => {
        if (element) {
            strOut += `<p>Company:${element["Company"]}<br>Type:${element["Type"]}<br>Time:${element["Time"]}<br>Route:${element["Route"]}</p>`;
        }
    });
    testDiv.innerHTML = strOut;
}