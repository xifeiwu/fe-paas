FROM node:8.16.0-alpine
COPY deploy/fe-paas /data/fe-paas
RUN mkdir /data/logs
WORKDIR /data/fe-paas/
CMD ["sh", "run.sh"]
