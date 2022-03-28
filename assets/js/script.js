// authentication key for Open Weather API
var weatherAPIkey = "70ae3d7cda7e676a90d911c1ff2798ed";



var cityDisplayArea = document.querySelector("#city-name-display");
var previousSearchesArea = document.querySelector("#previous-searches");

var todaysDateArea = document.querySelector("#todays-date-display");
var weatherDisplayArea = document.querySelector("#weather-display");
var forecastDisplayArea = document.querySelector("#forecast-display");

var submitButton = document.querySelector("#get-weather-button");


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
    cityDisplayArea.textContent = "";
    cityDisplayArea.textContent = cityName + ", " + countryCode;
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

    // make some buttons for the user input
    let searchedCityButton = document.createElement("button");
    searchedCityButton.setAttribute("class", "search-history-button");
    searchedCityButton.textContent = savedCity.chosenCity;
    searchedCityButton.value = savedCity.chosenCity;

    // add the button
    previousSearchesArea.appendChild(searchedCityButton);

    // when the button is clicked, use the value of the clicked button (city name) to fetch the weather data
    searchedCityButton.addEventListener("click", function(event) {
        let searchedCity = event.target.value;
        geocodeTheCity(searchedCity);
    })

}

// retrieving from local storage
function loadSearchHistory() {
    // grab the data out of local storage
    var data = JSON.parse(localStorage.getItem("searchHistory"));
    console.log(data);
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
            console.log(searchedCity);
            geocodeTheCity(searchedCity);
        })
    }
}

// grab weather data from the city at specified latitude/longitude
function getWeatherDetails(lat, lon) {
    // originally https
    var queryUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly" + "&appid=" + weatherAPIkey + "&units=metric";

    fetch(queryUrl)
        .then(function (response) {
            if (!response.ok) {
                throw response.json();
            } else {
                return response.json();
            }
        })
        .then(function (data) {
            // extract icon data and make a url for it
            var iconCode = data.current.weather[0].icon;
            // http => https
            var iconUrl = "https://openweathermap.org/img/wn/" + iconCode + "@2x.png";

            // extract weather description data and run capitalise the first letter of first word
            var weatherDesc = data.current.weather[0].description;

            var description = capitaliseFirstLetter(weatherDesc);
            var temp = data.current.temp;
            var uv = data.current.uvi;
            var humidity = data.current.humidity;
            var wind = data.current.wind_speed;

            var currentTimestamp = data.current.dt;
            var daily = data.daily;

            convertTimestamp(currentTimestamp);
            displayTheWeather(iconUrl, description, temp, uv, humidity, wind);
            displayForecast(daily);
            
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

// to round a number to the nearest decimal point (or whole number)
function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

// convert the unix timestamp into a readable date
function convertTimestamp(timestamp) {
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

// display today's date in the current weather area
function displayDate(date) {
    todaysDateArea.textContent = "";

    var titleDate = document.createElement("h5");
    titleDate.textContent = date;
    todaysDateArea.appendChild(titleDate);
}

// display the weather results
function displayTheWeather(icon, desc, temp, uv, humidity, wind) {
    weatherDisplayArea.textContent = "";

    // first display the current date
    displayDate(date);

    // create first row for icon and weather description display
    var rowOne = document.createElement("div");
    rowOne.classList = "row";

    // create element for icon and append to display
    var columnOne = document.createElement("div");
    columnOne.classList = "col-12";
    // make weather icon as image
    var weatherIcon = document.createElement("img");
    weatherIcon.setAttribute("src", icon);
    columnOne.append(weatherIcon);
    columnOne.append(" " + desc);

    rowOne.appendChild(columnOne);

    weatherDisplayArea.appendChild(rowOne);

    // create second row for temp and humidity
    var rowTwo = document.createElement("div");
    rowTwo.classList = "row";

    // create element for current temp and append to display
    var columnTwo = document.createElement("div");
    columnTwo.classList = "col-6";
    columnTwo.textContent = "Current temp: " + round(temp, 1) + "°C";
    rowTwo.appendChild(columnTwo);

    // create element for humidity and append to display
    var columnThree = document.createElement("div");
    columnThree.classList = "col-6";
    columnThree.textContent = "Humidity: " + humidity + "%";
    rowTwo.appendChild(columnThree);

    weatherDisplayArea.appendChild(rowTwo);

    // create third row for uv index and wind speed
    var rowThree = document.createElement("div");
    rowThree.classList = "row";

    // create element for uv index and append to display
    var columnFour = document.createElement("div");
    var spanUV = document.createElement("span");

    columnFour.classList = "col-6";
    columnFour.innerHTML = "UV Index:";
    spanUV.innerHTML = " " + uv;
        if (uv < 3) {
            spanUV.style.backgroundColor = "greenyellow";
        } else if (uv > 3 && uv < 6) {
            spanUV.style.backgroundColor = "yellow";
        } else if (uv > 6 && uv < 8) {
            spanUV.style.backgroundColor = "orange";
        }  else if (uv > 8 && uv < 11) {
            spanUV.style.backgroundColor = "red";
        } else {
            spanUV.style.backgroundColor = "plum";
        }
    
    columnFour.appendChild(spanUV);
    rowThree.appendChild(columnFour);

    // create element for wind speed and append to display
    var columnFive = document.createElement("div");
    columnFive.classList = "col-6";
    columnFive.textContent = "Wind speed: " + wind + "m/s";
    rowThree.appendChild(columnFive);

    weatherDisplayArea.appendChild(rowThree);
 
}

// display forecast for next five days
function displayForecast(daily) {
    forecastDisplayArea.textContent = "";

    var cardRow = document.createElement("div");
    cardRow.classList = "row row-cols-1 row-cols-md-3 row-cols-lg-5 g-4";
    forecastDisplayArea.appendChild(cardRow);

    for (var i = 1; i < 6; i++) {
        var cardContainer = document.createElement("div");
        cardContainer.classList = "col";
        cardRow.appendChild(cardContainer);

        var forecastCard = document.createElement("div");
        forecastCard.classList = "card h-100";
        cardContainer.appendChild(forecastCard);

        var cardBody = document.createElement("div");
        cardBody.classList = "card-body";
        forecastCard.appendChild(cardBody);

        var futureDate = convertTimestamp(daily[i].dt);
        cardBody.textContent = futureDate;

        // create a whole bunch of variables for each day's weather values
        var futureIconCode = daily[i].weather[0].icon;
        var futureIconUrl = "https://openweathermap.org/img/wn/" + futureIconCode + ".png";

        var futureWeatherDesc = daily[i].weather[0].description;
        var futureTemp = daily[i].temp.max;
        var futureHumidity = daily[i].humidity;
        var futureWind = daily[i].wind_speed;

        // make an array for each day that shows
        var futureDetails = [
            capitaliseFirstLetter(futureWeatherDesc),
            "Max Temp: " + round(futureTemp, 1) + "°C",
            "Humidity: " + futureHumidity + "%",
            "Wind: " + futureWind + "m/s"
        ]

        var futureIcon = document.createElement("img");
        futureIcon.setAttribute("src", futureIconUrl);
        futureIcon.setAttribute("id", "future-forecast-icon");
        cardBody.appendChild(futureIcon);

        var detailsList = document.createElement("ul");
        detailsList.classList = "list-group list-group-flush";
        detailsList.setAttribute("id", "future-details-list");

        futureDetails.forEach(function(element) {
            var listItem = document.createElement("li");
            listItem.classList = "list-group-item";
            listItem.textContent = element;
            detailsList.appendChild(listItem);
        })

        cardBody.appendChild(detailsList);
    }

}

function init() {
    loadSearchHistory();
}

submitButton.addEventListener("click", submitUserInput);

init();