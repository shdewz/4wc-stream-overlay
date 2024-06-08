const obsGetCurrentScene = window.obsstudio?.getCurrentScene ?? (() => {});
const obsGetScenes = window.obsstudio?.getScenes ?? (() => {});
const obsSetCurrentScene = window.obsstudio?.setCurrentScene ?? (() => {});
const obsGetControlLevel = window.obsstudio?.getControlLevel ?? (() => {});

window.addEventListener('contextmenu', (e) => e.preventDefault());

const beatmaps = new Set();
let mappool;
(async () => {
    $.ajaxSetup({ cache: false });
    mappool = await $.getJSON('../_data/beatmaps.json');
})();

let socket = new ReconnectingWebSocket('ws://' + location.host + '/ws');

socket.onopen = () => { console.log('Successfully Connected'); };
socket.onclose = event => { console.log('Socket Closed Connection: ', event); socket.send('Client Closed!'); };
socket.onerror = error => { console.log('Socket Error: ', error); };

let gameState;
let hasSetup = false;
let lastPicked = null;
let redName = 'Red Team', blueName = 'Blue Team';
let tempMapID = 0;
let currentPicker = 'red';
let enableAutoPick = false;
let selectedMaps = [];

const sceneCollection = document.getElementById('sceneCollection');
let autoadvance_button = document.getElementById('autoAdvanceButton');
autoadvance_button.style.backgroundColor = '#fc9f9f';  // default to off

let autoadvance_timer_container = document.getElementById('autoAdvanceTimer');
let autoadvance_cancel_transition = document.getElementById('cancelAdvanceButton');
let autoadvance_timer_label = document.getElementById('autoAdvanceTimerLabel');
let autoadvance_timer_time = new CountUp('autoAdvanceTimerTime', 10, 0, 1, 10, {useEasing: false, suffix: 's'});
autoadvance_timer_container.style.opacity = '0';
autoadvance_cancel_transition.style.opacity = '0';

let enableAutoAdvance = false;
let sceneTransitionTimeoutID;
let lastState;
const gameplay_scene_name = 'gameplay';
const mappool_scene_name = 'mappool';
let selectedMapsTransitionTimeout = {};
const pick_to_transition_delay_ms = 10000;

/**
 * @typedef {number} Level - The level of permissions.
 * 0 for NONE,
 * 1 for READ_OBS (OBS data),
 * 2 for READ_USER (User data),
 * 3 for BASIC,
 * 4 for ADVANCED
 * 5 for ALL
 */
obsGetControlLevel(level => {
    // don't display auto advance if access level to OBS isn't sufficient
    if (level < 4) {
        document.getElementById('autoAdvanceSection').style.display='none';
    }
})

obsGetScenes(scenes => {
    if (scenes === null) {
        return;
    }

    for (const scene of scenes) {
        let clone = document.getElementById('sceneButtonTemplate').content.cloneNode(true);
        let buttonNode = clone.querySelector('div');
        buttonNode.id = `scene__${scene}`;
        buttonNode.textContent = `GO TO: ${scene}`;
        buttonNode.onclick = function() { obsSetCurrentScene(scene); };
        sceneCollection.appendChild(clone);
    }

    obsGetCurrentScene((scene) => {
        document.getElementById(`scene__${scene.name}`).classList.add('activeScene');
    });
});

window.addEventListener('obsSceneChanged', function(event) {
    let activeButton = document.getElementById(`scene__${event.detail.name}`);

    for (const scene of sceneCollection.children) {
        scene.classList.remove('activeScene');
    }
    activeButton.classList.add('activeScene');

});

class Beatmap {
    constructor(beatmap) {
        this.id = beatmap.beatmap_id;
        this.beatmap = beatmap;
    }
    generate() {
        this.parent = $('<div></div>').addClass('map').attr('id', `map-${this.beatmap.identifier.toLowerCase()}`);
        this.parent.append($('<div></div>').addClass('map-image').css('background-image', `url('https://assets.ppy.sh/beatmaps/${this.beatmap.beatmapset_id}/covers/cover.jpg')`));

        const content = $('<div></div>').addClass('map-content');
        this.picked_by_label = $('<div></div>').addClass('picked-by-label').attr('id', `picked-by-label-${this.beatmap.identifier.toLowerCase()}`);
        content.append(this.picked_by_label);
        this.mod_icon = $('<div></div>').addClass(`mod-icon ${this.beatmap.mods.toLowerCase()}`).text(this.beatmap.identifier.toUpperCase());
        content.append(this.mod_icon);

        const stats = $('<div></div>').addClass('map-stats');
        stats.append($('<div></div>').addClass('map-stats-section map-top').append($('<div></div>').addClass('map-title').text(`${this.beatmap.artist} - ${this.beatmap.title}`)));
        const bottom = $('<div></div>').addClass('map-stats-section map-bottom');
        bottom.append($('<div></div>').addClass('map-difficulty-container').append($('<div></div>').addClass('map-difficulty').text(this.beatmap.difficulty)));
        bottom.append($('<div></div>').addClass('map-mapper').text(this.beatmap.mapper));
        stats.append(bottom);
        content.append(stats);
        this.parent.append(content);

        this.blink_overlay = $('<div></div>').addClass('blink-overlay');
        this.parent.append(this.blink_overlay);
        $(`#mod-container-${this.beatmap.mods.toLowerCase()}`).append(this.parent);
    }
}

socket.onmessage = async (event) => {
    let data = JSON.parse(event.data);

    if (mappool && !hasSetup) setupBeatmaps();

    if (redName !== data.tourney.manager.teamName.left && data.tourney.manager.teamName.left) {
        redName = data.tourney.manager.teamName.left || 'Red Team';
    }

    if (blueName !== data.tourney.manager.teamName.right && data.tourney.manager.teamName.right) {
        blueName = data.tourney.manager.teamName.right || 'Blue Team';
    }

    if (mappool && tempMapID !== data.menu.bm.id && data.menu.bm.id !== 0) {
        if (tempMapID === 0) tempMapID = data.menu.bm.id;
        else {
            tempMapID = data.menu.bm.id;
            let pickedMap = Array.from(beatmaps).find(b => b.id === tempMapID);
            if (pickedMap && enableAutoPick && !selectedMaps.includes(tempMapID)) pickMap(pickedMap, currentPicker === 'red' ? redName : blueName, currentPicker);
        }
    }

    await transitionToMappool(data);
};

/**
 * checks conditions and attempts to transition from gameplay scene to mappool scene
 * @param data GosuData data sent by ws
 * @returns {Promise<void>}
 */
async function transitionToMappool(data) {
    let newState = data.tourney.manager.ipcState;
    if (enableAutoAdvance) {
        if (lastState === TourneyState.Ranking && newState === TourneyState.Idle) {
            sceneTransitionTimeoutID = setTimeout(() => {
                obsGetCurrentScene((scene) => {
                    if (scene.name !== gameplay_scene_name)  // e.g. on winner screen
                        return
                    obsSetCurrentScene(mappool_scene_name);
                });
            }, 2000);
        }
        if (lastState !== newState && newState !== TourneyState.Idle) {
            clearTimeout(sceneTransitionTimeoutID);
        }
    }
    lastState = newState;
}

async function setupBeatmaps() {
    hasSetup = true;
    const maps = mappool.beatmaps;
    if (!maps || maps.length == 0) return;

    document.cookie = `lastPick=;path=/`;
    $('#mappool_container').html('');
    for (const mod of [... new Set(maps.map(b => b.mods))]) {
        $('#mappool_container').append($('<div></div>').addClass('mod-container').attr('id', `mod-container-${mod.toLowerCase()}`));
    }

    for (const beatmap of maps) {
        const bm = new Beatmap(beatmap);
        bm.generate();
        bm.parent.on('click', event => {
            if (!event.originalEvent.shiftKey) event.originalEvent.ctrlKey ? banMap(bm, redName, 'red') : pickMap(bm, redName, 'red');
            else resetMap(bm);
        });
        bm.parent.on('contextmenu', event => {
            if (!event.originalEvent.shiftKey) event.originalEvent.ctrlKey ? banMap(bm, blueName, 'blue') : pickMap(bm, blueName, 'blue');
            else resetMap(bm);
        });
        beatmaps.add(bm);
    }
}

const getDataSet = (stored_beatmaps, beatmap_id) => stored_beatmaps.find(b => b.beatmap_id == beatmap_id) || null;

const pickMap = (bm, teamName, color) => {
    if (lastPicked !== null) lastPicked.blink_overlay.css('animation', 'none');
    lastPicked = bm;
    switchPick(color);

    if (bm.beatmap.mods.includes('TB')) {
        document.cookie = `lastPick=;path=/`;
        bm.parent.addClass(`picked`).removeClass('banned red blue');
        bm.picked_by_label.text('Tiebreaker').addClass(`picked`).removeClass('banned red blue');
    }
    else {
        document.cookie = `lastPick=${bm.id}-${color.toLowerCase()};path=/`;
        bm.parent.addClass(`picked ${color}`).removeClass(`banned ${opposite_team(color)}`);
        bm.picked_by_label.text(`Picked by ${teamName}`).addClass(`picked ${color}`).removeClass(`banned ${opposite_team(color)}`);
    }
    
    bm.mod_icon.removeClass('banned');
    bm.blink_overlay.css('animation', 'blinker 1s cubic-bezier(.36,.06,.01,.57) 300ms 8, slowPulse 5000ms ease-in-out 8000ms 18');
    selectedMaps.push(bm.beatmapID);

    if (enableAutoAdvance) {
        // idempotent on pick color (none/red/blue). Consider making it idempotent on pick state? (not picked/picked)
        if (selectedMapsTransitionTimeout[bm.beatmapID]?.color !== color) {
            cancelAdvance();
            clearTimeout(selectedMapsTransitionTimeout[bm.beatmapID]?.timeoutId)
            const newTimeoutId = setTimeout(() => {
                    obsSetCurrentScene(gameplay_scene_name);
                    autoadvance_timer_container.style.opacity = '0';
                    autoadvance_cancel_transition.style.opacity = '0';
                }, pick_to_transition_delay_ms);
            selectedMapsTransitionTimeout[bm.beatmapID] = {
                color: color,
                timeoutId: newTimeoutId
            };

            autoadvance_timer_time = new CountUp('autoAdvanceTimerTime',
                pick_to_transition_delay_ms / 1000, 0, 1, pick_to_transition_delay_ms / 1000,
                {useEasing: false, suffix: 's'});
            autoadvance_timer_time.start();
            autoadvance_timer_container.style.opacity = '1';
            autoadvance_timer_label.textContent = `Switching to ${gameplay_scene_name} in`;
            autoadvance_cancel_transition.style.opacity = '1';


            cancelAdvance = () => {
                clearTimeout(newTimeoutId);
                autoadvance_timer_container.style.opacity = '0';
                autoadvance_cancel_transition.style.opacity = '0';
            }
        }
    }
}

const banMap = (bm, teamName, color) => {
    if (bm.beatmap.mods.includes('TB')) return;

    bm.parent.addClass(`banned ${color}`).removeClass(`picked ${opposite_team(color)}`);
    bm.picked_by_label.text(`Banned by ${teamName}`).addClass(`banned ${color}`).removeClass(`picked ${opposite_team(color)}`);
    bm.blink_overlay.css('animation', 'none');
    bm.mod_icon.addClass('banned');
    selectedMaps.push(bm.beatmapID);
}

const resetMap = bm => {
    document.cookie = `lastPick=;path=/`;

    bm.parent.removeClass('banned picked red blue');
    bm.picked_by_label.text('').removeClass('banned picked red blue');
    bm.blink_overlay.css('animation', 'none');
    bm.mod_icon.removeClass('banned');
    selectedMaps = selectedMaps.filter(e => e !== bm.beatmapID);
}

const switchPick = color => {
    currentPicker = color ? opposite_team(color) : opposite_team(currentPicker);
    $('#current_pick').text(`${currentPicker.toUpperCase()} PICK`).addClass(currentPicker).removeClass(opposite_team(currentPicker));
}

const switchAutoPick = () => {
    if (enableAutoPick) {
        enableAutoPick = false;
        $('#auto_pick').text('ENABLE AUTOPICK').removeClass('enabled');
    }
    else {
        enableAutoPick = true;
        $('#auto_pick').text('DISABLE AUTOPICK').addClass('enabled');
    }
}

const switchAutoAdvance = () => {
    if (enableAutoAdvance) {
        enableAutoAdvance = false;
        autoadvance_button.innerHTML = 'AUTO ADVANCE: OFF';
        autoadvance_button.style.backgroundColor = '#fc9f9f';
    }
    else {
        enableAutoAdvance = true;
        autoadvance_button.innerHTML = 'AUTO ADVANCE: ON';
        autoadvance_button.style.backgroundColor = '#9ffcb3';
    }
}

var cancelAdvance = () => {
    // do nothing at first, wait to have a cancel action assigned to it
}

const TourneyState = {
    'Initialising': 0,
    'Idle': 1,
    'WaitingForClients': 2,
    'Playing': 3,
    'Ranking': 4,
}

/**
 * @typedef  {{
 *     tourney: {
 *         manager: {
 *             bools: {
 *                 scoreVisible: boolean,
 *                 starsVisible: boolean
 *             },
 *             bestOF: number,
 *             stars: {
 *                 left:number,
 *                 right:number,
 *             },
 *             teamName: {
 *                 left:string,
 *                 right:string,
 *             },
 *             ipcState: number,
 *             ipcClients: [{gameplay: { accuracy: number }}],
 *             chat: [{messageBody: string, team: string}],
 *         }
 *     },
 *     menu: {
 *         bm:{
 *             md5: string,
 *             path: {
 *                 full:string,
 *             },
 *             metadata:{
 *                artist:string,
 *                title:string,
 *                mapper:string,
 *                },
 *            stats:{
 *                    fullSR:number,
 *                    SR:number,
 *                    AR:number,
 *                    CS:number,
 *                    OD:number,
 *                    HP:number,
 *                    BPM:{
 *                        min:number,
 *                        max:number,
 *                    },
 *                    memoryAR:number,
 *                    memoryCS:number,
 *                    memoryOD:number,
 *                    memoryHP:number,
 *                },
 *            time:{
 *                firstObj:number,
 *                current:number,
 *                full:number,
 *                mp3:number,
 *            }
 *            },
 *      pp:{
 *                strains:[number],
 *            }
 *        }
 *    }
 * } GosuData
 */