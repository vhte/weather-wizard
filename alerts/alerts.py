class Alerts:
    """
    Searches for public weather alerts over cities

    Alerts are controlled by a public agency in each country.

    TODO Coordinates should come from cities.json. This will also enable to search location with browser
    """
    def __init__(self, id):
        self._id = id
