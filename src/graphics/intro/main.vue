<script setup lang="ts">
// let comingup, teams, mappool;
// (async () => {
//   $.ajaxSetup({ cache: false });
//   comingup = await $.getJSON('../_data/coming_up.json');
//   teams = await $.getJSON('../_data/teams.json');
//   mappool = await $.getJSON('../_data/beatmaps.json');
//   streamer = (await $.getJSON('../_data/streamer.json')).username;
//
//   if (comingup.length) {
//     const now = Date.now();
//     const matches = comingup.sort((a, b) => a.time - b.time).filter(e => e.time > now - 3 * 60 * 1000);
//     if (matches.length === 0) {
//       console.log('a')
//       return;
//     }
//     else {
//       concurrent_matches = matches.filter(m => m.time == matches[0].time);
//       if (concurrent_matches.length > 1) {
//         concurrent_matches_2 = concurrent_matches.filter(m => m.streamer === streamer ?? '');
//         if (concurrent_matches_2.length === 0) {
//           update_match(concurrent_matches[0]);
//         }
//         else if (concurrent_matches_2.length > 1) {
//           console.log('you done fucked up');
//           $('#title').text('MULTIPLE CONCURRENT MATCHES, CHECK JSON FILE');
//         }
//         else update_match(concurrent_matches_2[0]);
//       }
//       else update_match(concurrent_matches[0]);
//     }
//   }
//   else update_match(comingup);
// })();
//
// const update_match = match => {
//   $('#title').text('COMING UP');
//
//   if (match.showcase) {
//     $('#teams').css('display', 'none');
//     $('#showcase').text(`${mappool.stage} Mappool Showcase`).css('display', 'flex');
//   }
//   else {
//     const red_team = teams.find(team => team.team === match.red_team);
//     const blue_team = teams.find(team => team.team === match.blue_team);
//     update_team('red', red_team);
//     update_team('blue', blue_team);
//   }
//
//   if (match.time > Date.now()) {
//     let timer_int = setInterval(() => {
//       if (match.time < Date.now()) {
//         clearInterval(timer_int);
//         $('#timer').text('00:00');
//       }
//       let remaining = Math.floor((match.time - Date.now()) / 1000);
//       let hours = Math.floor(remaining / 60 / 60);
//       let date = new Date(null);
//       date.setSeconds(remaining);
//       let text = hours > 0 ? date.toISOString().slice(11, 19) : date.toISOString().slice(14, 19);
//       if (timer && remaining > 0) $('#timer').text(text);
//     }, 1000);
//   }
// };
//
// const update_team = (color, team) => {
//   $(`#name_${color}`).text(team.team);
//   $(`#flag_${color}`).css('background-image', `url('../_shared/assets/flags/${team.flag}.png')`);
//   $(`#players_${color}`).html('');
//   const players = team.players.sort((a, b) => b.captain - a.captain);
//   console.log(players);
//   for (const player of players) {
//     $(`#players_${color}`).append($('<div></div>').addClass('team-player').text(player.username));
//   }
// };

</script>

<template>
  <div class="main">
    <div class="logo-container">
      <div class="logo"></div>
      <div class="logo-text">4 Digit World Cup 2025</div>
    </div>
    <div class="match-container">
      <div class="title-container">
        <div class="title-background"></div>
        <div class="title" id="title">COMING UP</div>
      </div>
      <div class="showcase" id="showcase"></div>
      <div class="teams" id="teams">
        <div class="team red">
          <div class="team-flag red" id="flag_red"></div>
          <div class="team-name red" id="name_red"></div>
          <div class="team-players red" id="players_red"></div>
        </div>
        <div class="vs">vs</div>
        <div class="team blue">
          <div class="team-name blue" id="name_blue"></div>
          <div class="team-flag blue" id="flag_blue"></div>
          <div class="team-players blue" id="players_blue"></div>
        </div>
      </div>
      <div class="timer" id="timer">00:00</div>
    </div>
  </div>
</template>

<style scoped>
:global(body), :global(html) {
  padding: 0;
  margin: 0;
  overflow-y: hidden;
  font-family: 'Din';
}

.main {
  position: relative;
  width: 1920px;
  height: 1080px;
  background-image: url('@4wc-stream-overlay/assets/base_bg.png');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  font-size: 2rem;
}

.logo-container {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 20px;
  top: 60px;
  left: 120px;
  font-weight: 800;
  font-size: 2rem;
  color: var(--dark);
}

.logo {
  width: 64px;
  height: 64px;
  background-image: url('@4wc-stream-overlay/assets/logo.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 12px;
}

.title-container {
  position: relative;
}

.title-background {
  position: absolute;
  width: 100%;
  height: 30px;
  background-color: var(--accent);
  transform: skew(-25deg) translateY(11px);
}

.title {
  position: relative;
  color: var(--light);
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: 3px;
  padding: 0 24px;
  text-transform: uppercase;
  z-index: 10;
}

.match-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;
}

.teams {
  display: flex;
  color: var(--dark);
}

.team {
  display: grid;
  grid-template-columns: auto auto;
  grid-template-rows: 50px auto;
  align-items: center;
  gap: 12px 24px;
}

.vs {
  padding: 0 24px;
  line-height: 3rem;
  font-style: italic;
}

.team-name {
  font-weight: 700;
  font-size: 3rem;
  display: flex;
  align-items: center;
}

.team-name.blue {
  justify-content: flex-end;
}

.showcase {
  font-weight: 700;
  font-size: 3rem;
  color: var(--dark);
  display: none;
}

.team.blue {
  align-items: flex-end;
  text-align: right;
}

.team-flag {
  justify-self: center;
  align-self: center;
  width: 70px;
  height: 47px;
  background-image: url('@4wc-stream-overlay/assets/flags/XX.png');
  filter: drop-shadow(0 0 12px rgba(0, 0, 0, 0.1));
}

.team-players {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 1.6rem;
}

.team-players.red {
  grid-column-start: 2;
}

.timer {
  width: 300px;
  display: flex;
  justify-content: center;
  text-align: center;
  font-size: 3rem;
  font-weight: 800;
  font-family: 'Noto Sans';
}
</style>
