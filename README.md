# simple-system-monitoring
Simple way to monitor a Windows/Linux system with a web interface.

## Running

This software has been tested in Python 3.8+.

First, clone this repository:

```bash
git clone https://github.com/eplq/simple-system-monitoring
```

Go to simple-system-monitoring folder:

```bash
cd simple-system-monitoring
```

Install dependencies:

```bash
pip3 install -r requirements.txt      # linux
py -m pip install -r requirements.txt # windows
```

And run the software:

```bash
python3 main.py # linux
py main.py      # windows
```

## How it works

It gets stats about CPU, RAM, disks and network every second (can be configured in `const.py` file, < 0.5s not recommended).

All stats are provided by the [psutil](https://github.com/giampaolo/psutil) library. 

Those stats are broadcasted with Socket.io, which allows to make your custom client only connecting to the Socket.io server.

The events are `cpu`, `ram`, `disk` and `net`.

There is a built-in web interface to show how it works. Check the `templates` and `static` folders.

It uses the following technologies:

- Python 3.8+
- Flask
- Socket.io
- psutil
- Bootstrap 5
- Pure JS.

For the HTML style no custom CSS was used, only Bootstrap.

## License

This project is licensed under the [MIT](https://github.com/eplq/simple-system-monitoring/blob/main/LICENSE) License.
