from server import app, socketio
import monitor
import const

monitor.start()
try:
    socketio.run(app, const.HOST, const.PORT, debug=const.DEBUG)
except KeyboardInterrupt:
    print("Ctrl-C, stopping.")
    pass

monitor.stop()
