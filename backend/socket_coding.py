"""
CortexCraft IDE — Socket.IO real-time collaboration server.
Events: join_room, code_change, language_change, cursor_move
"""
import socketio

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
)

# rooms[room_id] = { code, language, users: {sid: {id,name}}, cursors: {uid: {...}} }
rooms: dict = {}
# wb_rooms[room_id] = { elements: [], users: {sid: {id,name}} }
wb_rooms: dict = {}

# sid -> room_id (for fast disconnect lookup)
sid_to_room: dict = {}
# sid -> wb_room_id
sid_to_wb_room: dict = {}


def _users_list(room_id: str):
    """Return serialisable user list for a coding room."""
    return list(rooms[room_id]["users"].values()) if room_id in rooms else []


def _wb_users_list(room_id: str):
    """Return serialisable user list for a whiteboard room."""
    return list(wb_rooms[room_id]["users"].values()) if room_id in wb_rooms else []


# ── Connect / Disconnect ─────────────────────────────────────────────────────
@sio.event
async def connect(sid, environ, auth=None):
    print(f"[SOCKET] ✅ connected  sid={sid}")


@sio.event
async def disconnect(sid):
    print(f"[SOCKET] ❌ disconnected  sid={sid}")
    
    # Handle Coding Room Disconnect
    room_id = sid_to_room.pop(sid, None)
    if room_id and room_id in rooms:
        rooms[room_id]["users"].pop(sid, None)
        users = _users_list(room_id)
        await sio.emit("presence", {"users": users}, room=room_id)
        if not rooms[room_id]["users"]:
            del rooms[room_id]
            print(f"[SOCKET] coding room deleted: {room_id}")

    # Handle Whiteboard Room Disconnect
    wb_room_id = sid_to_wb_room.pop(sid, None)
    if wb_room_id and wb_room_id in wb_rooms:
        wb_rooms[wb_room_id]["users"].pop(sid, None)
        users = _wb_users_list(wb_room_id)
        await sio.emit("wb_presence", {"users": users}, room=wb_room_id)
        if not wb_rooms[wb_room_id]["users"]:
            del wb_rooms[wb_room_id]
            print(f"[SOCKET] whiteboard room deleted: {wb_room_id}")


# ── Join room (Coding) ───────────────────────────────────────────────────────
@sio.on("join_room")
async def join_room(sid, data):
    raw_room  = (data.get("roomId") or "general").strip()
    user_id   = data.get("userId",   sid)
    user_name = data.get("userName", "Anonymous")

    # ── Sanitize: if someone accidentally sends a full URL extract just the
    #             query-param value (e.g. "http://localhost:5173/code?room=AB12-CD34")
    from urllib.parse import urlparse, parse_qs
    try:
        parsed = urlparse(raw_room)
        if parsed.scheme in ("http", "https"):
            params = parse_qs(parsed.query)
            raw_room = (params.get("room") or params.get("ROOM") or [raw_room])[0]
    except Exception:
        pass

    room_id = raw_room.upper()
    print(f"[SOCKET] join_room  sid={sid}  room={room_id}  user={user_name}")

    # Create room if first visitor
    if room_id not in rooms:
        rooms[room_id] = {
            "code": (
                f"# CortexCraft Collaborative IDE\n"
                f"# Room: {room_id}\n\n"
                f"print('Hello, World!')\n"
            ),
            "language": "python",
            "users":   {},
            "cursors": {},
        }

    # Register in Socket.IO room
    await sio.enter_room(sid, room_id)
    rooms[room_id]["users"][sid] = {"id": user_id, "name": user_name}
    sid_to_room[sid] = room_id

    # 1️⃣  Send current state to the joiner only
    await sio.emit(
        "init_state",
        {
            "code":     rooms[room_id]["code"],
            "language": rooms[room_id]["language"],
            "cursors":  list(rooms[room_id]["cursors"].values()),
        },
        to=sid,
    )

    # 2️⃣  Broadcast updated presence to EVERYONE in the room (including joiner)
    users = _users_list(room_id)
    await sio.emit("presence", {"users": users}, room=room_id)
    print(f"[SOCKET] presence broadcast → room={room_id}  users={[u['name'] for u in users]}")


# ── Code change ───────────────────────────────────────────────────────────────
@sio.on("code_change")
async def code_change(sid, data):
    room_id  = data.get("roomId", "")
    new_code = data.get("code", "")
    if room_id not in rooms:
        return
    rooms[room_id]["code"] = new_code
    await sio.emit("code_update", {"code": new_code}, room=room_id, skip_sid=sid)


# ── Language change ───────────────────────────────────────────────────────────
@sio.on("language_change")
async def language_change(sid, data):
    room_id  = data.get("roomId", "")
    new_lang = data.get("language", "python")
    if room_id not in rooms:
        return
    rooms[room_id]["language"] = new_lang
    await sio.emit("language_update", {"language": new_lang}, room=room_id, skip_sid=sid)


# ── Cursor tracking ───────────────────────────────────────────────────────────
@sio.on("cursor_move")
async def cursor_move(sid, data):
    room_id = data.get("roomId", "")
    uid     = data.get("userId", "")
    if room_id not in rooms or not uid:
        return
    rooms[room_id]["cursors"][uid] = data
    await sio.emit("cursor_update", data, room=room_id, skip_sid=sid)


# ── Whiteboard Events ────────────────────────────────────────────────────────
@sio.on("wb_join")
async def wb_join(sid, data):
    room_id   = (data.get("roomId") or "default").strip().upper()
    user_id   = data.get("userId", sid)
    user_name = data.get("userName", "Anonymous")

    print(f"[WHITEBOARD] 📥 JOIN sid={sid} room={room_id} user={user_name}")

    if room_id not in wb_rooms:
        wb_rooms[room_id] = {
            "elements": [],
            "users": {},
        }
    
    await sio.enter_room(sid, room_id)
    wb_rooms[room_id]["users"][sid] = {"id": user_id, "name": user_name}
    sid_to_wb_room[sid] = room_id

    # Send initial elements
    await sio.emit("wb_init", {"elements": wb_rooms[room_id]["elements"]}, to=sid)
    print(f"[WHITEBOARD] 📤 Sent {len(wb_rooms[room_id]['elements'])} elements to {user_name}")

    # Broadcast presence
    users = _wb_users_list(room_id)
    await sio.emit("wb_presence", {"users": users}, room=room_id)
    print(f"[WHITEBOARD] 👥 Presence updated in {room_id}: {len(users)} users")


@sio.on("wb_draw")
async def wb_draw(sid, data):
    room_id = data.get("roomId", "").upper()
    element = data.get("element")
    
    if not room_id or room_id not in wb_rooms or not element:
        print(f"[WHITEBOARD] ⚠️ IGNORE DRAW from {sid} (room {room_id} not initialized)")
        return
    
    wb_rooms[room_id]["elements"].append(element)
    await sio.emit("wb_update", {"element": element}, room=room_id, skip_sid=sid)
    print(f"[WHITEBOARD] ✏️ DRAW in {room_id} (Elements: {len(wb_rooms[room_id]['elements'])})")


@sio.on("wb_clear")
async def wb_clear(sid, data):
    room_id = data.get("roomId", "").upper()
    if not room_id or room_id not in wb_rooms:
        return
    
    wb_rooms[room_id]["elements"] = []
    await sio.emit("wb_clear_all", {}, room=room_id, skip_sid=sid)
    print(f"[WHITEBOARD] 🧹 CLEAR in {room_id}")


@sio.on("wb_undo")
async def wb_undo(sid, data):
    room_id = data.get("roomId", "").upper()
    if not room_id or room_id not in wb_rooms or not wb_rooms[room_id]["elements"]:
        return
    
    wb_rooms[room_id]["elements"].pop()
    # Sync full state on undo to ensure everyone is on the same page
    await sio.emit("wb_init", {"elements": wb_rooms[room_id]["elements"]}, room=room_id)
    print(f"[WHITEBOARD] ↩️ UNDO in {room_id} (Remaining: {len(wb_rooms[room_id]['elements'])})")
