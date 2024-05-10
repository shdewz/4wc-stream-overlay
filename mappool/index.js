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
        content.append($('<div></div>').addClass(`mod-icon ${this.beatmap.mods.toLowerCase()}`).text(this.beatmap.identifier.toUpperCase()));

        const stats = $('<div></div>').addClass('map-stats');
        stats.append($('<div></div>').addClass('map-stats-section map-top').append($('<div></div>').addClass('map-title').text(this.beatmap.title)));
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
};

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
        bm.parent.addClass(`picked ${color}`).removeClass(`banned ${opposite(color)}`);
        bm.picked_by_label.text(`Picked by ${teamName}`).addClass(`picked ${color}`).removeClass(`banned ${opposite(color)}`);
    }
    
    bm.blink_overlay.css('animation', 'blinker 1s cubic-bezier(.36,.06,.01,.57) 300ms 8, slowPulse 5000ms ease-in-out 8000ms 18');
    selectedMaps.push(bm.beatmapID);
}

const banMap = (bm, teamName, color) => {
    if (bm.beatmap.mods.includes('TB')) return;

    bm.parent.addClass(`banned ${color}`).removeClass(`picked ${opposite(color)}`);
    bm.picked_by_label.text(`Banned by ${teamName}`).addClass(`banned ${color}`).removeClass(`picked ${opposite(color)}`);
    bm.blink_overlay.css('animation', 'none');
    selectedMaps.push(bm.beatmapID);
}

const resetMap = bm => {
    document.cookie = `lastPick=;path=/`;

    bm.parent.removeClass('banned picked red blue');
    bm.picked_by_label.text('').removeClass('banned picked red blue');
    bm.blink_overlay.css('animation', 'none');
    selectedMaps = selectedMaps.filter(e => e !== bm.beatmapID);
}

const switchPick = color => {
    currentPicker = color ? opposite(color) : opposite(currentPicker);
    $('#current_pick').text(`${currentPicker.toUpperCase()} PICK`).addClass(currentPicker).removeClass(opposite(currentPicker));
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

const opposite = color => color === 'red' ? 'blue' : 'red';