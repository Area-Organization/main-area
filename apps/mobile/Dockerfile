FROM alpine:latest

WORKDIR /app

# We copy the pre-built APK from our local machine into the container
COPY client.apk /app/client.apk

# We then create the directory where the shared volume will be mounted
RUN mkdir -p /dist

# When the container starts, we copy the file to the shared volume
# Then keep the container running so Docker Compose doesn't think it crashed
CMD cp /app/client.apk /dist/client.apk && tail -f /dev/null
