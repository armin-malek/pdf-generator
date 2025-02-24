FROM ghcr.io/puppeteer/puppeteer:latest 



# Using Root to enable SYS_ADMIN capabilities (for running the browser in sandbox mode )
USER root 






# Setting up the work directory
WORKDIR /pdf-gen
# WORKDIR /home/pptruser

# COPY puppeteer-browsers-latest.tgz puppeteer-latest.tgz puppeteer-core-latest.tgz ./

ENV DBUS_SESSION_BUS_ADDRESS=autolaunch:


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

# RUN PUPPETEER_CACHE_DIR=/pdf-gen/.cache/puppeteer \
#   npx puppeteer browsers install chrome --install-deps


# set env variable ( due to issue talked about here https://github.com/puppeteer/puppeteer/issues/11023#issuecomment-1776247197)

ENV XDG_CONFIG_HOME=/tmp/.chromium
ENV XDG_CACHE_HOME=/tmp/.chromium

# Install browsers ( post-install scripts)
RUN npx puppeteer browsers install

# RUN npx @puppeteer/browsers install chrome@stable

# Starting our application
CMD [ "node", "server.js" ]

# Exposing server port
EXPOSE 3000