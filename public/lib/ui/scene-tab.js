class SceneTab {
	constructor(engine, globalFiles, gameTab) {
		const gameList = {};
		globalFiles.forEach(file => {
			const { games } = file;
			if (games) {
				games.forEach(game => {
					if (typeof(game) === "object") {
						for (let name in game) {
							if (!gameList[name]) {
								gameList[name] = [];
							}
							game[name].forEach(sceneFile => {
								if (typeof(sceneFile) !== "string") {
									return;
								}
								const [ scene, extension ] = sceneFile.split(".");
								if (extension !== "js") {
									return;
								}
								const className = StringUtil.kebabToClass(scene);
								if (className !== "Index" && className !== "GameCore") {
									gameList[name].push(className);
								}
							});
						}
					}
				});
			}
		});

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
			});

			const titleDiv = titleGroup.appendChild(document.createElement("label"));
			titleDiv.innerText = name;
			titleDiv.for = `${name}_checkbox`;
			const sceneGroupDiv = groupDiv.appendChild(document.createElement("div"));
			sceneGroupDiv.style.marginTop = "4px";
			sceneGroupDiv.style.display = checkbox.checked ? "" : "none";

			gameList[name].forEach(className => {
				const button = sceneGroupDiv.appendChild(document.createElement("button"));
				button.classList.add("scene-button");
				button.innerText = className;
				const classObj = eval(className);
				if (classObj.start) {
					button.classList.add("first");
				}
				if (!engine.classes) {
					engine.classes = {};
				}
				engine.classes[className] = classObj;
				this.buttonForScene[className] = button;
				button.addEventListener("mousedown", () => 	engine.setGame(new classObj()));
			});
		}
	}

	setScene(game) {
		for (let sceneName in this.buttonForScene) {
			if (sceneName === game.sceneName) {
				this.buttonForScene[sceneName].classList.add("selected");
			} else {
				this.buttonForScene[sceneName].classList.remove("selected");
			}
		}
	}
}