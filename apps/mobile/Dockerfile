FROM alpine:latest

WORKDIR /app

# Install curl (Alpine needs this to download files)
RUN apk add --no-cache curl

# Download the APK from your release URL
# Replace the URL below with your actual GitHub Release asset link
RUN curl -L -o client.apk "https://github.com/Area-Organization/main-area/releases/download/v1.0.0/client.apk"

# Create the directory for the shared volume
RUN mkdir -p /dist

# Copy downloaded file to volume and keep container alive
CMD cp /app/client.apk /dist/client.apk && tail -f /dev/null
