FROM hayd/ubuntu-deno as deno
ENV LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8 DEBIAN_FRONTEND=nointeractive

LABEL maintainer="dr2p@codeplaydata.com" \
      schema.license="Apache-2.0 License"

RUN apt-get update && apt-get install -y --no-install-recommends \
    git && \
    git clone https://github.com/CodePlayData/tesa.git

WORKDIR /tesa

RUN deno compile --unstable --output tesa_bin --allow-read --allow-write --allow-net to_bin.js


FROM ubuntu

WORKDIR /app
COPY --from=deno ./tesa/tesa_bin .
COPY --from=deno ./tesa/config.json .
RUN echo 'alias tesa="./tesa_bin"'>> ~/.bashrc && source ~/.bashrc
CMD [ "sh" ]

