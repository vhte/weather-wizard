from openweather import OpenWeatherMap
from weatherwizard import WeatherWizard
from alerts.alerts import Alerts

"""
This file is dummy model to test outputs from OpenWeather and Public Alerts
No test is associated nor this file should be placed on production
"""
city = 6167865

# ow = OpenWeatherMap()
# result = ow.action("weather", city)

# ww = WeatherWizard(city)
# result = ww.weather()

us = [
      [5128581, "New York", [40.7143, -74.006], [40.7143, -74.006]],
      [4140963, "Washington (DC)", [38.8951, -77.0364], [38.8951, -77.0364]],
      [4164138, "Miami", [25.7743, -80.1937], [25.7743, -80.1937]],
      [4887398, "Chicago", [41.85, -87.65], [41.85, -87.65]],
      [4644585, "Nashville", [36.1659, -86.7844], [36.1659, -86.7844]],
      [4335045, "New Orleans", [29.9547, -90.0751], [29.9547, -90.0751]],
      [5037649, "Minneapolis", [44.98, -93.2638], [44.98, -93.2638]],
      [4393217, "Kansas City", [39.0997, -94.5786], [39.0997, -94.5786]],
      [4671654, "Austin", [30.2672, -97.7431], [30.2672, -97.7431]],
      [5809844, "Seattle", [47.6062, -122.3321], [47.6062, -122.3321]],
      [5391959, "San Francisco", [37.7749, -122.4194], [37.7749, -122.4194]],
      [5368361, "Los Angeles", [34.0522, -118.2437], [34.0522, -118.2437]],
      [5554072, "Juneau", [58.3019, -134.4197], [58.3019, -134.4197]],
      [5856195, "Honolulu", [21.3069, -157.8583], [21.3069, -157.8583]]
    ]
for id_, name, coords, coords2 in us:
    alert = Alerts(id_)
    print(alert.has_alert())
    print(alert.get_message())

print("-- End --")
