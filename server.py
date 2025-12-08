import http.server
import socketserver
import webbrowser
import os

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def translate_path(self, path):
        # Map /textures/ to /public/textures/
        if path.startswith('/textures/'):
            path = '/public' + path
        return super().translate_path(path)

print(f"Starting server at http://localhost:{PORT}")
print("Press Ctrl+C to stop.")

# Open browser automatically
webbrowser.open(f"http://localhost:{PORT}")

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\nServer stopped.")
