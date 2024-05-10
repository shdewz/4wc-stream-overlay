let socket = new ReconnectingWebSocket('ws://' + location.host + '/ws');

let mappool;
(async () => {
	$.ajaxSetup({ cache: false });
	let stage = await $.getJSON('../_data/beatmaps.json');
	mappool = stage.beatmaps;
	if (mappool) $('#stage_name').html(`${stage.stage} MAPPOOL SHOWCASE`).css('opacity', 1);
	else $('#stage_name').html('').css('opacity', 0);
})();

socket.onopen = () => { console.log('Successfully Connected'); };
socket.onclose = event => { console.log('Socket Closed Connection: ', event); socket.send('Client Closed!'); };
socket.onerror = error => { console.log('Socket Error: ', error); };

let state;
let md5 = 0;
let artist, title, difficulty, mapper;
let replayer;

socket.onmessage = async event => {
	let data = JSON.parse(event.data);

	if (state !== data.menu.state) {
		state = data.menu.state;
		if (state !== 2) $('#header').css('opacity', 0);
		else $('#header').css('opacity', 1);
	}

	if (mappool && md5 !== data.menu.bm.md5) {
		md5 = data.menu.bm.md5;
		let map = mappool.find(m => m.beatmap_id === data.menu.bm.id || m.md5 === md5);
		$('#now_playing').html(map?.identifier ?? 'XX');

		bpm_ = map?.bpm || data.menu.bm.stats.BPM.max;
		sr_ = map?.sr || data.menu.bm.stats.fullSR;
		cs_ = data.menu.bm.stats.CS;
		cs_base = data.menu.bm.stats.memoryCS;
		ar_ = data.menu.bm.stats.AR;
		ar_base = data.menu.bm.stats.memoryAR;
		od_ = data.menu.bm.stats.OD;
		od_base = data.menu.bm.stats.memoryOD;

		let mod_ = map?.mods || 'NM';
		let stats = getModStats(cs_base, ar_base, od_base, 0, mod_);

		$('#bpm').html(Math.round(bpm_ * 10) / 10);
		$('#cs').html(Math.round((mod_ == 'FM' ? cs_base : map ? stats.cs : cs_) * 10) / 10);
		$('#ar').html(Math.round((mod_ == 'FM' ? ar_base : map ? stats.ar : ar_) * 10) / 10);
		$('#od').html(Math.round((mod_ == 'FM' ? od_base : map ? stats.od : od_) * 10) / 10);
		$('#sr').html(sr_.toFixed(2) + '★');

		let length_modifier = map ? (mod_?.includes('DT') ? 1.5 : 1) : data.resultsScreen.mods.str.includes('DT') || data.menu.mods.str.includes('DT') ? 1.5 : 1;
		len_ = data.menu.bm.time.full - data.menu.bm.time.firstObj;
		let mins = Math.trunc((len_ / length_modifier) / 1000 / 60);
		let secs = Math.trunc((len_ / length_modifier) / 1000 % 60);
		$('#length').html(`${mins}:${secs.toString().padStart(2, '0')}`);

		if (map?.beatmapset_id) {
			$('#map_background').css('background-image', `url("https://assets.ppy.sh/beatmaps/${map?.beatmapset_id}/covers/cover@2x.jpg")`);
			$('#map_stats_background').css('background-image', `url("https://assets.ppy.sh/beatmaps/${map?.beatmapset_id}/covers/cover@2x.jpg")`);
		}
		else {
			let path = `http://${location.host}/Songs/${data.menu.bm.path.full.replace(/#/g, '%23').replace(/%/g, '%25').replace(/\\/g, '/')}`
			$('#map_stats_background').css('background-image', `url("${path}")`);
			$('#map_background').css('background-image', `url("${path}")`);
		}

		if (map?.custom) { $('#custom_mapper').html(data.menu.bm.metadata.mapper); $('#custom').css('opacity', 1); }
		else { $('#custom_mapper').html(''); $('#custom').css('opacity', 0); }
	}

	if (replayer !== data.resultsScreen.name || replayer !== data.gameplay.name) {
		replayer = data.resultsScreen.name ?? data.gameplay.name;
		$('#replayer').html(replayer ?? 'Unknown');
	}

	if (artist !== data.menu.bm.metadata.artist) { artist = data.menu.bm.metadata.artist; $('#artist').html(artist); }
	if (title !== data.menu.bm.metadata.title) { title = data.menu.bm.metadata.title; $('#title').html(title); }
	if (difficulty !== data.menu.bm.metadata.difficulty) { difficulty = data.menu.bm.metadata.difficulty; $('#difficulty').html(difficulty); }
	if (mapper !== data.menu.bm.metadata.mapper) { mapper = data.menu.bm.metadata.mapper; $('#mapper').html(mapper); }
}

const delay = async time => new Promise(resolve => setTimeout(resolve, time));

const getModStats = (cs_raw, ar_raw, od_raw, hp_raw, mods) => {
	let speed = mods.includes('DT') ? 1.5 : mods.includes('HT') ? 0.75 : 1;
	let ar = mods.includes('HR') ? ar_raw * 1.4 : mods.includes('EZ') ? ar_raw * 0.5 : ar_raw;
	let ar_ms = Math.max(Math.min(ar <= 5 ? 1800 - 120 * ar : 1200 - 150 * (ar - 5), 1800), 450) / speed;
	ar = ar_ms > 1200 ? (1800 - ar_ms) / 120 : 5 + (1200 - ar_ms) / 150;

	let cs = Math.min(mods.includes('HR') ? cs_raw * 1.3 : mods.includes('EZ') ? cs_raw * 0.5 : cs_raw, 10);
	let hp = Math.min(mods.includes('HR') ? hp_raw * 1.4 : mods.includes('EZ') ? hp_raw * 0.5 : hp_raw, 10);

	let od = mods.includes('HR') ? Math.min(od_raw * 1.4, 10) : mods.includes('EZ') ? od_raw * 0.5 : od_raw;
	od = Math.min((79.5 - (Math.min(79.5, Math.max(19.5, 79.5 - Math.ceil(6 * od))) / speed)) / 6, speed > 1.5 ? 12 : 11);

	return { cs, ar, od, hp, ar_ms }
}
