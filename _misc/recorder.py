import asyncio
import json
import time
import websockets
import datetime
from tqdm import tqdm

WS_ENDPOINT = "ws://127.0.0.1:24050/ws"


async def main():
    pbar = tqdm(unit_scale=1, unit_divisor=1024, unit="B")
    perf_counter_start = time.perf_counter()
    last_state = -1
    with open(f'{datetime.datetime.utcnow().strftime("%Y-%m-%dT%H.%M.%S.%fz")}.json', "w", buffering=1) as json_out:

        async with websockets.connect(WS_ENDPOINT, ping_timeout=None) as websocket:
            async for message in websocket:
                message_json = json.loads(message)
                ts = time.perf_counter() - perf_counter_start
                message_json["recordTimestamp"] = ts
                if message_json["tourney"]["manager"]["ipcState"] != last_state:
                    print()
                    print(ts, message_json["tourney"]["manager"]["ipcState"])
                    print()
                    last_state = message_json["tourney"]["manager"]["ipcState"]
                message = json.dumps(message_json)
                pbar.update(len(message))
                json_out.write(message)


if __name__ == "__main__":
    asyncio.run(main())
