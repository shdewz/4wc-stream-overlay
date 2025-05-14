let comingup, teams, mappool;
(async () => {
	$.ajaxSetup({ cache: false });
	comingup = await $.getJSON('../_data/coming_up.json');
	teams = await $.getJSON('../_data/teams.json');
	mappool = await $.getJSON('../_data/beatmaps.json');
	if (mappool?.stage) $('#title').text(mappool.stage.toUpperCase());
})();

const update_team = (color, team) => {
	$(`#name_${color}`).text(team.team);
	$(`#flag_${color}`).css('background-image', `url('../_shared/assets/flags/${team.flag}.png')`);
	$(`#players_${color}`).html('');
	const players = team.players.sort((a, b) => b.captain - a.captain);
	console.log(players);
	for (const player of players) {
		$(`#players_${color}`).append($('<div></div>').addClass('team-player').text(player.username));
	}
}

let socket = new ReconnectingWebSocket('ws://' + location.host + '/ws');

socket.onopen = () => { console.log('Successfully Connected'); };
socket.onclose = event => { console.log('Socket Closed Connection: ', event); socket.send('Client Closed!'); };
socket.onerror = error => { console.log('Socket Error: ', error); };

let artist, title;
let points_r, points_b;
socket.onmessage = async event => {
	const data = JSON.parse(event.data);

	if (teams && (points_r !== data.tourney.manager.stars.left || points_b !== data.tourney.manager.stars.right)) {
		points_r = data.tourney.manager.stars.left;
		points_b = data.tourney.manager.stars.right;
		const red_team = teams.find(team => team.team === data.tourney.manager.teamName.left);
		const blue_team = teams.find(team => team.team === data.tourney.manager.teamName.right);

		if (red_team && blue_team) {
			update_team('red', red_team);
			update_team('blue', blue_team);
			$('#score_red').text([points_r]);
			$('#score_blue').text([points_b]);
		}
	}
}
