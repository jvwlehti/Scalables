FROM lukechannings/deno:v1.40.5

EXPOSE 7777

WORKDIR /app

COPY deps.js .

RUN deno cache deps.js

COPY . .

CMD [ "run", "--unstable", "--allow-net", "--allow-read", "--allow-env", "app.js" ]