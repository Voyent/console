# Voyent Admin Console

# This container is based on our Ember foundational image.  It then copies over
# and builds the app and sets it to be served via Nginx.

# The name:version of the Docker image to use.  Must be the first non-comment.
FROM voyent/ember:latest

# The author of the image.
MAINTAINER ICEsoft Technologies, Inc.

# We'll put everything in a /console directory that we can later remove when everything
# is built and deployed.
RUN mkdir /console
WORKDIR /console

# Copy the package.json and install any dependencies.
COPY package.json ./
RUN ["npm", "install"]

# Get all the stuff we need for the Console app.
COPY app ./app
COPY config ./config
COPY public ./public
COPY *.js *.json ./

# Install bower dependencies.
RUN ["bower", "--allow-root", "install"]

# Build the console with ember.
RUN ["ember", "build", "-prod"]

# Remove the Unix-y tools.
RUN apt-get remove -q -y curl xz-utils git-all

# Copy our custom nginx configurations.
COPY nginx.conf /etc/nginx/nginx.conf
COPY default /etc/nginx/conf.d/default.conf

# Copy the contents of the built version of the console so that nginx can serve it.
RUN mkdir /usr/share/nginx/html/console
RUN mv dist/* /usr/share/nginx/html/console

# Get rid of our work directory
WORKDIR /
RUN ["rm", "-Rf", "/console"]


