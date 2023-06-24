let teams = null;
let mappool = null;
let points_r, points_b;
(async () => {
	$.ajaxSetup({ cache: false });
	teams = await $.getJSON('../_data/teams.json');
	mappool = await $.getJSON('../_data/beatmaps.json');
	let stage = mappool.abbreviation.toLowerCase();
	if (stage) document.getElementById('main').style.backgroundImage = `url('../_data/assets/base-bg-${stage}.png')`;
})();

let socket = new ReconnectingWebSocket('ws://' + location.host + '/ws');

let title = document.getElementById('title');

socket.onopen = () => { console.log('Successfully Connected'); };
socket.onclose = event => { console.log('Socket Closed Connection: ', event); socket.send('Client Closed!'); };
socket.onerror = error => { console.log('Socket Error: ', error); };

let tempMapName;

socket.onmessage = event => {
	let data = JSON.parse(event.data);

	if (tempMapName !== `${data.menu.bm.metadata.artist} - <b>${data.menu.bm.metadata.title}</b>`) {
		tempMapName = `${data.menu.bm.metadata.artist} - <b>${data.menu.bm.metadata.title}</b>`;
		title.innerHTML = `<span id="note">♪</span> ${tempMapName}`;
	}

	if (teams && (points_r !== data.tourney.manager.stars.left || points_b !== data.tourney.manager.stars.right)) {
		points_r = data.tourney.manager.stars.left;
		points_b = data.tourney.manager.stars.right;
		let red_team = teams.find(t => t.name === (data.tourney.manager.teamName.left));
		let blue_team = teams.find(t => t.name === (data.tourney.manager.teamName.right));

		if (red_team && blue_team) {
			document.getElementById('flag-red').src = `https://assets.ppy.sh/old-flags/${red_team.flag}.png`;
			document.getElementById('flag-blue').src = `https://assets.ppy.sh/old-flags/${blue_team.flag}.png`;
			document.getElementById('score-red').innerHTML = points_r;
			document.getElementById('score-blue').innerHTML = points_b;
			document.getElementById('team-row').innerHTML = points_r > points_b ? red_team.name : blue_team.name;
		}
	}
}
