// authentication key for Open Weather API
var weatherAPIkey = "70ae3d7cda7e676a90d911c1ff2798ed";

var cityNameDisplayArea = document.querySelector("#city-name-display");
var todaysDateArea = document.querySelector("#todays-date-display");
var weatherDisplayArea = document.querySelector("#weather-display");

var submitButton = document.querySelector("#get-weather-button");


// submit user input: convert city name to long & lat for weather API
function submitUserInput(event) {
    event.preventDefault();

    var city = document.querySelector("#city-name");
    city = city.value.trim();
    // console.log(city);

    if (!city) {
        alert("Please write a valid city name.");
    } else {
        geocodeTheCity(city);
        city.textContent = "";
        city.value = "";
    }
}

// convert city name to latitude and longitude values
function geocodeTheCity(location) {
    var geocodeUrl = "http://api.openweathermap.org/geo/1.0/direct?q=" + location + "&appid=" + weatherAPIkey;

    // console.log(geocodeUrl);

    fetch(geocodeUrl)
        .then(function (response) {
            if (!response.ok) {
                throw response.json();
            } else {
                return response.json();
            }
        })
        .then(function (data) {
            // console.log(data);

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
function displayCityName(localName, countryCode) {
    // console.log("city: " + localName + ", country: " + countryCode);

    cityNameDisplayArea.textContent = "";

    var title = document.createElement("h3");
    title.append("Today's weather in " + localName + ", " + countryCode);

    cityNameDisplayArea.appendChild(title);
}

// grab weather data from the city at specified latitude/longitude
function getWeatherDetails(lat, lon) {
    // console.log("lat: " + lat + " lon: " + lon);

    var queryUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly" + "&appid=" + weatherAPIkey + "&units=metric";

    // console.log(queryUrl);

    fetch(queryUrl)
        .then(function (response) {
            if (!response.ok) {
                throw response.json();
            } else {
                return response.json();
            }
        })
        .then(function (data) {
            // console.log(data);

            // extract icon data and make a url for it
            var iconCode = data.current.weather[0].icon;
            var iconUrl = "http://openweathermap.org/img/wn/" + iconCode + "@2x.png";

            // console.log(iconUrl);

            // extract weather description data and run capitalise the first letter of first word
            var description = data.current.weather[0].description;
                function capitaliseFirstLetter(str) {
                    let capitalised = str.charAt(0).toUpperCase() + str.slice(1);
                    return capitalised;
                }

            var weatherDesc = capitaliseFirstLetter(description);
            var temperature = data.current.temp;
            var uvIndex = data.current.uvi;
            var humidity = data.current.humidity;
            var windSpeed = data.current.wind_speed;

            var currentTimestamp = data.current.dt;
            var daily = data.daily;

            convertTimestamp(currentTimestamp);
            displayTheWeather(iconUrl, weatherDesc, temperature, uvIndex, humidity, windSpeed);
            displayForecast(daily);
            
        })
        .catch(function (error) {
            console.log(error);
        })
}

// to round a number to the nearest decimal point (or whole number)
function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

// convert the unix timestamp into a readable date
function convertTimestamp(stamp) {
    // console.log("stamp " + stamp);
    var currentDay = new Date(stamp * 1000);

    // console.log("currentday " + currentDay);

    var year = currentDay.getFullYear();
    var month = ("0" + (currentDay.getMonth() + 1)).slice(-2);
    var day = ("0" + currentDay.getDate()).slice(-2);

    // console.log("day " + day);

    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    var dayOfTheWeek = days[currentDay.getDay()];

    date = dayOfTheWeek + " " + day + "-" + month + "-" + year;

    displayTodaysDate(date);
}

function displayTodaysDate(date) {
    todaysDateArea.textContent = "";

    var titleDate = document.createElement("h5");
    titleDate.textContent = date;
    todaysDateArea.appendChild(titleDate);
}

// display the weather results
function displayTheWeather(icon, desc, temp, uv, humidity, wind) {
    weatherDisplayArea.textContent = "";

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
    var columnThree = document.createElement("div");
    columnThree.classList = "col-6";
    columnThree.textContent = "Current temp: " + round(temp, 1) + " °C";
    rowTwo.appendChild(columnThree);

    // create element for humidity and append to display
    var columnFour = document.createElement("div");
    columnFour.classList = "col-6";
    columnFour.textContent = "Humidity: " + humidity + "%";
    rowTwo.appendChild(columnFour);

    weatherDisplayArea.appendChild(rowTwo);

    // create third row for uv index and wind speed
    var rowThree = document.createElement("div");
    rowThree.classList = "row";

    // create element for uv index and append to display
    var columnFive = document.createElement("div");
    columnFive.classList = "col-6";
    columnFive.innerHTML = "UV Index: " + "<span id='uvi-span'>" + colourChange(uv) + "</span>";
    rowThree.appendChild(columnFive);

    // create element for wind speed and append to display
    var columnSix = document.createElement("div");
    columnSix.classList = "col-6";
    columnSix.textContent = "Wind speed: " + wind + " m/s";
    rowThree.appendChild(columnSix);

    weatherDisplayArea.appendChild(rowThree);
}

function colourChange(uv) {
    var uvispan = document.getElementById("uvi-span");
    if (uv > 1) {
        uvispan.style.backgroundColor = "red";
        console.log(uv);
    } else {
        console.log(uv);
    }

}

// display forecast for next five days
function displayForecast(daily) {
    console.log(daily)
}

submitButton.addEventListener("click", submitUserInput);