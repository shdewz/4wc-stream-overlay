const socket = new ReconnectingWebSocket('ws://' + location.host + '/websocket/v2');
const cache = {};

socket.onmessage = async event => {
    const data = JSON.parse(event.data);

    if (cache.scoreVisible !== data.tourney.scoreVisible) {
        cache.scoreVisible = data.tourney.scoreVisible;

        if (cache.scoreVisible) {
            $('#bottomright').addClass('blue').removeClass('red');
        } else {
            $('#bottomright').addClass('red').removeClass('blue')
        }
    }
}