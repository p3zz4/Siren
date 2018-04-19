import * as RxJS from "rxjs/Rx";
import {
        domElementCreator
} from "./dom-element-creator"
import {
        initAnalyser
} from "./analyser"

export class Siren {
        constructor() {
                this.dbLocation = "http://localhost:3000/playlist";
                this.audio = this.initAudio();
                this.analyser = initAnalyser(this.audio);
                this.canvas = this.initCanvas(this.audio, this.analyser);
                this.playPauseBtn = this.initPlayPauseBtn(this.audio);
                this.bottomPanel = this.initBottomPanel(this.audio);
                this.leftPanel = this.initLeftPanel(this.canvas.layerParamsArray);
                this.rightPanel = this.initRightPanel(this.audio, this.dbLocation);
                // this.initKeyboardShortcuts(this.audio, this.playPauseBtn);
                this.RxJSShortcuts(this.audio, this.playPauseBtn);
        }
        initAudio() {
                const audio = domElementCreator("audio", null, "audio");
                audio.controls = "contols";
                audio.crossOrigin = "anonymous";
                audio.preload = "auto";
                audio.sourceElements = [];
                audio.addEventListener("ended", _ => {
                        audio.playNextTrack(audio);
                });
                audio.playTrackAtIndex = function (audio, index) {
                        audio.pause();
                        audio.innerHTML = "";
                        audio.appendChild(audio.sourceElements[index]);
                        audio.load();
                        audio.play();
                }
                audio.playFirstTrack = function (audio) {
                        if (audio.sourceElements.length === 0) {
                                return;
                        }
                        audio.playTrackAtIndex(audio, 0);
                }
                audio.playNextTrack = function (audio) {
                        if (audio.sourceElements.length === 0) {
                                return;
                        }
                        const index = (audio.sourceElements.indexOf(audio.firstChild) + 1) % audio.sourceElements.length;
                        audio.playTrackAtIndex(audio, index);
                }
                audio.playPreviousTrack = function (audio) {
                        if (audio.sourceElements.length === 0) {
                                return;
                        }
                        const index = (audio.sourceElements.indexOf(audio.firstChild) + audio.sourceElements.length - 1) % audio.sourceElements.length;
                        audio.playTrackAtIndex(audio, index);
                }
                audio.forwardFiveSec = function (audio) {
                        audio.currentTime += 5;
                }
                audio.backwardFiveSec = function (audio) {
                        audio.currentTime -= 5;
                }
                audio.increaseVolume = function (audio) {
                        audio.volume = audio.volume + 0.1 >= 1 ? 1 : audio.volume + 0.1;
                }
                audio.decreaseVolume = function (audio) {
                        audio.volume = audio.volume - 0.1 <= 0 ? 0 : audio.volume - 0.1;
                }
                audio.muteAudio = function (audio) {
                        audio.muted = audio.muted === true ? false : true;
                }
                return audio;
        }

        initCanvas(audio, analyser) {
                let requestID = null; // used for cancelAnimationFrame

                const canvas = domElementCreator("canvas", document.body, "canvas");
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                const ctx = canvas.getContext("2d");
                canvas.layerParamsArray = [];
                canvas.layerParamsArray.push({
                        barWidth: Math.floor(screen.width * 0.005),
                        gapWidth: Math.floor(screen.width * 0),
                        barHeight: Math.floor(screen.height * 0.7),
                        barColor: "#02FCFA"
                }, {
                        barWidth: Math.floor(screen.width * 0.01),
                        gapWidth: Math.floor(screen.width * 0.002),
                        barHeight: Math.floor(screen.height * 0.5),
                        barColor: "#AAFF00"
                }, {
                        barWidth: Math.floor(screen.width * 0.02),
                        gapWidth: Math.floor(screen.width * 0.005),
                        barHeight: Math.floor(screen.height * 0.2),
                        barColor: "#AA00FF"
                });
                window.addEventListener("resize", _ => {
                        canvas.width = window.innerWidth;
                        canvas.height = window.innerHeight;
                })
                audio.addEventListener("play", _ => {
                        runVisualizer(canvas.layerParamsArray, analyser, canvas, ctx);
                });
                audio.addEventListener("pause", _ => {
                        stopVisualizer(audio);
                });

                function updateVisualizer(params, analyser, canvas, ctx) {
                        const fbcArray = new Uint8Array(analyser.frequencyBinCount);
                        analyser.getByteFrequencyData(fbcArray);
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        params.forEach(param => {
                                ctx.fillStyle = param.barColor;
                                const barStep = param.barWidth + param.gapWidth;
                                const NumberOfBars = Math.floor(canvas.width / barStep);
                                for (let i = 0; i < NumberOfBars; i++) {
                                        const barX = i * barStep;
                                        const barHeight = -(fbcArray[i % 1024]) / 255 * param.barHeight;
                                        ctx.fillRect(barX, canvas.height, param.barWidth, barHeight);
                                }
                        });
                        requestID = requestAnimationFrame(_ => updateVisualizer(params, analyser, canvas, ctx));
                }

                function runVisualizer(params, analyser, canvas, ctx) {
                        requestID = requestAnimationFrame(_ => updateVisualizer(params, analyser, canvas, ctx));
                }

                function stopVisualizer(audio) {
                        setTimeout(_ => {
                                audio.paused && cancelAnimationFrame(requestID);
                        }, 2000);
                }

                return canvas;
        }

        initPlayPauseBtn(audio) {
                const playPauseBtn = domElementCreator("div", document.body, "playPauseBtn");
                playPauseBtn.span = domElementCreator("span", playPauseBtn, "span");
                playPauseBtn.span.innerHTML = `<i class="fas fa-play"></i>`;
                playPauseBtn.span.addEventListener("click", _ => {
                        if (audio.childElementCount === 0) {
                                audio.playFirstTrack(audio);
                        } else {
                                audio.paused === true ? audio.play() : audio.pause();
                        }
                });

                audio.addEventListener("play", _ => {
                        togglePlayPauseBtn(audio, playPauseBtn.span);
                });

                audio.addEventListener("pause", _ => {
                        togglePlayPauseBtn(audio, playPauseBtn.span);
                });

                function togglePlayPauseBtn(audio, span) {
                        span.innerHTML = audio.paused === true ? `<i class="fas fa-play"></i>` : `<i class="fas fa-pause"></i>`;
                }
                return playPauseBtn;
        }

        initBottomPanel(audio) {
                const bottomPanel = domElementCreator("div", document.body, "bottomPanel");

                const controls = domElementCreator("div", bottomPanel, "controls");

                const playPreviousTrackBtn = domElementCreator("span", controls);
                playPreviousTrackBtn.innerHTML = `<i class="fas fa-fast-backward"></i>`;
                playPreviousTrackBtn.addEventListener("click", _ => {
                        audio.playPreviousTrack(audio);
                });

                const playNextTrackBtn = domElementCreator("span", controls);
                playNextTrackBtn.innerHTML = `<i class="fas fa-fast-forward"></i>`;
                playNextTrackBtn.addEventListener("click", _ => {
                        audio.playNextTrack(audio);
                });

                bottomPanel.appendChild(audio);
                return bottomPanel;
        }

        initLeftPanel(layerParamsArray) {
                const leftPanel = domElementCreator("div", document.body, "leftPanel");
                leftPanel.label = domElementCreator("div", leftPanel, "label");
                leftPanel.label.innerHTML = `<i class="fas fa-cogs"></i>`;

                const layerContainer = domElementCreator("div", leftPanel, "layerContainer");
                leftPanel.label.addEventListener("click", _ => {
                        layerParamsArray.push({
                                barWidth: Math.floor(screen.width * 0.005),
                                gapWidth: Math.floor(screen.width * 0.005),
                                barHeight: Math.floor(screen.height * 0.4),
                                barColor: "#000"
                        });
                        updateLayerContainer(layerContainer, layerParamsArray);
                });
                window.addEventListener("load", _ => {
                        updateLayerContainer(layerContainer, layerParamsArray);
                });

                function updateLayerContainer(layerContainer, layerParamsArray) {
                        layerContainer.innerHTML = "";
                        layerParamsArray.forEach((data, index) => {
                                const layer = domElementCreator("div", layerContainer, "layer");
                                const deleteBtn = domElementCreator("div", layer, "deleteBtn");
                                deleteBtn.innerHTML = `<i class="fas fa-trash-alt"></i>`;
                                deleteBtn.addEventListener("click", (event) => {
                                        event.stopPropagation();
                                        deleteBtn.parentNode.parentNode.removeChild(deleteBtn.parentNode);
                                        layerParamsArray.splice(index, 1);
                                        updateLayerContainer(layerContainer, layerParamsArray);
                                });
                                const p1 = domElementCreator("p", layer);
                                p1.innerHTML = "Single bar width:";
                                const inputBarWidth = domElementCreator("input", layer, "input", "range");
                                inputBarWidth.min = 0.002;
                                inputBarWidth.max = 0.1;
                                inputBarWidth.step = 0.0005;
                                inputBarWidth.value = parseFloat(data.barWidth) / screen.width;
                                inputBarWidth.addEventListener("change", _ => {
                                        data.barWidth = Math.floor(screen.width * inputBarWidth.value);
                                })
                                const p2 = domElementCreator("p", layer);
                                p2.innerHTML = "Single gap width:";
                                const inputGapWidth = domElementCreator("input", layer, "input", "range");
                                inputGapWidth.min = 0;
                                inputGapWidth.max = 0.1;
                                inputGapWidth.step = 0.0005;
                                inputGapWidth.value = parseFloat(data.gapWidth) / screen.width;
                                inputGapWidth.addEventListener("change", _ => {
                                        data.gapWidth = Math.floor(screen.width * inputGapWidth.value);
                                })
                                const p3 = domElementCreator("p", layer);
                                p3.innerHTML = "Single bar heihgt scale:";
                                const inputBarHeihgt = domElementCreator("input", layer, "input", "range");
                                inputBarHeihgt.min = 0;
                                inputBarHeihgt.max = 1;
                                inputBarHeihgt.step = 0.001;
                                inputBarHeihgt.value = parseFloat(data.barHeight) / screen.height;
                                inputBarHeihgt.addEventListener("change", _ => {
                                        data.barHeight = Math.floor(screen.height * inputBarHeihgt.value);
                                })
                                const p4 = domElementCreator("p", layer);
                                p4.innerHTML = "Bar color:";
                                const inputBarColor = domElementCreator("input", layer, "color", "color");
                                inputBarColor.value = data.barColor;
                                inputBarColor.addEventListener("change", _ => {
                                        data.barColor = inputBarColor.value;
                                })
                        })
                }
                return leftPanel;
        }

        initRightPanel(audio, dbLocation) {
                const rightPanel = domElementCreator("div", document.body, "rightPanel");
                const loader = domElementCreator("input", rightPanel, "loader", "file");
                loader.id = "file";
                loader.accept = ".mp3"
                loader.multiple = true;
                rightPanel.label = domElementCreator("label", rightPanel, "label");
                rightPanel.label.htmlFor = "file";
                rightPanel.label.innerHTML = `<i class="fas fa-plus"></i>`;
                const playlist = domElementCreator("div", rightPanel, "playlist");
                window.addEventListener("load", _ => {
                        updateLocalPlaylist(audio, playlist, dbLocation);
                });
                loader.addEventListener("change", (event) => {
                        [...loader.files].map((file) => file.name.slice(0, -4)).sort((name1, name2) => name1 < name2).reduce((promises, name) =>
                                promises.then(_ => addToRemotePlaylist(name, `../data/music/${name}.mp3`, dbLocation)), Promise.resolve([])
                        ).then(_ => {
                                updateLocalPlaylist(audio, playlist, dbLocation);
                        });
                });

                function addToRemotePlaylist(name, path, dbLocation) {
                        return fetch(`${dbLocation}`, {
                                headers: {
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json'
                                },
                                method: "POST",
                                body: JSON.stringify({
                                        name: `${name}`,
                                        path: `${path}`
                                })
                        });
                }

                function updateLocalPlaylist(audio, playlist, dbLocation) {
                        audio.sourceElements = [];
                        playlist.innerHTML = "";
                        return fetch(`${dbLocation}`)
                                .then(response => response.json().then((response) => response.reverse().forEach((element, index) => {
                                        const track = domElementCreator("div", playlist, "track");
                                        const deleteBtn = domElementCreator("div", track, "deleteBtn");
                                        deleteBtn.innerHTML = `<i class="fas fa-trash-alt"></i>`;
                                        deleteBtn.addEventListener("click", (event) => {
                                                fetch(`${dbLocation}/${element.id}`, {
                                                        headers: {
                                                                'Accept': 'application/json',
                                                                'Content-Type': 'application/json'
                                                        },
                                                        method: "DELETE"
                                                }).catch((err) => {
                                                        console.log(err)
                                                });
                                                event.stopPropagation();
                                                deleteBtn.parentNode.parentNode.removeChild(deleteBtn.parentNode);
                                                audio.sourceElements.splice(index, 1);
                                                updateLocalPlaylist(audio, playlist, dbLocation);
                                        });
                                        const name = domElementCreator("div", track, "name");
                                        name.innerHTML = `Name: ${element.name}`;
                                        track.addEventListener("click", _ => {
                                                audio.playTrackAtIndex(audio, index);
                                        });
                                        addSourceToQueue(audio, `${element.path}`, index);
                                })));
                }

                function addSourceToQueue(audio, newSource, index) {
                        const source = document.createElement("source");
                        source.type = "audio/mp4";
                        source.src = newSource;
                        audio.sourceElements[index] = source;
                }
                return rightPanel;
        }

        initKeyboardShortcuts(audio, playPauseBtn) {
                window.addEventListener("keydown", event => {
                        event.which == 32 ? playPauseBtn.span.click() :
                                event.which == 37 ? audio.backwardFiveSec(audio) :
                                event.which == 39 ? audio.forwardFiveSec(audio) :
                                event.which == 77 ? audio.muteAudio(audio) :
                                event.which == 38 ? audio.increaseVolume(audio) :
                                event.which == 40 ? audio.decreaseVolume(audio) : null;
                });
        }

        RxJSShortcuts() {
                RxJS.Observable.fromEvent(window, "keydown").subscribe(e => {
                        event.which == 32 ? playPauseBtn.span.click() :
                                event.which == 37 ? audio.backwardFiveSec(audio) :
                                event.which == 39 ? audio.forwardFiveSec(audio) :
                                event.which == 77 ? audio.muteAudio(audio) :
                                event.which == 38 ? audio.increaseVolume(audio) :
                                event.which == 40 ? audio.decreaseVolume(audio) : null;
                }, err => {
                        console.log("error");
                }, complete => {

                })
        }
}