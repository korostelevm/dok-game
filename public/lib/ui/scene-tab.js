class SceneTab extends UiComponent {
	constructor(engine, globalFiles) {
		super(engine);
		this.engine = engine;
		this.globalFiles = globalFiles;
		const gameTab = document.getElementById("container").appendChild(document.createElement("div"));
		gameTab.id = "game-tab";
		this.gameTab = gameTab;
	}

	async init() {
		const { engine, globalFiles, gameTab } = this;
		const gameList = {};

		for (let i = 0; i < globalFiles.length; i++) {
			const file = globalFiles[i];
			const { games } = file;
			if (games) {
				for (let j = 0; j < games.length; j++) {
					const game = games[j];
					if (typeof(game) === "object") {
						for (let name in game) {
							if (!gameList[name]) {
								gameList[name] = [];
							}
							for (let s = 0; s < game[name].length; s++) {
								const sceneFile = game[name][s];
								if (typeof(sceneFile) !== "string") {
									continue;
								}
								const [ scene, extension ] = sceneFile.split(".");
								if (extension === "js") {
									const className = StringUtil.kebabToClass(scene);
									gameList[name].push({
										name: className,
										classObj: nameToClass(className) || GameBase,
									});
								} else if (extension === "json") {
									const configFile = `games/${name}/${sceneFile}`;
									const gameConfig = await engine.fileUtils.load(configFile);
									gameList[name].push({
										name: scene,
										classObj: nameToClass(gameConfig.className, true) || GameBase,
										configFile,
									});
								}
							}
						}
					}
				}
			}
		}

		this.buttonForScene = {};
		for (let name in gameList) {
			const groupDiv = gameTab.appendChild(document.createElement("div"));
			groupDiv.style.margin = "2px";
			groupDiv.style.padding = "2px";
			groupDiv.style.color = "white";

			const titleGroup= groupDiv.appendChild(document.createElement("div"));
			titleGroup.style.whiteSpace = "nowrap";
			const checkbox = titleGroup.appendChild(document.createElement("input"));
			checkbox.type = "checkbox";
			checkbox.id = `${name}_checkbox`;
			const gameName = name;
			checkbox.checked = localStorage.getItem(`${gameName}_showScenes`);
			checkbox.addEventListener("change", e => {
				if (checkbox.checked) {
					localStorage.setItem(`${gameName}_showScenes`, true);
				} else {
					localStorage.removeItem(`${gameName}_showScenes`);
				}
				sceneGroupDiv.style.display = checkbox.checked ? "" : "none";
				checkbox.blur();
			});
			checkbox.addEventListener("click", e => e.stopPropagation());

			const titleDiv = titleGroup.appendChild(document.createElement("label"));
			titleDiv.innerText = name;
			titleDiv.for = `${name}_checkbox`;
			const sceneGroupDiv = groupDiv.appendChild(document.createElement("div"));
			sceneGroupDiv.style.marginTop = "4px";
			sceneGroupDiv.style.display = checkbox.checked ? "" : "none";

			gameList[name].forEach(({name, classObj, configFile}) => {
				const button = sceneGroupDiv.appendChild(document.createElement("button"));
				button.classList.add("scene-button");
				button.innerText = name;
				if (classObj.start) {
					button.classList.add("first");
				}
				this.buttonForScene[classObj.constructor.name] = button;
				button.addEventListener("click", e => {
					engine.setGame(new classObj(configFile));
					e.stopPropagation();
					e.preventDefault();
					e.currentTarget.blur();
				});
			});
		}
	}

	setScene(game) {
		for (let sceneTag in this.buttonForScene) {
			if (sceneTag === game.sceneTag) {
				this.buttonForScene[sceneTag].classList.add("selected");
			} else {
				this.buttonForScene[sceneTag].classList.remove("selected");
			}
		}
	}
}