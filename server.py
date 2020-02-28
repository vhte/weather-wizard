import http.server

class Handler(http.server.BaseHTTPRequestHandler):
    def do_HEAD(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        self.wfile.write(b"<html><body>test html</body></html>")

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        self.wfile.write(post_data)
        # r = requests.post("http://localhost:8000/", data={'foo': 'bar'}) r.text

PORT = 8000

server_class = http.server.HTTPServer
httpd = server_class(("localhost", 8000), Handler)
try:
    print("Server running ...")
    httpd.serve_forever()
except KeyboardInterrupt:
    pass
httpd.server_close()
