FROM node:22

ENV \
    # Configure default locale (important for chrome-headless-shell).
    LANG=en_US.UTF-8 \
    # UID of the non-root user 'pptruser'
    PPTRUSER_UID=10042

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chrome that Puppeteer
# installs, work.
RUN apt-get update \
    && apt-get install -y --no-install-recommends fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros \
    fonts-kacst fonts-freefont-ttf dbus dbus-x11

RUN  apt-get update &&  apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libnss3 lsb-release xdg-utils wget ca-certificates

# Add pptruser.
RUN groupadd -r pptruser && useradd -u $PPTRUSER_UID -rm -g pptruser -G audio,video pptruser

USER $PPTRUSER_UID

# Setting up the work directory
WORKDIR /pdf-gen
# WORKDIR /home/pptruser

# COPY puppeteer-browsers-latest.tgz puppeteer-latest.tgz puppeteer-core-latest.tgz ./

ENV DBUS_SESSION_BUS_ADDRESS autolaunch:


# Install @puppeteer/browsers, puppeteer and puppeteer-core into /home/pptruser/node_modules.
#RUN npm i ./puppeteer-browsers-latest.tgz ./puppeteer-core-latest.tgz ./puppeteer-latest.tgz \
#    && rm ./puppeteer-browsers-latest.tgz ./puppeteer-core-latest.tgz ./puppeteer-latest.tgz

# Install system dependencies as root.
USER root
# Overriding the cache directory to install the deps for the Chrome
# version installed for pptruser. 


# USER $PPTRUSER_UID


# PDFGEN
ENV NODE_ENV=PRODUCTION





# Copying all the files in our project
COPY . .

# Installing dependencies
RUN npm install

RUN PUPPETEER_CACHE_DIR=/pdf-gen.cache/puppeteer \
  npx puppeteer browsers install chrome --install-deps

# RUN npx @puppeteer/browsers install chrome@stable
RUN cd /pdf-gen.cache/puppeteer && ls -lh
# Starting our application
CMD [ "node", "server.js" ]

# Exposing server port
EXPOSE 3000