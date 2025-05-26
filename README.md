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

----

# nodecg-vue-ts-template

Template for NodeCG bundles that use Vue.js and TypeScript.


## Technical Details

- Tested with Node.js v16 (as of writing, current LTS).
- Extension uses TypeScript.
- Browser uses Vue.js (v3), with TypeScript for the scripting.
  - Includes the [nodecg-vue-composable](https://github.com/Dan-Shields/nodecg-vue-composable) helper composable to help with using replicants; I advise you check it's README for more information.
  - Dashboard also includes Quasar, for easy styling of UI.
  - Builds using Vite, using the [vite-plugin-nodecg](https://github.com/dan-shields/vite-plugin-nodecg) plugin.
- Includes module alias support for both extension and browser.
- ESLint is included for extension/browser/typings.
  - Extends [airbnb-typescript/base](https://github.com/iamturns/eslint-config-airbnb-typescript), alongside a few other recommended/essential packages.
  - Has some personal choices/override rules, but not many.
- I personally use Visual Studio Code with some appropriate extensions ([Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) for example), so have made sure it works well in that editor.
- The extension/browser files have some example code scattered about that should help in how to use things.

To use module aliases, you must change all the parts labelled with `@nodecg-vue-ts-template`; either substitute in your own bundle name, or something else you feel is appropriate. The main places these are in are:
- [`./tsconfig.browser.json`](tsconfig.browser.json)
- [`./tsconfig.extension.json`](tsconfig.extension.json)
- [`./vite.config.mjs`](vite.config.mjs)
- [`./src/extension/index.ts`](src/extension/index.ts)


## Package Commands

- `autofix`: Automatically fix any possible linting errors using ESLint.
- `autofix:browser`: See above, but only for browser based code.
- `autofix:extension`: See above, but only for extension based code/typings.
- `build`: Build written code for use in production.
- `build:browser`: See above, but only for browser based code.
- `build:extension`: See above, but only for extension based code.
- `clean`: Clean up all built/watched files.
- `lint`: Finds any possible linting errors using ESLint, but does not fix them.
- `lint:browser`: See above, but only for browser based code.
- `lint:extension`: See above, but only for extension based code/typings.
- `prebuild`: Alias for `clean`, will automatically run before `build` if called.
- `schema-types`: Create TypeScript typings for schemas/`Configschema.json` using `nodecg-cli`.
- `start`: Start NodeCG.
- `watch`: Build code and watch for changes, for use in development.
- `watch:browser`: See above, but only for browser based code.
- `watch:extension`: See above, but only for extension based code.


## Differences between template v1 and v2...

- Upgraded Vue to v3 from v2.
- Uses Vite to build browser code instead of Webpack.
- Uses Quasar for material design styling help instead of Vuetify.
- No TypeScript decorators used in the browser code now as they aren't needed.
- Adds [nodecg-vue-composable](https://github.com/Dan-Shields/nodecg-vue-composable) to help with using/modifying replicants in browser.
- No longer includes any Vue state plugins by default (as no longer needed for replicants), but you can add one if needed (I'd suggest [pinia](https://pinia.vuejs.org/)).
- Includes [@vueuse/head](https://github.com/vueuse/head), in the example code just used to help change the title of each page.
- Uses the [nodecg-types](https://github.com/codeoverflow-org/nodecg-types) package instead of directly referencing the installed NodeCG instance.
