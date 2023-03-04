FROM ubuntu:18.04

ARG anchor_version
ENV _BUILD_ANCHOR_VERSION=$anchor_version

WORKDIR /app

COPY ./repo ./

SHELL ["/bin/bash", "-c"]
CMD /app/install.sh
