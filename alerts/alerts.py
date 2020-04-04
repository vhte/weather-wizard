import json

from .interface import AlertsInterface
from .canada import CanadaPublicWeather


class Alerts(AlertsInterface):
    """
    Searches for public weather alerts over cities

    Alerts are controlled by a public agency in each country.
    """

    CITIES_DATA = "cities.json"

    def __init__(self, _id):
        self._id = int(_id)
        country, agency_city_id = self._get_country()
        self._country = country
        if self._country == "CA":
            self._agency = CanadaPublicWeather(agency_city_id)
        else:
            pass
            # TODO US, BR
            # raise Exception("Country {} not found in json file.".format(self._country))

    def _get_country(self):
        with open(self.CITIES_DATA, "r") as json_file:
            json_data = json.load(json_file)
            for country in json_data["countries"]:
                alert_id = [agency_city_id for _id, _, __, agency_city_id in json_data["countries"][country] if _id == self._id]
                if alert_id:
                    return country, alert_id[0]

        raise Exception("Country didn't found for ID {}.".format(self._id))

    def has_alert(self):
        return self._agency.has_alert()

    def get_message(self):
        return self._agency.get_message()
