import http.server
import json
from weatherwizard import WeatherWizard


class Handler(http.server.BaseHTTPRequestHandler):
    __encoding = "utf-8"

    def header(self):
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

    def do_GET(self):
        self.header()
        self.wfile.write(b"<html><body><h1>Accepting only POST in /</h1></body></html>")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        self.header()
        content_length = int(self.headers["Content-Length"])
        post_data = self.rfile.read(content_length)
        # str bytes to list
        cities_ids = post_data.decode("utf-8").strip("[]").split(",")

        ww = WeatherWizard()
        result = []
        for city in cities_ids:
            ww.set_city(city)
            result.append(ww.weather(search_alerts=True))

        self.wfile.write(bytes(json.dumps(result), self.__encoding))


httpd = http.server.HTTPServer(("localhost", 8000), Handler)
try:
    print("Server running ...")
    httpd.serve_forever()
except KeyboardInterrupt:
    pass
httpd.server_close()
print("Server aborted.")
