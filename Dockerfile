# ----------------------------------------------------------------------------------
# ---- Base Node -------------------------------------------------------------------
FROM node:8.11.3-alpine AS base
ARG APP_PATH=/opt/app

# Create app directory
WORKDIR ${APP_PATH}

# ----------------------------------------------------------------------------------
# ---- Production Dependencies ----------------------------------------------------------------
FROM base AS prod_dependencies  

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
# install app dependencies excluding 'devDependencies'
RUN npm install --only=production

# ----------------------------------------------------------------------------------
# ---- Production Dependencies with source ----------------------------------------------------------------
FROM prod_dependencies AS prod_build  

# .dockerignore files won't be copied
COPY . .

# ----------------------------------------------------------------------------------
# ---- Dependencies  ----------------------------------------------------------------
FROM prod_dependencies AS dev_dependencies

# install app dependencies including 'devDependencies'
RUN npm install

# ----------------------------------------------------------------------------------
# ---- Dependencies with source ----------------------------------------------------------------
FROM dev_dependencies AS dev_build

# how to share `package-lock.json` from container to host in local development? so it would be available to commit into git repo.
# for now, keep package-lock.json in `.tmp`. Then copy from  ./.tmp/package-lock.json to ./package-lock.json at docker run time.
RUN mkdir -p ./.tmp && cp ./package-lock.json ./.tmp/package-lock.json

COPY . .

# ----------------------------------------------------------------------------------
# --- Release for Production -------------------------------------------------------
FROM base AS production
ARG APP_PATH=/opt/app
ENV NODE_ENV=production

COPY --from=prod_build ${APP_PATH} ./

EXPOSE 3000
USER node
CMD ["node", "."]

# ----------------------------------------------------------------------------------
# --- Release for Local Development -------------------------------------------------------
FROM base AS local_dev
ARG APP_PATH=/opt/app
ENV NODE_ENV=development

# install global app dependencies for development
RUN npm install -g nodemon

COPY --from=dev_build ${APP_PATH} ./

EXPOSE 3000
USER node
# To make sure `package-lock.json` is available in host before start node app in local dev
CMD ["/bin/sh", "-c", "cp ./.tmp/package-lock.json ./package-lock.json && nodemon ."]
