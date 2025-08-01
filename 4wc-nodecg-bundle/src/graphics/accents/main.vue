<template>
  <div class="main">
    <div class="header">
      <div class="header-side red"></div>
      <div class="header-side blue"></div>
    </div>
    <div class="gameplay-area"></div>
    <div class="footer">
      <div class="footer-side red"></div>
      <div class="footer-side blue" id="bottomright"></div>
    </div>
  </div>
</template>

<style scoped>
:global(:root) {
  --border-width: 2px;
  --border-color: var(--accent);
}

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
  display: flex;
  flex-direction: column;
}

.header {
  width: 100%;
  height: 162px;
  display: flex;
}

.header-side {
  width: 50%;
  border-bottom: var(--border-width) solid;
}

.gameplay-area {
  width: 100%;
  height: 716px;
}

.footer {
  width: 100%;
  height: 200px;
  display: flex;
}

.footer-side {
  width: 50%;
  border-top: var(--border-width) solid;
}

.red {
  border-color: var(--accent);
}

.blue {
  border-color: var(--accent);
}
</style>
