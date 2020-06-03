import requests
import untangle

from alerts.interface import AlertsInterface

"""
USA Public Weather Alerts
"""


class USAPublicWeather(AlertsInterface):
    KEY_VARIABLE = "lat=%LAT%&lon=%LON%"
    XML_FEED_MODEL = (
        "https://forecast.weather.gov/MapClick.php?{}&FcstType=dwml".format(KEY_VARIABLE)
    )
    NO_ALERT_MESSAGE = ""

    def __init__(self, lat_lon):
        self._id = lat_lon  # type: List

        if type(self._id) is not list:
            raise Exception("Public alert type of {} must be list".format(self._id))

        self._url = self.XML_FEED_MODEL.replace(
            self.KEY_VARIABLE,
            self.KEY_VARIABLE.replace("%LAT%", str(self._id[0])).replace(
                "%LON%", str(self._id[1])
            ),
        )

        response = requests.get(self._url)
        if response:
            parse = untangle.parse(response.text)
            if hasattr(parse.dwml.data[0].parameters, "hazards"):
                hazards = parse.dwml.data[0].parameters.hazards
                if isinstance(hazards, list):
                    self._title = ", ".join(
                        [
                            hazard.hazard_conditions.hazard["headline"]
                            for hazard in hazards
                        ]
                    )
                    self._summary = ", ".join(
                        [
                            hazard.hazard_conditions.hazard.hazardTextURL.cdata
                            for hazard in hazards
                        ]
                    )
                else:
                    self._title = parse.dwml.data[0].parameters.hazards.hazard_conditions.hazard["headline"]
                    self._summary = parse.dwml.data[0].parameters.hazards.hazard_conditions.hazard.hazardTextURL.cdata
            else:
                self._title = ""
                self._summary = ""
        else:
            raise Exception("Couldn't retrieve alert data for {}.".format(self._id))

    def has_alert(self):
        if not self._title:
            return False
        return True

    def get_message(self):
        return self._summary
