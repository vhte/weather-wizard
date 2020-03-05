function get_weather_data(cities_ids) {
    return new Promise((resolve, reject) => {
        const XHR = new XMLHttpRequest();
        XHR.open("POST", "http://localhost:8000/");
        XHR.setRequestHeader("Content-type", "application/json");
        //return XHR.send(encodeURIComponent(cities_ids))
        XHR.onload = function(e) {
            if(XHR.readyState === 4)
                if(XHR.status === 200)
                    resolve(JSON.parse(XHR.responseText));
                else
                    console.error(XHR.statusText);
                    reject(XHR.statusText);
        }
        XHR.send(JSON.stringify(cities_ids));
    });
}

function weather_text(data) {
    let name = document.createElement("h3");
    name.textContent = data["city"];

    let temperature = document.createElement("p");
    temperature.textContent = "Temperature: ";
    let value = document.createElement("span");
    value.textContent = data["temperature"] + "ºC";
    temperature.appendChild(value);

    let wind = document.createElement("p");
    wind.textContent = "Wind: ";
    value = document.createElement("span");
    value.textContent = data["wind"] + "km/h";
    wind.appendChild(value);

    let feels_like = document.createElement("p");
    feels_like.textContent = "Feels like: ";
    value = document.createElement("span");
    value.textContent = data["feels_like"] + "ºC";
    feels_like.appendChild(value);

    return [name, temperature, wind, feels_like];
}

window.addEventListener('DOMContentLoaded', (event) => {
    const selectElement = document.querySelector("#country");
    const currentCountry = document.querySelector("#country_label");
    currentCountry.textContent = selectElement.options[0].textContent;
    const cities = document.querySelector("#cities");

    selectElement.addEventListener("change", (event) => {
        while(cities.children.length > 1) cities.removeChild(cities.firstChild);
        cities.children[0].textContent = "Loading ..."; // investigate why firstChild doesn't work well

        // pick selected country
        const country = selectElement.options[selectElement.selectedIndex];
        currentCountry.textContent = country.textContent;

        // get from json
        fetch("cities.json").then((response) => {
            return response.json();
        }).then((json) => {
            const country_cities = json["countries"][country.value]
            // POST
            get_weather_data(country_cities.map(city => city[0])).then((post_result) => {
                console.log(post_result);
                cities.removeChild(cities.children[0]);
                // Enumerate cities
                for(let i = 0;i < post_result.length;i++) {
                    let elem = document.createElement("li");
                    elem.classList.add(post_result[i]["animation"]);
                    let weather = weather_text(post_result[i]);
                    for(let j = 0;j < weather.length;j++)
                        elem.appendChild(weather[j]);

                    cities.appendChild(elem);
                }
            });
        });
    });

    // Trigger manually a change event
    var event = new Event('change');
    selectElement.dispatchEvent(event);
});