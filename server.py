from flask import Flask, render_template
from ws import socketio

app = Flask("monitor")
socketio.init_app(app)

@app.route("/")
def index():
    return render_template("index.html")
