// authentication key for Open Weather API
var weatherAPIkey = "70ae3d7cda7e676a90d911c1ff2798ed";

var cityNameDisplayArea = document.querySelector("#city-name-display");
var weatherDisplayArea = document.querySelector("#weather-display");

var submitButton = document.querySelector("#get-weather-button");


// submit user input: convert city name to long & lat for weather API
function submitUserInput(event) {
    event.preventDefault();

    var city = document.querySelector("#city-name");
    city = city.value.trim();
    console.log(city);

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

    console.log(geocodeUrl);

    fetch(geocodeUrl)
        .then(function (response) {
            if (!response.ok) {
                throw response.json();
            } else {
                return response.json();
            }
        })
        .then(function (data) {
            console.log(data);

            if (data.length === 0) {
                alert("Sorry, we couldn't find that city!\nPlease try again.");
                return;    
            } else {
                var lat = data[0].lat;
                var lon = data[0].lon;
                var cityName = data[0].name;
                var countryCode = data[0].country;
                displayCityName(cityName, countryCode);
                getWeather(lat, lon);
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

// display the city name and country
function displayCityName(localName, countryCode) {
    console.log("city: " + localName + ", country: " + countryCode);

    cityNameDisplayArea.textContent = "";

    var title = document.createElement("h3");
    title.append("Today's weather in " + localName + ", " + countryCode);

    cityNameDisplayArea.appendChild(title);
}

// grab weather data from the city at specified latitude/longitude
function getWeather(lat, lon) {
    console.log("lat: " + lat + " lon: " + lon);

    var queryUrl = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=" + weatherAPIkey + "&units=metric";

    console.log(queryUrl);

    fetch(queryUrl)
        .then(function (response) {
            if (!response.ok) {
                throw response.json();
            } else {
                return response.json();
            }
        })
        .then(function (data) {
            console.log(data);

            // extract icon data and make a url for it
            var iconCode = data.weather[0].icon;
            var iconUrl = "http://openweathermap.org/img/wn/" + iconCode + ".png";

            // extract weather description data and run capitalise the first letter of first word
            var description = data.weather[0].description;
                function capitaliseFirstLetter(str) {
                    let capitalised = str.charAt(0).toUpperCase() + str.slice(1);
                    return capitalised;
                }

            var weatherDesc = capitaliseFirstLetter(description);
            var temperature = data.main.temp;
            var feelsLike = data.main.feels_like;
            var humidity = data.main.humidity;
            var windSpeed = data.wind.speed;

            displayTheWeather(iconUrl, weatherDesc, temperature, feelsLike, humidity, windSpeed);
            
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

// display the weather results
function displayTheWeather(icon, desc, temp, feel, humidity, wind) {
    weatherDisplayArea.textContent = "";

    // create first row for icon and weather description display
    var rowOne = document.createElement("div");
    rowOne.classList = "row";

    // create element for icon and append to display
    var columnOne = document.createElement("div");
    columnOne.classList = "col-6";
    // make weather icon as image
    var weatherIcon = document.createElement("img");
    weatherIcon.setAttribute("src", icon);
    columnOne.append(weatherIcon);
    rowOne.appendChild(columnOne);

    // create element for weather description and append to display
    var columnTwo = document.createElement("div");
    columnTwo.classList = "col-6";
    columnTwo.textContent = desc;
    rowOne.appendChild(columnTwo);

    weatherDisplayArea.appendChild(rowOne);

    // create second row for temp and humidity
    var rowTwo = document.createElement("div");
    rowTwo.classList = "row";

    // create element for current temp and append to display
    var columnThree = document.createElement("div");
    columnThree.classList = "col-6";
    columnThree.textContent = "Current temperature: " + round(temp, 1) + " °C";
    rowTwo.appendChild(columnThree);

    // create element for humidity and append to display
    var columnFour = document.createElement("div");
    columnFour.classList = "col-6";
    columnFour.textContent = "Humidity: " + humidity + "%";
    rowTwo.appendChild(columnFour);

    weatherDisplayArea.appendChild(rowTwo);

    // create third row for 'temp it feels like' and wind speed
    var rowThree = document.createElement("div");
    rowThree.classList = "row";

    // create element for 'currently feels like' and append to display
    var columnFive = document.createElement("div");
    columnFive.classList = "col-6";
    columnFive.textContent = "Feels like: " + round(temp, 1) + " °C";
    rowThree.appendChild(columnFive);

    // create element for wind speed and append to display
    var columnSix = document.createElement("div");
    columnSix.classList = "col-6";
    columnSix.textContent = "Wind speed: " + wind + " m/s";
    rowThree.appendChild(columnSix);

    weatherDisplayArea.appendChild(rowThree);

}

submitButton.addEventListener("click", submitUserInput);