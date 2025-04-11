# Gimloader Server

This is a work-in-progress custom Gimkit server, which can be connected to via [Gimloader](https://github.com/Gimloader/Gimloader). It is designed to offer all the functionality of the base game with ways to extend it or replace it via plugins.

## Running The Server

1. Install [Bun](https://bun.sh/)
2. Clone this repo somewhere
3. Run `bun i --frozen-lockfile`
4. Run `bun start`

This will host the server locally, with the api server on port 5823 and the game server on port 5824. You can connect to this in the client with the address `http://localhost` and port `5823`.

## Configuration

Configuration for the server is housed in the `server.config.ts` file in the root of the server. 

|Option|Description|Required|
|---|---|---|
|address|The public facing address of the server|Yes|
|apiPort|Which port the api servers run on locally|Yes|
|gamePort|Which port the game servers run on locally|Yes|
|visibleGamePort|Which port the game servers are connected to by users, if different from the local url|No|
|plugins|An array of plugins for the server to load for all maps|No|
|mapPlugins|An object with the keys being the filename of a map, and the values being an array of plugins to run only on that map|No|

It's worth noting that at the moment support for plugins is still very limited.

## Maps

In order for players to be able to join you need to add maps to the server. Maps are stored as json files in the maps directory. To export a map, use the following steps:

1. Open a map in creative (you cannot export other people's maps)
2. Open the join page on another tab
3. Paste the [exportMap](./scripts/exportMap.js) script into the console
4. Join the game
5. Copy the object that is outputted in the console
6. Paste that object into a new json file in the maps directory

## Deploying The Server

[Nginx](https://nginx.org/) is the recommended way to deploy the server. Due to the issue of [Mixed Content](https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content), it is required that your server uses https when not being served over localhost. Additionally, the port that the server uses externally must be different from the one it uses internally. This difference should be reflected in the visibleGamePort setting in [the config](#configuration).

<details>
<summary>Example nginx config</summary>

```nginx
# Api Server Config
server {
    listen 8000 ssl;
    server_name [URL];
    ssl_certificate [...];
    ssl_certificate_key [...];
    [... potentially other ssl stuff ...]

    location / {
        proxy_pass http://localhost:5823;
    }
}

# Game Server Config
server {
    listen 8001 ssl;
    server_name [URL];
    [... ssl again ...]

    location / {
        proxy_pass http://localhost:5824;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s
    }
}
```
</summary>