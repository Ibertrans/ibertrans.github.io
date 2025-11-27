const getData = async (str) => {
    try {
        const response = await fetch(str);
        const jsonData = await response.json();
        return jsonData;
    } catch (error) {
        console.error('Error fetching JSON:', error);
    }
}

async function trainManager(){
    var dataIn = await getData("./ExampleData.json");
    dataIn["trainRoutes"] = addReverseRoutes(dataIn["trainRoutes"]);
    const data = dataIn;
    const testDiv = document.getElementById("test-div");
    const testDivContent = testDiv.innerHTML;
    const updateButton = document.getElementById("update-button");
    updateButton.onclick = update;
    const stationFromSelector = document.getElementById("station-from-selector");
    const stationToSelector = document.getElementById("station-to-selector");
    var savedArr = [], trainsPage, pageOffset = 0;

    const pageButtons = document.getElementsByClassName("page-button");
    for(var key = 0; key < pageButtons.length; key++){
        const pageButtonClass = pageButtons[key].classList;
        pageButtons[key].onclick = () => pageSwitch(pageButtonClass);
    }
    const pageLeftButtons = document.getElementsByClassName("page-button left");
    const pageRightButtons = document.getElementsByClassName("page-button right");


    updateStationSelectors(data["trainRoutes"]);
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
        pageOffset = 0;
        const selectedDay = document.getElementById("day-selector").value;
        
        let dataToDisplay = data["trainData"];
        if (selectedDay !== "") {
            dataToDisplay = dataToDisplay.filter(train => train && train["Date"] === selectedDay);
        }
        if(stationToSelector.value !== "" || stationFromSelector.value !== ""){
            dataToDisplay = (stationToSelector.value !== "" && stationFromSelector.value !== "")
            ? dataToDisplay.filter(train =>
                train
                && data["trainRoutes"][train["Company"]][train["Route"]]["Stops"].includes(stationFromSelector.value)
                && data["trainRoutes"][train["Company"]][train["Route"]]["Stops"].indexOf(stationToSelector.value) > data["trainRoutes"][train["Company"]][train["Route"]]["Stops"].indexOf(stationFromSelector.value)
            )
            : (
                stationToSelector.value !== ""
                ? dataToDisplay.filter(train =>
                    train
                    && data["trainRoutes"][train["Company"]][train["Route"]]["Stops"].includes(stationToSelector.value)
                    && data["trainRoutes"][train["Company"]][train["Route"]]["Stops"].indexOf(stationToSelector.value) > 0
                )
                : dataToDisplay.filter(train =>
                    train
                    && data["trainRoutes"][train["Company"]][train["Route"]]["Stops"].includes(stationFromSelector.value)
                    && data["trainRoutes"][train["Company"]][train["Route"]]["Stops"].indexOf(stationFromSelector.value) < data["trainRoutes"][train["Company"]][train["Route"]]["Stops"].length - 1
                )
            )
        }

        const fromStation = stationFromSelector.value;
        const toStation = stationToSelector.value;

        var outArr = [];

        dataToDisplay.forEach(element => {
            if (element) {
                let mapout = {};

                const routeInfo = data["trainRoutes"][element["Company"]][element["Route"]];
                const routeStops = routeInfo["Stops"];
                const routeTimes = routeInfo["Times"];
                const trainStartTime = element["Time"];

                if (fromStation) {
                    const fromIndex = routeStops.indexOf(fromStation);
                    const departureTime = addMinutes(trainStartTime, routeTimes[fromIndex]);
                    mapout["Departure time"] = departureTime;
                }   else{
                    mapout["Departure time"] = element["Time"];
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

                outArr.push(mapout);
            }
        });

        sortTrains(outArr);
        console.log(outArr)
        savedArr = outArr;
        updateOutput();
    }

    function sortTrains(trains) {
        const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const now = new Date();
        // getDay() is 0 for Sunday, we want 0 for Monday.
        const currentDayIndex = (now.getDay() + 6) % 7; 
        const currentDayName = weekdays[currentDayIndex];
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Create a sorting order for days starting from the current day
        const dayOrder = [...weekdays.slice(currentDayIndex), ...weekdays.slice(0, currentDayIndex)];

        trains.sort((a, b) => {
            const timeA = a["Departure time"];
            const timeB = b["Departure time"];

            const isAToday = a.Date === currentDayName;
            const isBToday = b.Date === currentDayName;

            const aHasDeparted = isAToday && timeA < currentTime;
            const bHasDeparted = isBToday && timeB < currentTime;

            // A has departed today, B has not. B comes first.
            if (aHasDeparted && !bHasDeparted) return 1;
            // B has departed today, A has not. A comes first.
            if (!aHasDeparted && bHasDeparted) return -1;

            // Get index of the day in our custom-ordered week
            const dayIndexA = dayOrder.indexOf(a.Date);
            const dayIndexB = dayOrder.indexOf(b.Date);

            // Sort by day of the week
            if (dayIndexA !== dayIndexB) {
                return dayIndexA - dayIndexB;
            }

            // If days are the same, sort by time
            return timeA.localeCompare(timeB);
        });
    }

    function updateOutput(){
        const customOrder = [
            "Company",
            "Type",
            "Route",
            "Date",
            "Departure time",
            "Arrival time"
        ];

        const maxLoaded = 12;

        if(pageOffset == 0){
            for(var i =0;i<pageLeftButtons.length;i++){
                pageLeftButtons[i].disabled = true;
            }
        }
        else{
            for(var i =0;i<pageLeftButtons.length;i++){
                pageLeftButtons[i].disabled = false;
            }
            
        }
        if(savedArr.length <= (pageOffset + 1)*maxLoaded){
            for(var i =0;i<pageRightButtons.length;i++){
                pageRightButtons[i].disabled = true;
            }
        }
        else{
            for(var i =0;i<pageRightButtons.length;i++){
                pageRightButtons[i].disabled = false;
            }
        }

        var strOut = testDivContent;
        console.log(savedArr);
        savedArr.slice(pageOffset*maxLoaded, (pageOffset + 1)*maxLoaded).forEach(map => {
            if (map) {
                const sortedKeys = Object.keys(map).sort((a, b) => {
                    const indexA = customOrder.indexOf(a);
                    const indexB = customOrder.indexOf(b);
                    if (indexA === -1) return 1;
                    if (indexB === -1) return -1;
                    return indexA - indexB;
                });

                strOut += '<p class="train-display">';
                sortedKeys.forEach(key =>{

                    strOut += `${key}: ${map[key]}<br>`;

                })
                strOut += "</p>";
            }
        });

        testDiv.innerHTML = strOut;
        
    }

    function pageSwitch(classList){
        console.log(classList)
        if (!classList) return;
        if (classList.contains("left")) {
                pageOffset--;
        }
        else if (classList.contains("right")) {
                pageOffset++;
        }
        updateOutput();
    }
}
trainManager();