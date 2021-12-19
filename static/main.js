const UNITS = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
const BYTES = [  1, 2**10, 2**20, 2**30, 2**40, 2**50, 2**60, 2**70, 2**80];
var socket = null;

function getNextUnit(size) {

    if (typeof size !== "number") {
        return null;
    }

    let index = 0;
    do
        index++;
    while (size >= BYTES[index])

    return {
        size: size,
        index: index - 1,
        maxBytes: BYTES[index] - 1, // el número máximo de bytes antes de la siguiente potencia
        unit: UNITS[index - 1]
    };
}

function setCPUUsage(usage) {
    let cpuAvg = document.getElementById("cpuAvg");
    let cpuClock = document.getElementById("cpuClock");
    let cpuCores = document.getElementById("cpuCores");

    cpuAvg.textContent = `${usage['avg'].toFixed(2)}%`;
    cpuClock.textContent = `${usage['clock'].toFixed(3)} GHz`;

    for (let i = 0; i < usage['percpu'].length; i++) {
        let element = document.getElementById(`cpu${i}`);

        if (element == null) {
            element = document.createElement("div");
            element.id = `cpu${i}`;
            element.classList.add("col", "text-center", "fs-3", "w-25", "h-50");

            let cpuText = document.createElement("p");
            cpuText.classList.add("mb-0");
            cpuText.id = `cpuText${i}`;

            let cpuProgressContainer = document.createElement("div");
            cpuProgressContainer.classList.add("progress", "bg-transparent", "h-25");

            let cpuProgress = document.createElement("div");
            cpuProgress.id = `cpuProgress${i}`;
            cpuProgress.classList.add("progress-bar", "bg-secondary");
            cpuProgress.style.width = "0%";

            cpuProgressContainer.appendChild(cpuProgress);
            
            element.appendChild(cpuText);
            element.appendChild(cpuProgressContainer);

            cpuCores.appendChild(element);
        }

        let cpuText = document.getElementById(`cpuText${i}`);
        let cpuProgress = document.getElementById(`cpuProgress${i}`);

        cpuText.textContent = `${usage['percpu'][i]}%`;
        cpuProgress.style.width = `${usage['percpu'][i]}%`;
    }
}

function setRAMUsage(usage) {
    let ramUsed = document.getElementById("ramUsed");
    let ramTotal = document.getElementById("ramTotal");
    ramUsed.textContent = (usage["used"] / 1024 / 1024 / 1024).toFixed(2);
    ramTotal.textContent = (usage["total"] / 1024 / 1024 / 1024).toFixed(2);

    let ramProgress = document.getElementById("ramProgress");
    let ramFree = document.getElementById("ramFree");
    ramProgress.style.width = `${usage["used_percent"]}%`;
    ramProgress.textContent = `${usage["used_percent"].toFixed(2)}%`;
    ramProgress.style.filter = `hue-rotate(${120 - 120*usage["used_percent"]/100}deg)`;

    ramFree.style.width = `${100 - usage["used_percent"]}%`;
    ramFree.textContent = `${(usage["available"] / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function setDiskUsage(disks) {
    let disksDiv = document.getElementById("disks");
    let children = disksDiv.children;
    
    for (let i = disks.length; i < children.length; i++) {
        disksDiv.removeChild(children[i]);
    }

    for (let i = 0; i < disks.length; i++) {
        const disk = disks[i];
        
        let element = document.getElementById(`disk${i}`);

        if (element == null) {
            element = document.createElement("div");
            element.id = `disk${i}`;
            element.classList.add("d-flex", "flex-row", "mt-2", "w-75", "justify-content-evenly", "align-items-center");

            let driveName = document.createElement("span");
            driveName.id = `diskName${i}`;
            driveName.classList.add("fs-5");

            let progressContainer = document.createElement("div");
            progressContainer.classList.add("progress", "w-75");

            let progress = document.createElement("div");
            progress.id = `diskProgress${i}`;
            progress.classList.add("progress-bar", "bg-success");

            let progressFree = document.createElement("div");
            progressFree.id = `diskProgressFree${i}`;
            progressFree.classList.add("progress-bar", "bg-light", "text-dark");

            element.appendChild(driveName);
            element.appendChild(progressContainer);
            progressContainer.appendChild(progress);
            progressContainer.appendChild(progressFree);

            disksDiv.appendChild(element);
        }

        let driveName = document.getElementById(`diskName${i}`);
        let progress = document.getElementById(`diskProgress${i}`);
        let progressFree = document.getElementById(`diskProgressFree${i}`);

        driveName.textContent = disk.name;
        progress.style.width = `${disk.used_percent}%`;
        progress.textContent = `${disk.used_percent.toFixed(2)}%`;

        progressFree.style.width = `${100 - disk.used_percent}%`;
        progressFree.textContent = `${(disk.free / 1024 / 1024 / 1024).toFixed(2)} GB`;
    }
}

function setNetUsage(data) {
    let netInGraph = document.getElementById("netInGraph");
    let netInSpeed = document.getElementById("netInSpeed");
    let netInTotal = document.getElementById("netInTotal");

    let netOutGraph = document.getElementById("netOutGraph");
    let netOutSpeed = document.getElementById("netOutSpeed");
    let netOutTotal = document.getElementById("netOutTotal");

    let inTotalStats = getNextUnit(data.bytes_recv);
    let inSpeedStats = getNextUnit(data.speed_recv);

    let outTotalStats = getNextUnit(data.bytes_sent);
    let outSpeedStats = getNextUnit(data.speed_sent);

    netInSpeed.textContent = `${(inSpeedStats.size / BYTES[inSpeedStats.index]).toFixed(2)} ${inSpeedStats.unit}/s`;
    netOutSpeed.textContent = `${(outSpeedStats.size / BYTES[outSpeedStats.index]).toFixed(2)} ${outSpeedStats.unit}/s`;

    netInTotal.textContent = `${(inTotalStats.size / BYTES[inTotalStats.index]).toFixed(2)} ${inTotalStats.unit}`;
    netOutTotal.textContent = `${(outTotalStats.size / BYTES[outTotalStats.index]).toFixed(2)} ${outTotalStats.unit}`;

    netInGraph.style.height = `${(inSpeedStats.size / inSpeedStats.maxBytes) * 100}%`;
    netOutGraph.style.height = `${(outSpeedStats.size / outSpeedStats.maxBytes) * 100}%`;
}

function init() {
    socket = io(`${window.location.protocol}//${window.location.hostname}`);

    socket.on("cpu", function(data) {
        setCPUUsage(data);
    });

    socket.on("ram", function(data) {
        setRAMUsage(data);
    });

    socket.on("disk", function(data) {
        setDiskUsage(data);
    });

    socket.on("net", function(data) {
        setNetUsage(data);
    });
}

window.onload = init;
