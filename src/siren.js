export class Siren {
        constructor() {
                this.canvas = null;
                this.ctx = null;
                this.playPauseBtn = null;
                this.rightPanel = null;
                this.bottomPanel = null;
                this.audio = null;
                this.sources = [];
        }
        initPlayer() {
                this.canvas = this.initVisualizer();
                this.ctx = this.canvas.getContext("2d");
                this.playPauseBtn = this.initPlayPauseBtn();
                this.rightPanel = this.initRightPanel();
                this.bottomPanel = this.initBottomPanel();
                this.audio = this.initAudio();
        }
        initPlayPauseBtn() {
                const playPauseBtn = document.createElement("div");
                document.body.appendChild(playPauseBtn);
                playPauseBtn.className += "playPauseBtn";

                const span = document.createElement("span");
                playPauseBtn.appendChild(span);
                span.innerHTML = "►";

                playPauseBtn.addEventListener("click", () => {
                        if (this.audio.childElementCount === 0) {
                                this.playFirstTrack();
                        }
                        if (span.innerHTML === "||") {
                                span.innerHTML = "►";
                                this.audio.pause();
                        } else {
                                span.innerHTML = "||";
                                this.audio.play();

                        }
                });
                return playPauseBtn;
        }
        initBottomPanel() {
                const bottomPanel = document.createElement("div");
                document.body.appendChild(bottomPanel);
                bottomPanel.className += " bottomPanel";

                const playNextTrackBtn = document.createElement("div");
                bottomPanel.appendChild(playNextTrackBtn);
                playNextTrackBtn.className += " playNextTrackBtn";
                playNextTrackBtn.innerHTML = "►►";
                playNextTrackBtn.addEventListener("click", () => {
                        this.playNextTrack();
                });

                return bottomPanel;
        }
        initRightPanel() {
                const rightPanel = document.createElement("div");
                document.body.appendChild(rightPanel);
                rightPanel.className += " rightPanel";
                return rightPanel;
        }
        initVisualizer() {
                const canvas = document.createElement("canvas");
                document.body.appendChild(canvas);
                canvas.className += " canvas";
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                window.addEventListener("resize", () => {
                        canvas.width = window.innerWidth;
                        canvas.height = window.innerHeight;
                })
                return canvas;
        }
        initAudio() {
                const audio = document.createElement("audio");
                this.bottomPanel.appendChild(audio);
                audio.className += " audio";
                audio.controls = "contols";
                audio.preload = "auto";
                return audio;
        }
        addSrcToQueue(src) {
                const source = document.createElement("source");
                source.type = "audio/mpeg";
                source.src = src;
                this.sources.push(source);
        }
        playNextTrack() {
                this.audio.pause();
                const tmp = this.sources.shift();
                this.sources.push(tmp);
                this.audio.innerHTML = "";
                this.audio.appendChild(this.sources[0]);
                this.audio.load();
                this.audio.play();
        }
        playFirstTrack() {
                this.audio.pause();
                this.audio.innerHTML = "";
                this.audio.appendChild(this.sources[0]);
                this.audio.load();
                this.audio.play();
        };
        log() {
                console.log(this.playPauseBtn, this.rightPanel, this.bottomPanel, this.playPauseBtn, this.canvas, this.ctx);
        }

}