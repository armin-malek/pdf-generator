FROM node:22

# We don't need the standalone Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update && apt-get install curl gnupg -y \
  && curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install google-chrome-stable -y --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# Install your app here...

# PDFGEN
ENV NODE_ENV=PRODUCTION





# Copying all the files in our project
COPY . .

# Installing dependencies
RUN npm install

RUN PUPPETEER_CACHE_DIR=/pdf-gen/.cache/puppeteer \
  npx puppeteer browsers install chrome@stable --install-deps

# RUN npx @puppeteer/browsers install chrome@stable

# Starting our application
CMD [ "node", "server.js" ]

# Exposing server port
EXPOSE 3000