# Tanpa apt & tanpa kompilasi native: hanya butuh npm (atau node_modules dari host).
FROM node:22-bookworm-slim
ENV NODE_ENV=production NODE_NO_WARNINGS=1
ARG NPM_REGISTRY=https://registry.npmjs.org/
WORKDIR /app
COPY . /ctx
RUN set -e; cp /ctx/package.json ./; \
    if [ -d /ctx/node_modules ]; then \
      echo ">> memakai node_modules dari host"; mv /ctx/node_modules ./node_modules; \
    else \
      npm install --omit=dev --no-audit --no-fund --fetch-retries=5 --registry="$NPM_REGISTRY"; \
    fi; \
    cp -r /ctx/src /ctx/public ./; \
    rm -rf /ctx /root/.npm; \
    mkdir -p /data; chown -R node:node /data /app
USER node
EXPOSE 8080
CMD ["node", "src/index.js"]
