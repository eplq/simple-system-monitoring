import psutil
from threading import Thread
from time import sleep

from const import INTERVAL
from ws import socketio

from sys import platform

running = False
threads = []
net_previous = {
    "bytes_sent": 0,
    "bytes_recv": 0
}

def cpu_usage_thread():
    while running:
        cpu = psutil.cpu_percent(interval=INTERVAL, percpu=True)
        cpu_count = psutil.cpu_count()
        data = {
            "avg": sum(cpu) / psutil.cpu_count(),
            "percpu": cpu,
            "cpus": cpu_count,
            "clock": psutil.cpu_freq().current / 1000
        }

        socketio.emit('cpu', data)

def ram_usage_thread():
    while running:
        ram = psutil.virtual_memory()
        data = {
            "total": ram.total, # memoria física
            "available": ram.available, # memoria disponible en la memoria física
            "used": ram.total - ram.available,
            "used_percent": ((ram.total - ram.available) / ram.total) * 100
        }

        socketio.emit('ram', data)
        sleep(INTERVAL)

def disk_usage_thread():
    while running:
        partitions = psutil.disk_partitions()
        data = []
        for partition in partitions:
            if "cdrom" in partition.opts or "snap" in partition.mountpoint:
                continue

            if not partition.fstype:
                continue

            partition_usage = psutil.disk_usage(partition.mountpoint)

            data.append({
                "name": partition.device if platform == "win32" else partition.mountpoint,
                "total": partition_usage.total,
                "used": partition_usage.used,
                "free": partition_usage.free,
                "used_percent": (partition_usage.used / partition_usage.total) * 100 
            })

        socketio.emit('disk', data)
        sleep(INTERVAL)

def net_usage_thread():
    global net_previous
    while running:
        net = psutil.net_io_counters()
        data = {
            "bytes_sent": net.bytes_sent,
            "bytes_recv": net.bytes_recv,
            "speed_sent": (net.bytes_sent - net_previous["bytes_sent"]) / INTERVAL,
            "speed_recv": (net.bytes_recv - net_previous["bytes_recv"]) / INTERVAL
        }

        net_previous["bytes_sent"] = net.bytes_sent
        net_previous["bytes_recv"] = net.bytes_recv
        socketio.emit('net', data)

        sleep(INTERVAL)


def start():
    global running
    running = True

    threads.append(Thread(target=cpu_usage_thread, daemon=True, name="cpu-thread"))
    threads.append(Thread(target=ram_usage_thread, daemon=True, name="ram-thread"))
    threads.append(Thread(target=disk_usage_thread, daemon=True, name="disk-thread"))
    threads.append(Thread(target=net_usage_thread, daemon=True, name="net-thread"))

    for thread in threads:
        print(f"starting {thread.getName()}")
        thread.start()

def stop():
    global running
    running = False

    for thread in threads:
        print(f"stopping {thread.getName()}")
        thread.join()
