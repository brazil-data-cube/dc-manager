# This file is part of Data Cube Manager.
# Copyright (C) 2023 INPE.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.
#

# This file represents a basic HTTP server for Angular app.
# It deals with base url internal in angular to avoid rebuild app in runtime.
# Make sure you have the following variables set
# - DC_MANAGER_VERSION: Version of current Data Cube Manager
# - DC_MANAGER_INSTALL_PATH: Path to the dist compiled files
#
# This file also generates "env.js" file in DC_MANAGER_INSTALL_PATH. You may pass this values using prefix "DC_MANAGER_":
# - DC_MANAGER_ITEM_PREFIX: Prefix for items in database
# - DC_MANAGER_ITEM_BASE_URL: Base HTTP url where files are served.
# - DC_MANAGER_MODE: Set context for DC-manager ("local" for on-premise services and "cloud" for AWS set up)

import os
from pathlib import Path

import bs4
from flask import Flask, send_file


app = Flask(__name__)
PACKAGE_DIR = os.getenv("DC_MANAGER_INSTALL_PATH")
BASE_URL = os.getenv("DC_MANAGER_BASE_URL", "/")
INDEX_HTML_PATH = Path(PACKAGE_DIR, "index.html")

if PACKAGE_DIR is None:
    raise RuntimeError("The variable 'DC_MANAGER_INSTALL_PATH' must be set, got None.")

if not INDEX_HTML_PATH.exists():
    raise IOError("Could not locate index.html in 'DC_MANAGER_INSTALL_PATH'. "
                  "Make sure to set 'DC_MANAGER_INSTALL_PATH' to the compiled module folder (dist).")


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def index(path):
    entry = Path(path)

    if entry.is_relative_to(BASE_URL):
        entry = entry.relative_to(BASE_URL)
    elif entry.is_relative_to(BASE_URL[1:]):
        entry = entry.relative_to(BASE_URL[1:])

    absolute = Path(PACKAGE_DIR) / entry

    if not absolute.exists() or not absolute.is_file():
        absolute = INDEX_HTML_PATH

    app.logger.debug(f"Path {path}, relative {str(entry)}, absolute {str(absolute)}")

    return send_file(str(absolute))


def setup_html():
    with open(INDEX_HTML_PATH) as fd:
        CONTENT = fd.read()


    soup = bs4.BeautifulSoup(CONTENT, 'html.parser')
    changed = False

    for link in soup.find_all(["base", "link", "script"]):
        href = link.get("href")
        if href and href.startswith("/") and not href.startswith(BASE_URL):
            link["href"] = f"{BASE_URL}{href[1:]}"
            changed = True
            continue

        src = link.get("src")
        if src and src.startswith("/") and not src.startswith(BASE_URL):
            link["src"] = f"{BASE_URL}{src[1:]}"
            changed = True

    if changed:
        print(f"Configuring HTML base URL to {BASE_URL}")
        with open(INDEX_HTML_PATH, "w") as fd:
            fd.write(str(soup))


def setup_env_file(base_dir: Path):
    source_env_file = base_dir / "env.txt"
    env_file = base_dir / "assets/env.js"

    with source_env_file.open():
        env_txt = source_env_file.read_text()

    for key, value in os.environ.items():
        if key.startswith("DC_MANAGER_"):
            env_txt = env_txt.replace(key, f'"{value}"')

    with env_file.open(mode="w"):
        env_file.write_text(env_txt)


def setup_app():
    setup_html()
    setup_env_file(Path(PACKAGE_DIR))

# Configure Application Context
setup_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
