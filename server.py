import http.server
import json
from urllib import parse


class Handler(http.server.BaseHTTPRequestHandler):
    __encoding = "utf-8"

    def header(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.send_header("Access-Control-Allow-Origin", "*")  # For cross POST using different ports
        self.end_headers()

    def do_GET(self):
        self.header()
        self.wfile.write(b"<html><body><h1>Accepting only POST</h1></body></html>")

    def do_POST(self):
        self.header()
        content_length = int(self.headers["Content-Length"])
        post_data = self.rfile.read(content_length)
        post_data = parse.parse_qs(post_data.decode(self.__encoding))
        self.wfile.write(bytes(json.dumps(post_data), self.__encoding))
        # r = requests.post("http://localhost:8000/", data={'foo': 'bar', 'weather': 'wizard'}) r.text


httpd = http.server.HTTPServer(("localhost", 8000), Handler)
try:
    print("Server running ...")
    httpd.serve_forever()
except KeyboardInterrupt:
    pass
httpd.server_close()
print("Server aborted.")
