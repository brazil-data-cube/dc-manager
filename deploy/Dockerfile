#
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

ARG GIT_COMMIT
ARG BASE_IMAGE=node:16-bullseye
FROM ${BASE_IMAGE} AS node

LABEL "org.repo.maintainer"="Brazil Data Cube <brazildatacube@inpe.br>"
LABEL "org.repo.title"="Docker image for Data Cube Builder GUI"
LABEL "org.repo.description"="Docker image for Data Cube Builder Graphical User Interface."
LABEL "org.repo.git_commit"="${GIT_COMMIT}"

# Build arguments
## Base URL for image. Defaults to "/"
ARG DC_MANAGER_BASE_URL=/

# Add sources into container and build
COPY ./data-cube-manager /build/data-cube-manager

WORKDIR /build/data-cube-manager

RUN npm install && \
    npm run build -- --configuration production --base-href ${DC_MANAGER_BASE_URL}


# Final small image
FROM python:3.11-alpine

# Build arguments
ARG DC_MANAGER_VERSION="1.0.0"
ARG DC_MANAGER_INSTALL_PATH="/opt/dc-manager/${DC_MANAGER_VERSION}"
ENV DC_MANAGER_BASE_URL="/"
ENV DC_MANAGER_VERSION=${DC_MANAGER_VERSION}
ENV DC_MANAGER_INSTALL_PATH=${DC_MANAGER_INSTALL_PATH}
# Defaults to local mode (on-premise services). Use "cloud" for AWS setup.
ENV DC_MANAGER_MODE=local

COPY --from=node /build/deploy/dist ${DC_MANAGER_INSTALL_PATH}
COPY ./deploy/app.py ${DC_MANAGER_INSTALL_PATH}

WORKDIR ${DC_MANAGER_INSTALL_PATH}

RUN pip install flask gunicorn beautifulsoup4 --no-cache-dir

EXPOSE 8080

CMD ["gunicorn", "-w4", "--bind", "0.0.0.0:8080", "app:app", "--max-requests=256"]