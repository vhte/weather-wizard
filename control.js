function get_weather_data(cities_ids) {
    const XHR = new XMLHttpRequest();
    XHR.open("POST", "http://localhost:8000/")
    XHR.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    return XHR.send(encodeURIComponent(cities_ids))
}

window.addEventListener('DOMContentLoaded', (event) => {
    const selectElement = document.querySelector("#country");
    const currentCountry = document.querySelector("#country_label");
    currentCountry.textContent = selectElement.options[0].textContent;
    const cities = document.querySelector("#cities");

        selectElement.addEventListener("change", (event) => {
            while(cities.firstChild) cities.removeChild(cities.firstChild);

            // pick selected country
            const country = selectElement.options[selectElement.selectedIndex];
            currentCountry.textContent = country.textContent;

            // get from json
            fetch("cities.json").then((response) => {
                return response.json();
            }).then((json) => {
                // POST
                post_result = get_weather_data(json["countries"][country.value].map(city => city[0]))
                console.log(post_result)

                // Enumerate cities
                for(let i = 0;i < json["countries"][country.value].length;i++) {
                    let elem = document.createElement("li");
                    elem.appendChild(document.createTextNode(json["countries"][country.value][i][1] + ": TODO"));
                    cities.appendChild(elem);
                };
            });

        });
});