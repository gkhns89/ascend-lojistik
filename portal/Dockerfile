FROM node:24.19.0-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=oven/bun:1.4.2-alpine /usr/local/bin/bun /usr/local/bin/bun
COPY --chown=node:node bun.lock package.json server.mjs tenant-store.mjs database.mjs security.mjs operations.mjs offers.mjs monitoring.mjs mail-import.mjs mail-worker.mjs mail-extract.mjs preflight.mjs quotes.mjs smtp-transport.mjs ./
RUN bun install --frozen-lockfile --production && mkdir -p /app/.data && chown node:node /app/.data
COPY --chown=node:node prototype ./prototype
# Entrypoint root olarak kalici diskin sahipligini duzeltip node'a duser.
RUN apk add --no-cache su-exec
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
EXPOSE 3001
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "server.mjs"]
