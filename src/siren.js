import * as RxJS from "rxjs/Rx";
export class Siren {
        constructor() {
                this.canvas = this.initCanvas();
                this.playPauseBtn = this.initPlayPauseBtn();
                this.rightPanel = this.initRightPanel();
                this.bottomPanel = this.initBottomPanel();
                this.audio = this.initAudio(this.bottomPanel);
                this.leftPanel = this.initLeftPanel();
                this.audioContext = this.initAudioContext();
                this.requestID = null;
                this.updateLocalPlaylist();
                this.updateLayerContainer(this.leftPanel.layerContainer);
                //this.initKeyboardShortcuts();
                this.RxJSShortcuts();
        }
        domElementCreator(elementName, parentElement, className = null, type = null) {
                const tmpElement = document.createElement(elementName);
                parentElement.appendChild(tmpElement);
                className != null ? tmpElement.classList.add(className) : null;
                type != null ? tmpElement.type = type : null;
                return tmpElement;
        }


        initPlayPauseBtn() {
                const playPauseBtn = this.domElementCreator("div", document.body, "playPauseBtn");
                playPauseBtn.span = this.domElementCreator("span", playPauseBtn, "span");
                playPauseBtn.span.innerHTML = `<i class="fas fa-play"></i>`;
                playPauseBtn.span.addEventListener("click", () => {
                        if (this.audio.childElementCount === 0) {
                                this.playFirstTrack();
                        } else {
                                this.audio.paused === true ? this.audio.play() : this.audio.pause();
                        }
                });
                return playPauseBtn;
        }
        togglePlayPauseBtn() {
                this.playPauseBtn.span.innerHTML = this.audio.paused === true ? `<i class="fas fa-play"></i>` : `<i class="fas fa-pause"></i>`;
        }
        initBottomPanel() {
                const bottomPanel = this.domElementCreator("div", document.body, "bottomPanel");
                bottomPanel.controls = this.domElementCreator("div", bottomPanel, "controls");
                bottomPanel.controls.playPreviousTrackBtn = this.domElementCreator("span", bottomPanel.controls, "playNextTrackBtn");
                bottomPanel.controls.playPreviousTrackBtn.innerHTML = `<i class="fas fa-fast-backward"></i>`;
                bottomPanel.controls.playPreviousTrackBtn.addEventListener("click", () => {
                        this.playPreviousTrack();
                });
                bottomPanel.controls.playNextTrackBtn = this.domElementCreator("span", bottomPanel.controls, "playNextTrackBtn");
                bottomPanel.controls.playNextTrackBtn.innerHTML = `<i class="fas fa-fast-forward"></i>`;
                bottomPanel.controls.playNextTrackBtn.addEventListener("click", () => {
                        this.playNextTrack();
                });
                return bottomPanel;
        }
        initLeftPanel() {
                const leftPanel = this.domElementCreator("div", document.body, "leftPanel");
                leftPanel.label = this.domElementCreator("div", leftPanel, "label");
                leftPanel.label.innerHTML = `<i class="fas fa-cogs"></i>`;
                
                leftPanel.layerContainer = this.domElementCreator("div", leftPanel, "layerContainer");
                leftPanel.layerContainer.layerJSON = [];

                leftPanel.label.addEventListener("click",_=>{
                        leftPanel.layerContainer.layerJSON.push({
                                barWidth: Math.floor(screen.width * 0.005),
                                gapWidth: Math.floor(screen.width * 0),
                                barHeight: Math.floor(screen.height * 0.7),
                                barColor: "#000"
                        });
                        this.updateLayerContainer(leftPanel.layerContainer)
                });

                // fordel
                leftPanel.layerContainer.layerJSON.push({
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

                return leftPanel;
        }
        updateLayerContainer(layerContainer) {
                layerContainer.innerHTML = "";
                layerContainer.layerJSON.forEach((data,index) => {
                        const layer = this.domElementCreator("div", layerContainer, "layer");
                        layer.deleteBtn = this.domElementCreator("div", layer, "deleteBtn");
                        layer.deleteBtn.innerHTML = `<i class="fas fa-trash-alt"></i>`;
                        layer.deleteBtn.addEventListener("click", (event) => {
                                event.stopPropagation();
                                layer.deleteBtn.parentNode.parentNode.removeChild(layer.deleteBtn.parentNode);
                                layerContainer.layerJSON.splice(index, 1);
                                this.updateLayerContainer(layerContainer);
                        });
                        layer.p1 = this.domElementCreator("p", layer);
                        layer.p1.innerHTML = "Single bar width:";
                        layer.inputBarWidth = this.domElementCreator("input", layer, "input", "range");
                        layer.inputBarWidth.min = 0.002;
                        layer.inputBarWidth.max = 0.1;
                        layer.inputBarWidth.step = 0.001;
                        layer.inputBarWidth.value = parseFloat(data.barWidth) / screen.width;
                        layer.inputBarWidth.addEventListener("change", _ => {
                                data.barWidth = Math.floor(screen.width * layer.inputBarWidth.value);
                        })
                        layer.p2 = this.domElementCreator("p", layer);
                        layer.p2.innerHTML = "Single gap width:";
                        layer.inputGapWidth = this.domElementCreator("input", layer, "input", "range");
                        layer.inputGapWidth.min = 0;
                        layer.inputGapWidth.max = 0.1;
                        layer.inputGapWidth.step = 0.001;
                        layer.inputGapWidth.value = parseFloat(data.gapWidth) / screen.width;
                        layer.inputGapWidth.addEventListener("change", _ => {
                                data.gapWidth = Math.floor(screen.width * layer.inputGapWidth.value);
                        })
                        layer.p3 = this.domElementCreator("p", layer);
                        layer.p3.innerHTML = "Single bar heihgt scale:";
                        layer.inputBarHeihgt = this.domElementCreator("input", layer, "input", "range");
                        layer.inputBarHeihgt.min = 0;
                        layer.inputBarHeihgt.max = 1;
                        layer.inputBarHeihgt.step = 0.001;
                        layer.inputBarHeihgt.value = parseFloat(data.barHeight) / screen.height;
                        layer.inputBarHeihgt.addEventListener("change", _ => {
                                data.barHeight = Math.floor(screen.height * layer.inputBarHeihgt.value);
                        })
                        layer.p4 = this.domElementCreator("p", layer);
                        layer.p4.innerHTML = "Bar color:";
                        layer.inputBarColor = this.domElementCreator("input", layer, "input", "color");
                        layer.inputBarColor.value = data.barColor;
                        layer.inputBarColor.addEventListener("change", _ => {
                                data.barColor = layer.inputBarColor.value;
                        })
                })
        }
        initRightPanel() {
                const rightPanel = this.domElementCreator("div", document.body, "rightPanel");
                rightPanel.loader = this.domElementCreator("input", rightPanel, "loader", "file");
                rightPanel.loader.id = "file";
                rightPanel.loader.accept = ".mp3"
                rightPanel.loader.multiple = true;
                rightPanel.label = this.domElementCreator("label", rightPanel, "label");
                rightPanel.label.htmlFor = "file";
                rightPanel.label.innerHTML = `<i class="fas fa-plus"></i>`;
                rightPanel.loader.addEventListener("change", (event) => {
                        [...rightPanel.loader.files].map((file) => file.name.slice(0, -4)).sort((name1, name2) => name1 < name2).reduce((promises, name) =>
                                promises.then(_ => this.addToRemotePlaylist(name, `../data/music/${name}.mp3`)), Promise.resolve([])
                        ).then(_ => {
                                this.updateLocalPlaylist();
                        });
                });
                rightPanel.playlist = this.domElementCreator("div", rightPanel, "playlist");
                return rightPanel;
        }
        initCanvas() {
                const canvas = this.domElementCreator("canvas", document.body, "canvas");
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                canvas.ctx = canvas.getContext("2d");
                window.addEventListener("resize", () => {
                        canvas.width = window.innerWidth;
                        canvas.height = window.innerHeight;
                })
                return canvas;
        }
        initAudio(parent) {
                const audio = this.domElementCreator("audio", parent, "audio");
                audio.controls = "contols";
                audio.preload = "auto";
                audio.sourceElements = [];
                audio.addEventListener("play", _ => {
                        this.runVisualizer();
                        this.togglePlayPauseBtn();
                });
                audio.addEventListener("pause", _ => {
                        this.stopVisualizer();
                        this.togglePlayPauseBtn();
                });
                audio.addEventListener("ended", _ => {
                        this.playNextTrack();
                });
                return audio;
        }
        addSourceToQueue(newSource, index) {
                const source = document.createElement("source");
                source.type = "audio/mpeg";
                source.src = newSource;
                this.audio.sourceElements[index] = source;
        }
        playTrackAtIndex(index) {
                this.audio.pause();
                this.audio.innerHTML = "";
                this.audio.appendChild(this.audio.sourceElements[index]);
                this.audio.load();
                this.audio.play();
        }
        playFirstTrack() {
                if (this.audio.sourceElements.length === 0) {
                        return;
                }
                this.playTrackAtIndex(0);
        }
        playNextTrack() {
                if (this.audio.sourceElements.length === 0) {
                        return;
                }
                this.playTrackAtIndex((this.audio.sourceElements.indexOf(this.audio.firstChild) + 1) % this.audio.sourceElements.length);
        }
        playPreviousTrack() {
                if (this.audio.sourceElements.length === 0) {
                        return;
                }
                if (this.audio.sourceElements.length === 0) {
                        return;
                }
                this.playTrackAtIndex((this.audio.sourceElements.indexOf(this.audio.firstChild) + this.audio.sourceElements.length - 1) % this.audio.sourceElements.length);
        }
        forwardFiveSec(audio) {
                audio.currentTime += 5;
        }
        backwardFiveSec(audio) {
                audio.currentTime -= 5;
        }
        increaseVolume(audio) {
                audio.volume = audio.volume + 0.1 >= 1 ? 1 : audio.volume + 0.1;
        }
        decreaseVolume(audio) {
                audio.volume = audio.volume - 0.1 <= 0 ? 0 : audio.volume - 0.1;
        }
        muteAudio(audio) {
                audio.muted = audio.muted === true ? false : true;
        }
        initAudioContext() {
                const audioContext = new AudioContext();
                audioContext.analyser = audioContext.createAnalyser();
                audioContext.source = audioContext.createMediaElementSource(this.audio);
                audioContext.source.connect(audioContext.analyser);
                audioContext.analyser.connect(audioContext.destination);
                return audioContext;
        }
        updateVisualizer(params) {
                this.requestID = requestAnimationFrame(_ => this.updateVisualizer(params));
                this.audioContext.analyser.fbcArray = new Uint8Array(this.audioContext.analyser.frequencyBinCount);
                this.audioContext.analyser.getByteFrequencyData(this.audioContext.analyser.fbcArray);
                this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                params.forEach(param => {
                        this.canvas.ctx.fillStyle = param.barColor;
                        const barStep = param.barWidth + param.gapWidth;
                        const NumberOfBars = (this.canvas.width / barStep >= 1024) ? this.canvas.width / barStep : 1023;
                        for (let i = 0; i < NumberOfBars; i++) {
                                const barX = i * barStep;
                                const barHeight = -(this.audioContext.analyser.fbcArray[i * Math.floor(1024 / NumberOfBars)]) / 255 * param.barHeight;
                                this.canvas.ctx.fillRect(barX, this.canvas.height, param.barWidth, barHeight);
                        }
                });
        }
        runVisualizer() {
                this.requestID = requestAnimationFrame(_ => this.updateVisualizer(this.leftPanel.layerContainer.layerJSON));
        }
        stopVisualizer() {
                setTimeout(_ => {
                        cancelAnimationFrame(this.requestID);
                }, 2000);

        }
        addToRemotePlaylist(name, path) {
                return fetch("http://localhost:3000/playlist", {
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
        updateLocalPlaylist() {
                this.audio.sourceElements = [];
                this.rightPanel.playlist.innerHTML = "";
                return fetch("http://localhost:3000/playlist")
                        .then(response => response.json().then((response) => response.reverse().forEach((element, index) => {
                                const track = this.domElementCreator("div", this.rightPanel.playlist, "track");
                                const deleteBtn = this.domElementCreator("div", track, "deleteBtn");
                                deleteBtn.innerHTML = `<i class="fas fa-trash-alt"></i>`;
                                deleteBtn.addEventListener("click", (event) => {
                                        fetch(`http://localhost:3000/playlist/${element.id}`, {
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
                                        this.audio.sourceElements.splice(index, 1);
                                });
                                const name = this.domElementCreator("div", track, "name");
                                name.innerHTML = `Name: ${element.name}`;
                                track.addEventListener("click", _ => {
                                        this.playTrackAtIndex(index);
                                });
                                this.addSourceToQueue(`${element.path}`, index);
                        })));
        }
        initKeyboardShortcuts() {
                window.addEventListener("keydown", event => {
                        e.which == 32 ? this.playPauseBtn.span.click() :
                                e.which == 37 ? this.backwardFiveSec(this.audio) :
                                e.which == 39 ? this.forwardFiveSec(this.audio) :
                                e.which == 77 ? this.muteAudio(this.audio) :
                                e.which == 38 ? this.increaseVolume(this.audio) :
                                e.which == 40 ? this.decreaseVolume(this.audio) : null;
                });
        }
        RxJSShortcuts() {
                RxJS.Observable.fromEvent(window, "keydown").subscribe(e => {
                        e.which == 32 ? this.playPauseBtn.span.click() :
                                e.which == 37 ? this.backwardFiveSec(this.audio) :
                                e.which == 39 ? this.forwardFiveSec(this.audio) :
                                e.which == 77 ? this.muteAudio(this.audio) :
                                e.which == 38 ? this.increaseVolume(this.audio) :
                                e.which == 40 ? this.decreaseVolume(this.audio) : null;
                }, err => {
                        console.log("error");
                }, complete => {

                })
        }
}