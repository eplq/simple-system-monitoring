from flask_socketio import SocketIO
from const import ORIGINS

socketio = SocketIO(cors_allowed_origins=ORIGINS)
