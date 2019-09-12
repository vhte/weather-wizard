class NeuralNetwork:
    """
    NeuralNetwork

    Temperature[k]|Humidity[%]|Temp(max/min)|Wind[m/s]|Rain[mm]|Snow[mm]|Cloud[%](?)|Pressure[hPa](?)
    """
    VEHICLES = ["walk", "run", "bike", "bus", "car", "boat"]

    def __init__(self):
        pass

    def classify(self, vehicle, weather):
        if vehicle not in self.VEHICLES:
            raise NeuralException("Vehicle " + vehicle + " was not found in defined vehicle list: " + self.VEHICLES)

        # Adding a simple condition for test purposes
        if weather["main"]["temp_min"] <= 280 and vehicle == "bike":
            classification = "It's cold. Don't go by bike."
        else:
            classification = "It's good to go by bike."

        return classification


class NeuralException(Exception):
    def __init__(self, message):
        super().__init__(message)
        self.__message = message

    def get_message(self):
        return self.__message
