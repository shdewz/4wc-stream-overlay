<script setup lang="ts">

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
        <div class="title" id="title">Winner</div>
      </div>
      <div class="teams">
        <div class="team red">
          <div class="team-header">
            <div class="team-flag" id="flag_red"></div>
            <div class="team-name" id="name_red"></div>
          </div>
          <div class="team-players red" id="players_red"></div>
        </div>
        <div class="scores">
          <div class="score red" id="score_red">0</div>
          <div class="separator">-</div>
          <div class="score blue" id="score_blue">0</div>
        </div>
        <div class="team blue">
          <div class="team-header">
            <div class="team-name" id="name_blue"></div>
            <div class="team-flag" id="flag_blue"></div>
          </div>
          <div class="team-players blue" id="players_blue"></div>
        </div>
      </div>
    </div>
    <div class="song-container" id="song_container">
      <div class="note"><i class="fa-solid fa-music"></i></div>
      <div class="song-title-container" id="song_title_container">
        <div class="song-artist" id="song_artist"></div>
        <div class="song-separator">-</div>
        <div class="song-title" id="song_title"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:global(body), :global(html) {
  padding: 0;
  margin: 0;
  overflow-y: hidden;
  font-family: 'Din', sans-serif;
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
  gap: 12px;
}

.teams {
  display: flex;
  color: var(--dark);
}

.team {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.scores {
  padding: 0 24px;
  display: flex;
  gap: 12px;
  font-size: 3rem;
  line-height: 3rem;
}

.score {
  font-weight: 700;
}

.team-header {
  font-weight: 700;
  font-size: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 18px;
}

.team.blue {
  align-items: flex-end;
  text-align: right;
}

.team-flag {
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
  padding-left: calc(70px + 18px);
}

.team-players.blue {
  padding-right: calc(70px + 18px);
}

.song-container {
  color: var(--dark);
  position: absolute;
  width: 100%;
  bottom: 40px;
  font-size: 1.7rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.song-title-container {
  display: flex;
  gap: 8px;
  opacity: 1;
  transition: opacity 300ms ease;
}

.note {
  font-size: 1.5rem;
}

.song-title {
  max-width: 800px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
