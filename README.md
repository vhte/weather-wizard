# Weather Wizard
This project is a Single Page Application which shows the overall weather over a given country at current time.
It also captures public weather alerts from government data.

A live demo is available at [https://victortorr.es/weather-wizard/](https://victortorr.es/weather-wizard/).

## Data
This project uses data from [OpenWeather](https://openweathermap.org/) and searches for public alerts from the following entities:
- [Environment Canada (Canada)](https://weather.gc.ca/)
- [National Weather Service (USA)](https://www.weather.gov/)


The file ```cities.json``` holds all the data for search. This file has the following format:

| OpenWeather ID | City Name | [Lat, Long] | Public Agency ID (for alerts) |
| --- | --- | --- | --- |
| 6167865 | "Toronto" | [43.7,-79.42] | "on-143" |


## Functionalities

Weather is computed from OpenWeather API.

### Installation
An API key from [OpenWeather](https://openweathermap.org/appid) is required and it should be saved as ```api.key``` in the root folder.

Create an virtual environment:
```
virtualenv .venv
```

Run the `setup.py` file and project will be ready to use:
```
python setup.py develop
```

### Usage
To get the weather of a specific city, an OpenWeather ID is required. Those IDs can be found at a [bulk samples page](http://bulk.openweathermap.org/sample/) or by using ```search_city()``` method:
```python
from openweather import OpenWeatherMap

#  Line below will show all existent Ottawas IDs (three in USA and one in Canada)
print([id_ for id_, country, coordinates in OpenWeatherMap.search_city("Ottawa")])
```

After picking an ID, the weather resume method can be called like the following example:
```python
from weatherwizard import WeatherWizard

ww = WeatherWizard(6094817)  # Ottawa(CANADA)
print(ww.weather())
```
Alerts can be added to the weather method response by adding the ```search_alerts``` flag:
```python
ww.weather(search_alerts=True)
```
Not all countries have public weather interfaces for this functionality and therefore a console message will be printed instead of an exception (for now).

### Alerts
Alerts are computed from different public entities. It uses the same city ID (from OpenWeather) to search for any active alert.
Its implementation is quite similar the ```weather``` function:
```python
from alerts.alerts import Alerts

alert = Alerts(6167865)  # Toronto
if alert.has_alert():
    print(alert.get_message())
```  

## Interface
An HTML interface was designed for this project to display many cities from some countries.

A server should be running in order to accept requests from the interface:
```
python server.py 
```
Keep in mind that useful output can be printed when this process is open.

Open the ```index.html``` file to interact with available country data.