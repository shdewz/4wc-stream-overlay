# 4WC Stream Overlay

This overlay is intended to be used with [tosu](https://github.com/KotRikD/tosu) `>=4.6.0`.

## Intended OBS scene setup

### `main`

| source        | url/path                                            | width | height | x         | y         |
|---------------|-----------------------------------------------------|-------|--------|-----------|-----------|
| vc_overlay*   |                                                     | 480   | 100    | 0         | 880       |
| osu clients** |                                                     | 480   | 360    | see below | see below |
| accents       | http://127.0.0.1:24050/4wc-stream-overlay/gameplay/ | 1920  | 1080   | 0         | 0         |
| main_overlay  | http://127.0.0.1:24050/4wc-stream-overlay/main/     | 1920  | 1080   | 0         | 0         |

<sup>*url from discord, replace custom css with [vc.css](vc.css)</sup><br>
<sup>**normal 4v4 placement according to the following table:</sup>

| client | x    | y    |
|--------|------|------|
| 0      | 0    | 160  |
| 1      | 480  | 160  |
| 2      | 0    | 520  |
| 3      | 480  | 520  |
| 4      | 960  | 160  |
| 5      | 1440 | 160  |
| 6      | 960  | 520  |
| 7      | 1440 | 520  |

### `mappool`

| source           | url/path                                           | width | height | x | y   |
|------------------|----------------------------------------------------|-------|--------|---|-----|
| vc_overlay       |                                                    | 480   | 100    | 0 | 880 |
| mappool_overlay* | http://127.0.0.1:24050/4wc-stream-overlay/mappool/ | 2220  | 700    | 0 | 0   |
| main_overlay     | http://127.0.0.1:24050/4wc-stream-overlay/main/    | 1920  | 1080   | 0 | 0   |

### `intro`*

| source           | url/path                                           | width | height | x | y   |
|------------------|----------------------------------------------------|-------|--------|---|-----|
| spotify_overlay  | http://127.0.0.1:24050/4wc-stream-overlay/spotify/ | 1920  | 1080   | 0 | 0   |
| intro_overlay    | http://127.0.0.1:24050/4wc-stream-overlay/intro/   | 1920  | 1080   | 0 | 0   |

<sup>*data pulled from `_data/coming_up.json`, requires exchanging between matches</sup>

### `winner`

| source           | url/path                                          | width | height | x | y   |
|------------------|---------------------------------------------------|-------|--------|---|-----|
| winner_overlay   | http://127.0.0.1:24050/4wc-stream-overlay/winner/ | 1920  | 1080   | 0 | 0   |

Intro and winner scenes can also have the vc overlay bottom left if needed

### Transitions

Add a **300ms `linear horizontal` luma wipe** transition between the scenes with **`0.05`** smoothness

### Interacting with the mappool

- Left click: left (red) team pick
- Right click: right (blue) team pick
- Ctrl+Click: ban
- Shift+Click: clear

## Other

### `_data` folder

Includes the following data and configuration files:

- `teams.json`: list of teams, static
- `beatmaps.json`: mappool file, exchanged weekly
- `coming_up.json`: (not provided) time and team names for a match, exchanged every match, used for intro screen; supports array-based version as well
- `streamer.json`: (not provided) your name, as `{"username": "yourname"}`

## Spotify / Now playing

The intro scene uses an overlay to display the currently playing song. This is ideally shown with [spotilocal](https://github.com/jmswrnr/spotilocal)'s websocket output. For users without Spotify, the query parameter `?useOsu=true` can be added to the overlay to instead display the song currently playing in the osu! client.
