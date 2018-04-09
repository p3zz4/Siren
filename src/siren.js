import * as RxJS from "rxjs/Rx";
export class Siren {
        constructor() {
                this.canvas = this.initCanvas();
                this.ctx = this.canvas.getContext("2d");
                this.playPauseBtn = this.initPlayPauseBtn();
                this.rightPanel = this.initRightPanel();
                this.playlist = this.initPlaylist();
                this.bottomPanel = this.initBottomPanel();
                this.audio = this.initAudio();
                this.sourceElements = [];
                this.analyser = this.initAnalyser();
                this.requestID = null;
                this.updateLocalPlaylist();
                //this.initKeyboardShortcuts();
                this.RxJSShortcuts();
        }
        domElementCreator(elementName, parentElement, className) {
                const tmpElement = document.createElement(elementName);
                parentElement.appendChild(tmpElement);
                tmpElement.classList.add(className);
                return tmpElement;
        }

        initPlayPauseBtn() {
                const playPauseBtn = this.domElementCreator("div", document.body, "playPauseBtn");
                const span = this.domElementCreator("span", playPauseBtn, "span");
                span.innerHTML = `<i class="fas fa-play"></i>`;
                span.addEventListener("click", () => {
                        if (this.audio.childElementCount === 0) {
                                this.playFirstTrack();
                        } else {
                                this.audio.paused === true ? this.audio.play() : this.audio.pause();
                        }
                });
                return span;
        }
        togglePlayPauseBtn() {
                this.playPauseBtn.innerHTML = this.audio.paused === true ? `<i class="fas fa-play"></i>` : `<i class="fas fa-pause"></i>`;
        }
        initBottomPanel() {
                const bottomPanel = this.domElementCreator("div", document.body, "bottomPanel");
                const controls = this.domElementCreator("div", bottomPanel, "controls");
                const playPreviousTrackBtn = this.domElementCreator("span", controls, "playNextTrackBtn");

                playPreviousTrackBtn.innerHTML = `<i class="fas fa-fast-backward"></i>`;
                playPreviousTrackBtn.addEventListener("click", () => {
                        this.playPreviousTrack();
                });

                const playNextTrackBtn = this.domElementCreator("span", controls, "playNextTrackBtn");
                playNextTrackBtn.innerHTML = `<i class="fas fa-fast-forward"></i>`;
                playNextTrackBtn.addEventListener("click", () => {
                        this.playNextTrack();
                });

                return bottomPanel;
        }
        initRightPanel() {
                const rightPanel = this.domElementCreator("div", document.body, "rightPanel");
                const loader = this.domElementCreator("input", rightPanel, "loader");
                loader.type = "file";
                loader.id = "file";
                loader.accept = ".mp3"
                loader.multiple = true;

                const label = this.domElementCreator("label", rightPanel, "label");
                label.htmlFor = "file";
                label.innerHTML = `<i class="fas fa-plus"></i>`;

                loader.addEventListener("change", (event) => {
                        [...loader.files].map((file) => file.name.slice(0, -4)).sort((name1, name2) => name1 < name2).reduce((promises, name) =>
                                promises.then(_ => this.addToRemotePlaylist(name, `../data/music/${name}.mp3`)), Promise.resolve([])
                        ).then(_ => {
                                this.updateLocalPlaylist();
                        });
                });

                return rightPanel;
        }
        initPlaylist() {
                const playlist = this.domElementCreator("div", this.rightPanel, "playlist");
                return playlist;
        }
        initCanvas() {
                const canvas = this.domElementCreator("canvas", document.body, "canvas");
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                window.addEventListener("resize", () => {
                        canvas.width = window.innerWidth;
                        canvas.height = window.innerHeight;
                })
                return canvas;
        }
        initAudio() {
                const audio = this.domElementCreator("audio", this.bottomPanel, "audio");
                audio.controls = "contols";
                audio.preload = "auto";
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
                this.sourceElements[index] = source;
        }
        playTrackAtIndex(index) {
                this.audio.pause();
                this.audio.innerHTML = "";
                this.audio.appendChild(this.sourceElements[index]);
                this.audio.load();
                this.audio.play();
        }
        playFirstTrack() {
                if (this.sourceElements.length === 0) {
                        return;
                }
                this.playTrackAtIndex(0);
        }
        playNextTrack() {
                if (this.sourceElements.length === 0) {
                        return;
                }
                this.playTrackAtIndex((this.sourceElements.indexOf(this.audio.firstChild) + 1) % this.sourceElements.length);
        }
        playPreviousTrack() {
                if (this.sourceElements.length === 0) {
                        return;
                }
                if (this.sourceElements.length === 0) {
                        return;
                }
                this.playTrackAtIndex((this.sourceElements.indexOf(this.audio.firstChild) + this.sourceElements.length - 1) % this.sourceElements.length);
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
        initAnalyser() {
                const context = new AudioContext();
                const analyser = context.createAnalyser();
                const source = context.createMediaElementSource(this.audio);
                source.connect(analyser);
                analyser.connect(context.destination);
                return analyser;
        }
        updateVisualizer() {
                //test
                this.requestID = requestAnimationFrame(_ => this.updateVisualizer());
                const fbcArray = new Uint8Array(this.analyser.frequencyBinCount);
                this.analyser.getByteFrequencyData(fbcArray);
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.fillStyle = '#0DDEFF';
                // const barWidth = window.innerWidth / 400;
                // const gap = window.innerWidth / 400 / 2;
                const barWidth = 2;
                const gap = 1;
                const barStep = barWidth + gap;
                const NumberOfBars = (this.canvas.width / barStep >= 1024) ? this.canvas.width / barStep : 1023;
                for (let i = 0; i < NumberOfBars; i++) {
                        const barX = i * barStep;
                        const barHeight = -(fbcArray[i]) * 0.004 * window.innerHeight * 0.8; // 0.004 ~ 1/255; array takes value from 0 to 255
                        this.ctx.fillRect(barX, this.canvas.height, barWidth, barHeight);
                }
        }
        runVisualizer() {
                this.requestID = requestAnimationFrame(_ => this.updateVisualizer());
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
                                //id: `${path}`,
                                name: `${name}`,
                                path: `${path}`
                        })
                });
        }
        updateLocalPlaylist() {
                this.sourceElements = [];
                this.playlist.innerHTML = "";
                return fetch("http://localhost:3000/playlist")
                        .then(response => response.json().then((response) => response.reverse().forEach((element, index) => {
                                const track = this.domElementCreator("div", this.playlist, "track");
                                const deleteBtn = this.domElementCreator("div", track, "deleteBtn");
                                deleteBtn.innerHTML = `<i class="fas fa-times"></i>`;
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
                                        this.sourceElements.splice(index, 1);
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
                        e.which == 32 ? this.playPauseBtn.click() :
                                e.which == 37 ? this.backwardFiveSec(this.audio) :
                                e.which == 39 ? this.forwardFiveSec(this.audio) :
                                e.which == 77 ? this.muteAudio(this.audio) :
                                e.which == 38 ? this.increaseVolume(this.audio) :
                                e.which == 40 ? this.decreaseVolume(this.audio) : null;
                });
        }
        RxJSShortcuts() {
                RxJS.Observable.fromEvent(window, "keydown").subscribe(e => {
                        e.which == 32 ? this.playPauseBtn.click() :
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