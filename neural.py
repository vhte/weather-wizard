class NeuralNetwork:
    """
    NeuralNetwork

    Temperature[k]|Humidity[%]|Temp(max/min)|Wind[m/s]|Rain[mm]|Snow[mm]|Cloud[%](?)|Pressure[hPa](?)
    """
    VEHICLES = ["walk", "run", "bike", "bus", "car", "boat"]

    def __init__(self):
        pass

    def classify(self, vehicle, weather):
        """
        Classifies if using "vehicle" during "weather" is a good decision

        Ags
            vehicle (str): Which vehicle user is using to transit. See VEHICLES
            weather (dict): The result in JSON of current weather method got from OpenWeather
        Returns
            classification (bool): If the combination of arguments is a good match
        """
        if vehicle not in self.VEHICLES:
            raise NeuralException("Vehicle " + vehicle + " was not found in defined vehicle list: " + self.VEHICLES)

        # Adding a simple condition for test purposes
        if weather["main"]["temp_min"] <= 280 and vehicle == "bike":
            classification = True
        else:
            classification = False

        return classification


class NeuralException(Exception):
    def __init__(self, message):
        super().__init__(message)
        self.__message = message

    def get_message(self):
        return self.__message
