#!/usr/bin/env python3
"""Serve src locally with the same extensionless HTML routes as production."""

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "src"


class CleanURLHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        translated = super().translate_path(path)
        # Resolve /countries/greece before its detail-page directory, and
        # /countries/greece/itinerary before checking for a directory index.
        if not Path(translated).suffix and Path(translated + ".html").is_file():
            return translated + ".html"
        return translated


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    server = ThreadingHTTPServer(
        ("127.0.0.1", args.port), partial(CleanURLHandler, directory=str(ROOT)),
    )
    print(f"Serving Pareto Travel at http://127.0.0.1:{args.port}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
