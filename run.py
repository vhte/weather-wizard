import json
from weatherwizard import WeatherWizard

with open("cities.json", "r") as json_file:
    json_data = json.load(json_file)

for country in json_data["countries"]:
    print("Country: {}".format(country))
    for city in json_data["countries"][country]:
        print(city[0])

try:
    ww = WeatherWizard()
    for city in json_data["countries"]["CA"]:
        print("BR city {} current weather: ".format(city[1]))
        ww.set_city(city[0])
        weather = ww.weather()
        print("Temperature: {}ºC\nWind: {}km/h\nFeels like: {}ºC".format(weather["temperature"], weather["wind"], weather["feels_like"]))
except Exception as e:
    print("Error when trying to fetch weather for city {}: {}".format(city[1], e))

print("--- End of execution --")

