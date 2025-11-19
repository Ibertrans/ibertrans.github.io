import exampleData from "./ExampleData.json" with { type: 'json' };
const data = exampleData["trainData"];
var routes = addReverseRoutes(exampleData["trainRoutes"]);
const testDiv = document.getElementById("test-div");
const updateButton = document.getElementById("update-button")
updateButton.onclick = update;
const stationFromSelector = document.getElementById("station-from-selector");
const stationToSelector = document.getElementById("station-to-selector");

updateStationSelectors(routes);
update();

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

function addMinutes(timeStr, minutes) {
    const [hours, mins] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins, 0, 0);
    date.setMinutes(date.getMinutes() + minutes);
    const newHours = String(date.getHours()).padStart(2, '0');
    const newMins = String(date.getMinutes()).padStart(2, '0');
    return `${newHours}:${newMins}`;
}

function update(){
    console.log("update")
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

    const fromStation = stationFromSelector.value;
    const toStation = stationToSelector.value;

    var outArr = [];

    dataToDisplay.forEach(element => {
        if (element) {
            let mapout = {};

            const routeInfo = routes[element["Company"]][element["Route"]];
            const routeStops = routeInfo["Stops"];
            const routeTimes = routeInfo["Times"];
            const trainStartTime = element["Time"];

            if (fromStation) {
                const fromIndex = routeStops.indexOf(fromStation);
                const departureTime = addMinutes(trainStartTime, routeTimes[fromIndex]);
                mapout["Departure time"] = departureTime;
            }

            if (toStation) {
                const toIndex = routeStops.indexOf(toStation);
                const arrivalTime = addMinutes(trainStartTime, routeTimes[toIndex]);
                mapout["Arrival time"] = arrivalTime;
            }

            mapout["Company"] = element["Company"];
            mapout["Type"] = element["Type"];
            mapout["Route"] = element["Route"];
            mapout["Date"] = element["Date"];
            mapout["Start Time"] = element["Time"];

            outArr.push(mapout);
        }
        updateOutput(outArr);
    });
}

function updateOutput(inArr){
    const customOrder = [
        "Company",
        "Type",
        "Route",
        "Date",
        "Departure time",
        "Arrival time",
        "Start Time"
    ];

    var strOut = "";

    inArr.forEach(map => {
        if (map) {
            const sortedKeys = Object.keys(map).sort((a, b) => {
                const indexA = customOrder.indexOf(a);
                const indexB = customOrder.indexOf(b);
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });

            strOut += "<p>";
            sortedKeys.forEach(key =>{

                strOut += `${key}: ${map[key]}<br>`;

            })
            strOut += "</p>";
        }
    });

    testDiv.innerHTML = strOut;
    
}