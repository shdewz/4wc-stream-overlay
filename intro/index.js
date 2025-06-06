let comingup, teams, mappool;
(async () => {
	$.ajaxSetup({ cache: false });
	comingup = await $.getJSON('../_data/coming_up.json');
	teams = await $.getJSON('../_data/teams.json');
	mappool = await $.getJSON('../_data/beatmaps.json');
	streamer = (await $.getJSON('../_data/streamer.json')).username;

	if (comingup.length) {
		const now = Date.now();
		const matches = comingup.sort((a, b) => a.time - b.time).filter(e => e.time > now - 15 * 60 * 1000);
		if (matches.length === 0) return;

		concurrent_matches = matches.filter(m => m.time == matches[0].time);
		if (concurrent_matches.length > 1) {
			concurrent_matches_2 = concurrent_matches.filter(m => m.streamer === streamer ?? '');
			if (concurrent_matches_2.length === 0) {
				update_match(concurrent_matches[0]);
			}
			else if (concurrent_matches_2.length > 1) {
				console.log('you done fucked up');
				$('#title').text('MULTIPLE CONCURRENT MATCHES, CHECK JSON FILE');
			}
			else update_match(concurrent_matches_2[0]);
		}
		else update_match(concurrent_matches[0]);
	}
	else update_match(comingup);
})();

const update_match = match => {
	$('#title').text('COMING UP');

	if (match.showcase) {
		$('#teams').css('display', 'none');
		$('#showcase').text(`${mappool.stage} Mappool Showcase`).css('display', 'flex');
	}
	else {
		const red_team = teams.find(team => team.team === match.red_team);
		const blue_team = teams.find(team => team.team === match.blue_team);
		update_team('red', red_team);
		update_team('blue', blue_team);
	}

	if (match.time > Date.now()) {
		let timer_int = setInterval(() => {
			if (match.time < Date.now()) {
				clearInterval(timer_int);
				$('#timer').text('00:00');
			}
			let remaining = Math.floor((match.time - Date.now()) / 1000);
			let hours = Math.floor(remaining / 60 / 60);
			let date = new Date(null);
			date.setSeconds(remaining);
			let text = hours > 0 ? date.toISOString().slice(11, 19) : date.toISOString().slice(14, 19);
			if (timer && remaining > 0) $('#timer').text(text);
		}, 1000);
	}
};

const update_team = (color, team) => {
	$(`#name_${color}`).text(team.team);
	$(`#flag_${color}`).css('background-image', `url('../_shared/assets/flags/${team.flag}.png')`);
	$(`#players_${color}`).html('');
	const players = team.players.sort((a, b) => b.captain - a.captain);
	console.log(players);
	for (const player of players) {
		$(`#players_${color}`).append($('<div></div>').addClass('team-player').text(player.username));
	}
};
