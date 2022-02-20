FROM denoland/deno:ubuntu as test
ENV LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8 DEBIAN_FRONTEND=nointeractive

RUN apt update && apt install -y osmium-tool

LABEL maintainer="dr2p@codeplaydata.com" \
      schema.license="Apache-2.0 License"

WORKDIR /tesa

COPY . .

CMD [ "deno", "teste", "-A" ]