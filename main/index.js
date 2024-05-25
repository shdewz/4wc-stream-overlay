const TEAMSIZE = 4;

let mappool, teams;
(async () => {
	$.ajaxSetup({ cache: false });
	mappool = await $.getJSON('../_data/beatmaps.json');
	teams = await $.getJSON('../_data/teams.json');
	let stage = mappool.stage;
	if (stage) $('#stage_name').text(stage);
	carousel();
})();

const carousel = () => {
	const total_items = 4;
	let item_id = 1;
	$(`#middle_item_${item_id}`).css('opacity', 1);
	$(`#middle_item_${item_id}`).css('display', 'flex');

	setInterval(async () => {
		$(`#middle_item_${item_id}`).css('opacity', 0);
		await delay(300);
		$(`#middle_item_${item_id}`).css('display', 'none');
		item_id++;
		if (item_id > total_items) item_id = 1;
		$(`#middle_item_${item_id}`).css('display', 'flex');
		await delay(100);
		$(`#middle_item_${item_id}`).css('opacity', 1);
	}, 7000);
}

let map, mapid;
window.setInterval(async () => {
	await delay(200);
	let cookieName = 'lastPick';
	const match = document.cookie.match(`(?:^|.*)${cookieName}=(.+?)(?:$|[|;].*)`);

	let checkValid = () => {
		if (!mapid) return -9;
		if (match) {
			let cookieValue = match[1].split('-');
			if (cookieValue.length !== 2) return -1;  // expected format: <beatmap_id>-<picking_team>
			const parsedBeatmapID = parseInt(cookieValue[0]);
			if (isNaN(parsedBeatmapID)) return -2;

			// if (true) {  // bypass beatmap id checking during development
			if (mapid == parsedBeatmapID) {
				let map_obj = mappool.beatmaps.find(m => m.beatmap_id == mapid);
				if (map_obj?.identifier?.toUpperCase().includes('TB')) return -3;
				if (nameRed && nameBlue) {
					$('#picked_by').text(`Picked by ${cookieValue[1] === 'red' ? nameRed : nameBlue}`).css('opacity', 1).addClass(cookieValue[1]).removeClass(opposite_team(cookieValue[1]));
					$('#map_slot_container').addClass(cookieValue[1]).removeClass(opposite_team(cookieValue[1]));
					$('#map_image_container').addClass(cookieValue[1]).removeClass(opposite_team(cookieValue[1]));
				}
				else {
					$('#picked_by').text('').css('opacity', 0).removeClass('red blue');
					$('#map_slot_container').removeClass('red blue');
					$('#map_image_container').removeClass('red blue');
				}
				return 0;
			}
			return -255;
		}
	}

	if (checkValid() !== 0) {
		$('#picked_by').text('').css('opacity', 0);
		$('#map_slot_container').removeClass('red blue');
		$('#map_image_container').removeClass('red blue');
	}
}, 500);

let socket = new ReconnectingWebSocket('ws://' + location.host + '/ws');

let animation = {
	red_score: new CountUp('score_red', 0, 0, 0, .3, { useEasing: true, useGrouping: true, separator: ',', decimal: '.', suffix: '' }),
	blue_score: new CountUp('score_blue', 0, 0, 0, .3, { useEasing: true, useGrouping: true, separator: ',', decimal: '.', suffix: '' }),
	score_diff: new CountUp('score_diff', 0, 0, 0, .3, { useEasing: true, useGrouping: true, separator: ',', decimal: '.', suffix: '' }),
}

socket.onopen = () => { console.log('Successfully Connected'); };
socket.onclose = event => { console.log('Socket Closed Connection: ', event); socket.send('Client Closed!'); };
socket.onerror = error => { console.log('Socket Error: ', error); };

let md5, image;
let scoreVisible, starsVisible, bestOf;
let starsRed, starsBlue, nameRed, nameBlue;
let last_score_update = 0;
let chatLen = 0;

let update_stats = false;
let first_chat_refresh = true;
let timer, blink_timer;
let timer_in_progress = false;

socket.onmessage = async event => {
	const data = JSON.parse(event.data);
	const now = Date.now();

	if (scoreVisible !== data.tourney.manager.bools.scoreVisible) {
		scoreVisible = data.tourney.manager.bools.scoreVisible;

		if (scoreVisible) {
			$('#chat_container').css('opacity', 0);
			$('#top_footer').css('opacity', 1);
			$('#title').css('width', '1000px');
		} else {
			$('#chat_container').css('opacity', 1);
			$('#top_footer').css('opacity', 0);
			$('#title').css('width', '654px');
		}
	}

	if (starsVisible !== data.tourney.manager.bools.starsVisible) {
		starsVisible = data.tourney.manager.bools.starsVisible;
		if (starsVisible) {
			$('#blue_points').css('opacity', 1);
			$('#red_points').css('opacity', 1);

		} else {
			$('#blue_points').css('opacity', 0);
			$('#red_points').css('opacity', 0);
		}
	}

	if (teams && nameRed !== data.tourney.manager.teamName.left) {
		nameRed = data.tourney.manager.teamName.left || 'Red Team';
		$('#red_name').text(nameRed);
		let team = teams.find(t => t.team === nameRed);

		$('#red_flag').css('background-image', `url('../_shared/assets/flags/${team?.flag ?? 'XX'}.png')`);
		$('#red_seed').text(`SEED ${team?.seed ?? 'X'}`);
	}
	if (teams && nameBlue !== data.tourney.manager.teamName.right) {
		nameBlue = data.tourney.manager.teamName.right || 'Blue Team';
		$('#blue_name').text(nameBlue);
		let team = teams.find(t => t.team === nameBlue);

		$('#blue_flag').css('background-image', `url('../_shared/assets/flags/${team?.flag ?? 'XX'}.png')`);
		$('#blue_seed').text(`SEED ${team?.seed ?? 'X'}`);
	}

	if (bestOf !== data.tourney.manager.bestOF) {
		const newmax = Math.ceil(data.tourney.manager.bestOF / 2);
		if (bestOf === undefined) {
			for (let i = 1; i <= newmax; i++) {
				$('#red_points').append($('<div></div>').attr('id', `red${i}`).addClass('team-point red'));
				$('#blue_points').append($('<div></div>').attr('id', `blue${i}`).addClass('team-point blue'));
			}
		}
		else if (bestOf < data.tourney.manager.bestOF) {
			for (let i = firstTo + 1; i <= newmax; i++) {
				$('#red_points').append($('<div></div>').attr('id', `red${i}`).addClass('team-point red'));
				$('#blue_points').append($('<div></div>').attr('id', `blue${i}`).addClass('team-point blue'));
			}
		}
		else {
			for (let i = firstTo; i > newmax; i--) {
				$(`#red${i}`).remove();
				$(`#blue${i}`).remove();
			}
		}
		bestOf = data.tourney.manager.bestOF;
		firstTo = newmax;
	}

	if (starsRed !== data.tourney.manager.stars.left) {
		starsRed = data.tourney.manager.stars.left;
		for (let i = 1; i <= starsRed; i++) { $(`#red${i}`).addClass('filled'); }
		for (let i = starsRed + 1; i <= firstTo; i++) { $(`#red${i}`).removeClass('filled'); }
	}

	if (starsBlue !== data.tourney.manager.stars.right) {
		starsBlue = data.tourney.manager.stars.right;
		for (let i = 1; i <= starsBlue; i++) { $(`#blue${i}`).addClass('filled'); }
		for (let i = starsBlue + 1; i <= firstTo; i++) { $(`#blue${i}`).removeClass('filled'); }
	}

	if (mappool && md5 !== data.menu.bm.md5) {
		md5 = data.menu.bm.md5;
		setTimeout(() => { update_stats = true }, 250);
	}

	if (update_stats) {
		update_stats = false;
		mapid = data.menu.bm.id;
		map = mappool ? mappool.beatmaps.find(m => m.beatmap_id == mapid || m.md5 == md5) ?? { id: data.menu.bm.id, mods: 'NM', identifier: null } : { id: null, mods: 'NM', identifier: null };
		const mods = map.mods ?? 'NM';
		const stats = getModStats(data.menu.bm.stats.memoryCS, data.menu.bm.stats.memoryAR, data.menu.bm.stats.memoryOD, data.menu.bm.stats.BPM.common, mods);
		const len_ = data.menu.bm.time.full - data.menu.bm.time.firstObj;

		$('#cs').text(stats.cs);
		$('#ar').text(stats.ar);
		$('#od').text(stats.od);
		$('#bpm').text(map?.bpm ?? stats.bpm);
		$('#length').text(`${Math.trunc((len_ / stats.speed) / 1000 / 60)}:${Math.trunc((len_ / stats.speed) / 1000 % 60).toString().padStart(2, '0')}`);
		$('#sr').text(`${map?.sr ?? data.menu.bm.stats.fullSR}★`);

		$('#title').text(`${data.menu.bm.metadata.artist} - ${data.menu.bm.metadata.title} [${data.menu.bm.metadata.difficulty}]`);

		// map.identifier = 'HD2';
		if (map?.identifier) {
			$('#map_slot_container').css('display', 'flex').css('opacity', 1);
			await delay(10);
			$('#map_slot_container').css('width', '50px');
			$('#map_slot').text(map.identifier).css('opacity', 1);
		}
		else {
			$('#map_slot').css('opacity', 0);
			await delay(200);
			$('#map_slot_container').css('width', '0px');
			await delay(300);
			$('#map_slot_container').css('display', 'none').css('opacity', 0);
			$('#map_slot').text('');
		}
	}

	if (image !== data.menu.bm.path.full) {
		image = data.menu.bm.path.full;
		data.menu.bm.path.full = data.menu.bm.path.full.replace(/#/g, '%23').replace(/%/g, '%25').replace(/\\/g, '/').replace(/'/g, `\\'`);
		$('#map_image').css('background-image', `url('http://${location.host}/Songs/${data.menu.bm.path.full}')`);
	}

	if (scoreVisible) {
		let scores = [];
		for (let i = 0; i < TEAMSIZE * 2; i++) {
			let score = data.tourney.ipcClients[i]?.gameplay?.score || 0;
			if (data.tourney.ipcClients[i]?.gameplay?.mods?.str?.toUpperCase().includes('EZ')) score *= 1.75;
			scores.push({ id: i, score });
		}

		// scoreRed = 665624;
		// scoreBlue = 796743;
		scoreRed = scores.filter(s => s.id < TEAMSIZE).map(s => s.score).reduce((a, b) => a + b);
		scoreBlue = scores.filter(s => s.id >= TEAMSIZE).map(s => s.score).reduce((a, b) => a + b);
		let scorediff = Math.abs(scoreRed - scoreBlue);

		animation.red_score.update(scoreRed);
		animation.blue_score.update(scoreBlue);
		animation.score_diff.update(scorediff);
		const lead_bar_width = `${Math.max(10, 360 * (Math.min(0.5, Math.pow(scorediff / 1000000, 0.7)) * 2))}px`;

		if (scoreRed > scoreBlue) {
			$('#score_red').addClass('winning');
			$('#score_blue').removeClass('winning');

			if (now - last_score_update > 300) {
				last_score_update = now;
				$('#score_diff').attr('data-before', '◀').attr('data-after', '').css('opacity', 1).addClass('red').removeClass('blue');
				$('#lead_bar').css('width', lead_bar_width).css('right', '960px').css('left', 'unset');
				$('#lead_bar').addClass('red');
				$('#lead_bar').removeClass('blue');
			}
		}
		else if (scoreBlue > scoreRed) {
			$('#score_red').removeClass('winning');
			$('#score_blue').addClass('winning');

			if (now - last_score_update > 300) {
				last_score_update = now;
				$('#score_diff').attr('data-before', '').attr('data-after', '▶').css('opacity', 1).addClass('blue').removeClass('red');
				$('#lead_bar').css('width', lead_bar_width).css('right', 'unset').css('left', '960px');
				$('#lead_bar').removeClass('red');
				$('#lead_bar').addClass('blue');
			}
		}
		else {
			$('#score_diff').attr('data-before', '').attr('data-after', '').css('opacity', 0).removeClass('red').removeClass('blue');
			$('#score_red').removeClass('winning');
			$('#score_blue').removeClass('winning');

			$('#lead_bar').css('width', '0px');
			$('#lead_bar').removeClass('red');
			$('#lead_bar').removeClass('blue');
		}
	}

	if (chatLen !== data.tourney.manager.chat.length) {

		const current_chat_len = data.tourney.manager.chat.length;
		if (chatLen === 0 || (chatLen > 0 && chatLen > current_chat_len)) { $('#chat').html(''); chatLen = 0; }

		for (let i = chatLen; i < current_chat_len; i++) {
			const chat = data.tourney.manager.chat[i];
			const body = chat.messageBody;
			const time = chat.time;
			if (body.toLowerCase().startsWith('!mp')) {
				if (first_chat_refresh) continue;
				const command = body.toLowerCase();
				const command_value = Number(command.match(/\d+/)) ?? 0;

				if (command.startsWith('!mp timer')) {
					if (isNaN(command_value)) { stop_timer(); continue; }
					else start_timer(command_value);
				}
				if ((command.startsWith('!mp aborttimer') && command.startsWith('!mp start')) && timer_in_progress) stop_timer();
			}
			else {
				const team = team_lookup[chat.team] ?? 'unknown';
				const player = chat.name;
				if (player === 'BanchoBot' && body.startsWith('Match history')) continue;

				team_actual = teams.find(t => t.players.map(p => p.username).includes(player))?.team;
				teamcode_actual = team_actual ? team_actual === nameRed ? 'red' : team_actual === nameBlue ? 'blue' : null : null;

				const chatParent = $('<div></div>').addClass(`chat-message ${teamcode_actual ?? team}`);

				chatParent.append($('<div></div>').addClass('chat-time').text(time));
				chatParent.append($('<div></div>').addClass('chat-name').text(player));
				chatParent.append($('<div></div>').addClass('chat-body').text(body));

				$('#chat').prepend(chatParent);
			}
		}

		chatLen = data.tourney.manager.chat.length;
		first_chat_refresh = false;
	}
}

const really_start_timer = length => {
	timer_in_progress = true;
	$('#timer_progress').css('animation', 'none');
	$('#stopwatch_container').css('animation', 'none');
	$('#timer_container').css('transform', 'translateY(0px)');
	$('#timer_progress').css('animation', `progress ${length}s linear`);

	if (length > 30) {
		blink_timer = setTimeout(() => {
			if (!timer_in_progress) return;
			$('#timer_progress').css('animation', `progress ${length}s linear, progress_blink 0.7s infinite ease`);
			$('#stopwatch_container').css('animation', `progress_blink 0.7s infinite ease`);
		}, (length - 3) * 1000);
	}

	timer = setTimeout(() => {
		if (!timer_in_progress) return;
		stop_timer();
	}, length * 1000);
}

const start_timer = length => {
	window.requestAnimationFrame(() => {
		stop_timer();
		window.requestAnimationFrame(() => {
			really_start_timer(length);
		})
	})
}

const stop_timer = () => {
	clearTimeout(timer);
	clearTimeout(blink_timer);
	timer_in_progress = false;
	$('#timer_progress').css('animation', 'none');
	$('#stopwatch_container').css('animation', 'none');
	$('#timer_container').css('transform', 'translateY(32px)');
}

const team_lookup = {
	bot: 'bot',
	left: 'red',
	right: 'blue'
}

const getModStats = (cs_raw, ar_raw, od_raw, bpm_raw, mods) => {
	mods = mods.replace('NC', 'DT');

	let speed = mods.includes('DT') ? 1.5 : mods.includes('HT') ? 0.75 : 1;
	let ar = mods.includes('HR') ? ar_raw * 1.4 : mods.includes('EZ') ? ar_raw * 0.5 : ar_raw;

	let ar_ms = Math.max(Math.min(ar <= 5 ? 1800 - 120 * ar : 1200 - 150 * (ar - 5), 1800), 450) / speed;
	ar = ar < 5 ? (1800 - ar_ms) / 120 : 5 + (1200 - ar_ms) / 150;

	let cs = Math.round(Math.min(mods.includes('HR') ? cs_raw * 1.3 : mods.includes('EZ') ? cs_raw * 0.5 : cs_raw, 10) * 10) / 10;

	let od = mods.includes('HR') ? od_raw * 1.4 : mods.includes('EZ') ? od_raw * 0.5 : od_raw;
	od = Math.round(Math.min((79.5 - Math.min(79.5, Math.max(19.5, 79.5 - Math.ceil(6 * od))) / speed) / 6, 11) * 10) / 10;

	return {
		cs: Math.round(cs * 10) / 10,
		ar: Math.round(ar * 10) / 10,
		od: Math.round(od * 10) / 10,
		bpm: Math.round(bpm_raw * speed * 10) / 10,
		speed
	}
}
