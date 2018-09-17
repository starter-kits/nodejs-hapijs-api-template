# ----------------------------------------------------------------------------------
# ---- Base Node -------------------------------------------------------------------
FROM node:8.11.3-alpine AS base
ARG APP_PATH=/opt/app

# Create app directory
WORKDIR ${APP_PATH}

# ----------------------------------------------------------------------------------
# ---- Production Dependencies with source ----------------------------------------------------------------
FROM base AS prod_build  

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
# install app dependencies excluding 'devDependencies'
RUN npm install --only=production
# .dockerignore files won't be copied
COPY . .

# ----------------------------------------------------------------------------------
# ---- Dependencies with source ----------------------------------------------------------------
FROM prod_build AS dev_build

# install global app dependencies for development
RUN npm install -g nodemon
# install app dependencies including 'devDependencies'
RUN npm install

# how to share `package-lock.json` from container to host in local development? so it would be available to commit into git repo.
# for now, keep package-lock.json in `.tmp`. Then copy from  ./.tmp/package-lock.json to ./package-lock.json at docker run time.
RUN mkdir -p ./.tmp && cp ./package-lock.json ./.tmp/package-lock.json

# ----------------------------------------------------------------------------------
# --- Release for Production -------------------------------------------------------
FROM node:8.11.3-alpine
ARG APP_PATH=/opt/app
ENV NODE_ENV=production

WORKDIR ${APP_PATH}

COPY --from=prod_build ${APP_PATH} ./

EXPOSE 3000
USER node
CMD ["node", "."]
