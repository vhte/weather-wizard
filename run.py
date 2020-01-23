import json
from weatherwizard import WeatherWizard

with open("cities.json", "r") as json_file:
    json_data = json.load(json_file)

for country in json_data["countries"]:
    for city in json_data["countries"][country]:
        print(city)
"""
ww = WeatherWizard(6325494) # Québec
print(ww.weather())
"""
print("--- End of execution --")

