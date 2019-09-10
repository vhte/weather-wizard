from weatherwizard import WeatherWizard
from neural import NeuralNetwork

ww = WeatherWizard(6325494) # Québec
print(ww.tomorrow_forecast())
print("--- End of execution --")

