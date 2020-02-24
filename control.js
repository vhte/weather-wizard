window.addEventListener('DOMContentLoaded', (event) => {
    const selectElement = document.querySelector("#country");
    const currentCountry = document.querySelector("#country_label");
    currentCountry.textContent = selectElement.options[0].textContent;
    const cities = document.querySelector("#cities");

        selectElement.addEventListener("change", (event) => {
            while(cities.firstChild) cities.removeChild(cities.firstChild);

            currentCountry.textContent = selectElement.options[selectElement.selectedIndex].textContent;
            const elem = document.createElement("li");
            elem.appendChild(document.createTextNode("Get from json"));

            cities.appendChild(elem);
        });
});