"""
خادم بايثون المحلي لتشغيل تطبيق كازو (KAZO Betting App)
يقوم بفتح التطبيق في المتصفح الافتراضي مباشرة وتوفير منفذ محلي.
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def main():
    os.chdir(DIRECTORY)
    
    # محاولة العثور على منفذ متاح إذا كان 8080 مشغولاً
    port = PORT
    for attempt in range(10):
        try:
            with socketserver.TCPServer(("", port), Handler) as httpd:
                url = f"http://localhost:{port}/index.html"
                print("=" * 60)
                print(f"🚀 تم تشغيل تطبيق كازو (KAZO) بنجاح!")
                print(f"🌐 الرابط المحلي: {url}")
                print(f"📁 المجلد: {DIRECTORY}")
                print("=" * 60)
                print("اضغط Ctrl+C لإيقاف الخادم.")
                
                # فتح المتصفح تلقائياً
                try:
                    webbrowser.open(url)
                except Exception:
                    pass
                
                httpd.serve_forever()
                break
        except OSError:
            port += 1
            continue

if __name__ == "__main__":
    main()
