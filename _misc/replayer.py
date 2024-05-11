import asyncio
import json
import time
import sys
import jsonstream
import websockets


PLAYBACK_SPEED = 1.
CONNECTIONS = set()


async def register(websocket):
    CONNECTIONS.add(websocket)
    print(f"Registered {websocket.id}")
    try:
        await websocket.wait_closed()
    finally:
        CONNECTIONS.remove(websocket)
    print(f"Unregistered {websocket.id}")


async def ws_handler(fname):
    with open(fname, "r") as infile:
        while True:
            last_tourney_ipc_state = -1
            perf_counter_start = time.perf_counter()
            for i, json_data in enumerate(jsonstream.load(infile)):
                if json_data["tourney"]["manager"]["ipcState"] not in (3, 4):
                    perf_counter_start = time.perf_counter() - json_data["recordTimestamp"]
                    last_tourney_ipc_state = -1
                    continue
                if last_tourney_ipc_state not in (3, 4):
                    print("\n============================\n")
                    last_tourney_ipc_state = 3

                now = time.perf_counter() - perf_counter_start
                now *= PLAYBACK_SPEED
                time_to_sleep = json_data["recordTimestamp"] - now
                if time_to_sleep > 0:
                    await asyncio.sleep(time_to_sleep)

                out_string = f"{json_data['tourney']['manager']['ipcState']} " \
                             f"{json_data['recordTimestamp']:7.2f} " \
                             f"{json_data['tourney']['manager']['gameplay']['score']['left']:7} " \
                             f"{json_data['tourney']['manager']['gameplay']['score']['right']:7} " \
                             f"{json_data['tourney']['manager']['bools']['scoreVisible']} "
                print(out_string)
                websockets.broadcast(CONNECTIONS, json.dumps(json_data))
            infile.seek(0)


async def main():
    if len(sys.argv) != 2:
        print(f"expected exactly one filename parameter, {len(sys.argv) - 1} given")
        return
    async with websockets.serve(register, "0.0.0.0", "24050"):
        await ws_handler(sys.argv[1])


if __name__ == "__main__":
    asyncio.run(main())
