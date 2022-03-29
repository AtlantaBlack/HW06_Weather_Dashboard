// authentication key for Open Weather API
var weatherAPIkey = "70ae3d7cda7e676a90d911c1ff2798ed";

var cityDisplayArea = document.querySelector("#city-name-display");
var previousSearchesArea = document.querySelector("#previous-searches");

var todaysDateArea = document.querySelector("#todays-date-display");
var weatherDisplayArea = document.querySelector("#weather-display");
var forecastDisplayArea = document.querySelector("#forecast-display");

var submitButton = document.querySelector("#get-weather-button");
var clearButton = document.querySelector("#clear-history-button");


// submit user input: convert city name to long & lat for weather API
function submitUserInput(event) {
    event.preventDefault();

    var cityInput = document.getElementById("city-name");
    cityInput = cityInput.value.trim();

    if (!cityInput) {
        alert("Please type in a valid city name.");
        return;
    } else {
        geocodeTheCity(cityInput);
        saveAndDisplaySearch(cityInput);
        cityInput.textContent = "";
        cityInput.value = "";
    }
}

// convert city name to latitude and longitude values
function geocodeTheCity(location) {
    // http => https
    var geocodeUrl = "https://api.openweathermap.org/geo/1.0/direct?q=" + location + "&appid=" + weatherAPIkey;

    fetch(geocodeUrl)
        .then(function (response) {
            if (!response.ok) {
                throw response.json();
            } else {
                return response.json();
            }
        })
        .then(function (data) {
            if (data.length === 0) {
                alert("Sorry, we couldn't find that city!\nPlease try again.");
                return;    
            } else {
                var lat = data[0].lat;
                var lon = data[0].lon;
                var cityName = data[0].name;
                var countryCode = data[0].country;
                displayCityName(cityName, countryCode);
                getWeatherDetails(lat, lon);
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

// display the city name and country
function displayCityName(cityName, countryCode) {
    // clear the display area
    cityDisplayArea.textContent = "";
    // do some magic to turn country code into full country name
    let countryName = new Intl.DisplayNames(["en"], { type: "region" });
    // display the city name paired with the country name
    cityDisplayArea.textContent = cityName + ", " + countryName.of(countryCode);
}

function saveAndDisplaySearch(cityInput) {
    // set an object to be used for storing user input data
    var savedCity = {
        chosenCity: cityInput
    }

    // first retrieve results from local storage
    let savedCities = JSON.parse(localStorage.getItem("searchHistory"));
    // if no saved cities then start with an empty search array
    if (savedCities === null) {
        savedCities = [];
    }
    // add user input into the array for all saved searches
    savedCities.push(savedCity);
    // save to local storage
    localStorage.setItem("searchHistory", JSON.stringify(savedCities));

    // make some buttons for each user input
    let searchedCityButton = document.createElement("button");
    searchedCityButton.setAttribute("class", "search-history-button");
    searchedCityButton.textContent = savedCity.chosenCity;
    // make sure button value is the user input
    searchedCityButton.value = savedCity.chosenCity;

    // add the button
    previousSearchesArea.appendChild(searchedCityButton);

    // when the button is clicked, use the value of the clicked button (city name) to fetch the weather data
    searchedCityButton.addEventListener("click", function(event) {
        // transfer the button value (ie user input) to a variable
        let searchedCity = event.target.value;
        // pass that variable on to fetch and print city data
        geocodeTheCity(searchedCity);
    })
}

// retrieving from local storage
function loadSearchHistory() {
    // grab the data out of local storage
    var data = JSON.parse(localStorage.getItem("searchHistory"));
    // if there's no data then end the function
    if (!data) {
        return;
    }
    // loop through the returned array and create buttons for each item in there
    for (i = 0; i < data.length; i++) {
        var dataButton = document.createElement("button");
        dataButton.setAttribute("class", "search-history-buttons");
        // text content and value will be the city the user chose
        dataButton.textContent = data[i].chosenCity;
        dataButton.value = data[i].chosenCity;
        // add button to search history
        previousSearchesArea.appendChild(dataButton);
        // add event listener to button
        dataButton.addEventListener("click", function(event) {
            let searchedCity = event.target.value;
            geocodeTheCity(searchedCity);
        })
    }
}


function clearSearchHistory() {
    localStorage.clear();
    previousSearchesArea.textContent = "";
}


// grab weather data from the city at specified latitude/longitude
function getWeatherDetails(lat, lon) {
    // api url originally https

    // using latitude and longitude values, construct a query url
    var queryUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly" + "&appid=" + weatherAPIkey + "&units=metric";

    // use that query url to fetch data
    fetch(queryUrl)
        .then(function (response) {
            if (!response.ok) {
                throw response.json();
            } else {
                return response.json();
            }
        })
        .then(function (data) {
            // make icon: extract icon data then make a url for it
            var iconCode = data.current.weather[0].icon;
            // NB: change http => https for live deployment to work
            // @2x refers to final size of icon (ie 2x original size)
            var iconUrl = "https://openweathermap.org/img/wn/" + iconCode + "@2x.png";

            // extract weather description data
            var weatherDesc = data.current.weather[0].description;
            
             // grab all necessary weather conditions data
             var weatherConditions = {
                "icon": iconUrl,
                "condition": data.current.weather[0].main,
                "conditionID": data.current.weather[0].id,
                // capitalise the first letter of the weather description (to make it look nice)
                "description": capitaliseFirstLetter(weatherDesc),
                "temp": data.current.temp,
                "uv": data.current.uvi,
                "humidity": data.current.humidity,
                "wind": data.current.wind_speed,
                "today": data.current.dt,
                "daily": data.daily
            }
            // pass object containing weather details on
            displayTheWeather(weatherConditions);
            // pass only the daily forecast info on
            displayForecast(weatherConditions.daily);
        })
        .catch(function (error) {
            console.log(error);
        })
}

// capitalise the first letter of a string
function capitaliseFirstLetter(str) {
    let capitalised = str.charAt(0).toUpperCase() + str.slice(1);
    return capitalised;
}

// to round a number to decimal points or to whole number (precision value will be the amount of numbers after decimal point)
function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

// convert the unix timestamp into a readable date
function displayDate(timestamp) {
    // first convert the timestamp into milliseconds
    var currentDay = new Date(timestamp * 1000);

    var year = currentDay.getFullYear();
    // if you want the months to show numeric instead: 
    // uncomment the following line. More instructions further down
    // var month = ("0" + (currentDay.getMonth() + 1)).slice(-2);
    var day = ("0" + currentDay.getDate()).slice(-2);

    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    var dayName = days[currentDay.getDay()];
    var monthName = months[currentDay.getMonth()];

    // to show numeric months, uncomment the following line:
    // date = dayName + " " + day + "/" + month + "/" + year;
    // and comment out the following line:
    date = dayName + " " + day + " " + monthName + " " + year;
    return date;
}


// display the weather results
function displayTheWeather(weatherconditions) {
    // first clear the div
    weatherDisplayArea.textContent = "";

    // make a bounding box to neatly hold all elements in this section that will be dynamically created using js
    var weatherDetailsContainer = document.createElement("div");
    weatherDetailsContainer.classList = "container-fluid";

    // 'wdc' prefix means 'weatherDetailsContainer'

    // make row to contain left column box and right column box
    var wdcRow = document.createElement("div");
    wdcRow.classList = "row bg-white";

    // make the column that will float left
    var columnLeft = document.createElement("div");
    columnLeft.classList = "col-12 col-md-6 content-left";

    // make box to hold current day's weather forecast; set the elements to be displayed in a flex column
    var currentForecast = document.createElement("div");
    currentForecast.classList = "d-flex flex-column align-items-center pt-2";
    columnLeft.appendChild(currentForecast);

    // first make today's date readable
    var todaysDate = displayDate(weatherconditions.today);
    // display today's date inside left column
    var dateTitle = document.createElement("h5");
    dateTitle.append(todaysDate);
    currentForecast.appendChild(dateTitle);

    // make weather icon as image
    var weatherIcon = document.createElement("img");
    weatherIcon.setAttribute("src", weatherconditions.icon);
    weatherIcon.setAttribute("alt", weatherconditions.condition);
    currentForecast.append(weatherIcon);

    // add the weather description after the image
    var currentDesc = document.createElement("p");
    currentDesc.textContent = weatherconditions.description;
    currentForecast.appendChild(currentDesc);

    // make the column that will float right (this column will contain the extra weather conditions for current day)
    var columnRight = document.createElement("div");
    columnRight.classList = "col-12 col-md-6 content-right";

    // 'c' prefix means 'current (weather)'

    // make a list for the additional current weather details
    var cDetailsList = document.createElement("ul");
    cDetailsList.classList = "list-group list-group-flush pt-2";
    cDetailsList.setAttribute("id", "current-details-list");

    // make list item for current temperature and append to ul
    var currentTemp = document.createElement("li");
    currentTemp.classList = "list-group-item";
    currentTemp.textContent = "Current temp: " + round(weatherconditions.temp, 1) + "°C";
    cDetailsList.appendChild(currentTemp);

    // make list item for current humidity and append to ul
    var currentHumidity = document.createElement("li");
    currentHumidity.classList = "list-group-item";
    currentHumidity.textContent = "Humidity: " + weatherconditions.humidity + "%";
    cDetailsList.appendChild(currentHumidity);

    // make list item for uv index 
    var currentUVIndex = document.createElement("li");
    // make a span to use for the uv index text colour change
    var spanUV = document.createElement("span");
    spanUV.setAttribute("id", "uvi-span");

    // set variable for uv index so it's easier to read the code later
    let uvi = weatherconditions.uv;

    currentUVIndex.classList = "list-group-item";
    currentUVIndex.innerHTML = "UV Index: ";
    // create colour change of uv index text depending on its value
    spanUV.innerHTML = uvi;
        if (uvi < 3) {
            spanUV.style.backgroundColor = "greenyellow";
        } else if (uvi > 3 && uvi < 6) {
            spanUV.style.backgroundColor = "gold";
        } else if (uvi > 6 && uvi < 8) {
            spanUV.style.backgroundColor = "orange";
        }  else if (uvi > 8 && uvi < 11) {
            spanUV.style.backgroundColor = "red";
            spanUV.style.color = "white";
        } else {
            spanUV.style.backgroundColor = "purple";
            spanUV.style.color = "white";
        }
    // add the span to the li and then append the whole thing to ul
    currentUVIndex.appendChild(spanUV);
    cDetailsList.appendChild(currentUVIndex);

    // make list item for current wind speed and append
    var currentWind = document.createElement("li");
    currentWind.classList = "list-group-item";
    currentWind.textContent = "Wind speed: " + weatherconditions.wind + "m/s";
    cDetailsList.appendChild(currentWind);

    // add ul to right column
    columnRight.appendChild(cDetailsList);

    // add columns to the row
    wdcRow.appendChild(columnLeft);
    wdcRow.appendChild(columnRight);

    // add row to the bounding box; add bounding box to area
    weatherDetailsContainer.appendChild(wdcRow);
    weatherDisplayArea.appendChild(weatherDetailsContainer);
}

// display forecast for next five days
function displayForecast(daily) {
    // clear display area
    forecastDisplayArea.textContent = "";

    // 'fd' prefex means 'forecast display'

    // make row 
    var fdRow = document.createElement("div");
    fdRow.classList = "row row-cols-1 row-cols-md-3 row-cols-lg-5 g-2";
    forecastDisplayArea.appendChild(fdRow);

    // creating display for forecast for next five days

    // first make sure index of data from 'daily' is 1-5 (tomorrow = [1], day after = [2], day after that = [3], etc)
    for (var i = 1; i < 6; i++) {
        // for each [i], make a container div to hold cards
        var fdContainer = document.createElement("div");
        fdContainer.classList = "col";
        fdRow.appendChild(fdContainer);

        // make a card div to hold content
        var forecastCard = document.createElement("div");
        forecastCard.classList = "card h-100";
        fdContainer.appendChild(forecastCard);

        // make a card body div to add in the content
        var cardBody = document.createElement("div");
        // add flex to card body to align items vertically and in the centre
        cardBody.classList = "card-body d-flex flex-column align-items-center";
        forecastCard.appendChild(cardBody);

        // make the title for each card be the subsequent dates
        var futureDate = displayDate(daily[i].dt);
        var futureDateTitle = document.createElement("h6");
        futureDateTitle.textContent = futureDate;
        cardBody.append(futureDateTitle);

        // make icon url for the future forecasts
        var futureIconCode = daily[i].weather[0].icon;
        var futureIconUrl = "https://openweathermap.org/img/wn/" + futureIconCode + ".png";

        // create variables with readable names according to each day's weather values
        var futureWeatherDesc = daily[i].weather[0].description;
        var futureMinTemp = daily[i].temp.min;
        var futureMaxTemp = daily[i].temp.max;
        var futureHumidity = daily[i].humidity;
        var futureWind = daily[i].wind_speed;

        // make an array for each day using the above variables
        var futureDetails = [
            capitaliseFirstLetter(futureWeatherDesc),
            "Min Temp: " + round(futureMinTemp) + "°C",
            "Max Temp: " + round(futureMaxTemp) + "°C",
            "Humidity: " + futureHumidity + "%",
            "Wind: " + futureWind + "m/s"
        ]

        // add the icon to the card
        var futureIcon = document.createElement("img");
        futureIcon.setAttribute("src", futureIconUrl);
        futureIcon.setAttribute("alt", daily[i].weather[0].main);
        futureIcon.setAttribute("id", "future-forecast-icon");
        cardBody.appendChild(futureIcon);

        // 'f' prefix means 'future (weather)'

        // make a list to add in the weather conditions
        var fDetailsList = document.createElement("ul");
        fDetailsList.classList = "list-group list-group-flush";
        fDetailsList.setAttribute("id", "future-details-list");

        // create a list item for each of the future details array and append to the ul
        futureDetails.forEach(function(element) {
            var listItem = document.createElement("li");
            listItem.classList = "list-group-item";
            listItem.textContent = element;
            fDetailsList.appendChild(listItem);
        })
        // append ul to the card
        cardBody.appendChild(fDetailsList);
    }

}

function init() {
    loadSearchHistory();
}

submitButton.addEventListener("click", submitUserInput);
clearButton.addEventListener("click", clearSearchHistory);

init();