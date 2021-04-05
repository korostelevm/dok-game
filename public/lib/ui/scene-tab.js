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
			const titleDiv = groupDiv.appendChild(document.createElement("div"));
			titleDiv.innerText = name;
			const sceneGroupDiv = groupDiv.appendChild(document.createElement("div"));
			sceneGroupDiv.style.marginTop = "4px";
			gameList[name].forEach(className => {
				const button = sceneGroupDiv.appendChild(document.createElement("button"));
				button.classList.add("scene-button");
				button.innerText = className;
				const classObj = eval(className);
				if (classObj.start) {
					button.classList.add("first");
				}
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