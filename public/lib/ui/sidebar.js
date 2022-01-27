class Sidebar {
	constructor(engine, sidebarDiv, document) {
		this.engine = engine;
		this.sidebarDiv = sidebarDiv;
		this.sidebars = [];
		this.setSidebars([
			{
				name: "main menu",
				game: "Menu",
				onClick: (engine, sidebar) => {
					document.getElementById("confirm-dialog").style.display = "";
					document.getElementById("game-over").style.display = "block";
					sidebar.style.display = "none";					
				},
				hideSidebar: (self) => {
					return self.countUnlocked() === 1;
				},
			},
			{
				name: "entrance",
				game: "Entrance",
				disabled: (engine) => {
					return !["Menu", "Entrance", "Restroom", "Lobby"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "restroom",
				game: "Restroom",
				disabled: (engine) => {
					return !["Menu", "Entrance", "Restroom", "Lobby"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "lobby",
				game: "Lobby",
				disabled: (engine) => {
					return !["Menu", "Entrance", "Restroom", "Lobby"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "first room",
				game: "LockedRoom",
				disabled: (engine) => {
					return !["Menu", "Entrance", "Restroom", "Lobby"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "joker",
				game: "JokerRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "time",
				game: "TimeRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "animal",
				game: "AnimalRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "gandalf",
				game: "GandalfRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "math",
				game: "MathRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "restaurant",
				game: "Restaurant",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "music",
				game: "SoundRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "no clue",
				game: "ClueRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "desert",
				game: "DesertRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "batman",
				game: "BatmanRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "computer",
				game: "ComputerRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneTag);
				},
			},
			{
				name: "impossible",
				game: "ImpossibleRoom",
				disabled: (engine) => {
					return !["Menu", "JokerRoom", "TimeRoom", "AnimalRoom", "GandalfRoom", "Restaurant", "SoundRoom", "MathRoom",
						"ClueRoom", "DesertRoom", "BatmanRoom", "ComputerRoom", "ImpossibleRoom"].includes(engine.game.sceneTag);
				},
			},
		]);
		this.setupUI();
	}

	setupUI() {
		document.getElementById("cancel-button").addEventListener("mousedown", e => {
			e.stopPropagation();
		});
		document.getElementById("cancel-button").addEventListener("mouseup", e => {
			e.stopPropagation();
		});
		document.getElementById("cancel-button").addEventListener("click", e => {
			document.getElementById("confirm-dialog").style.display = "none";
			document.getElementById("game-over").style.display = "none";
			const sidebar = document.getElementById("sidebar");
			sidebar.style.display = "flex";						
		});
		document.getElementById("ok-button").addEventListener("mousedown", e => {
			e.stopPropagation();
		});
		document.getElementById("ok-button").addEventListener("mouseup", e => {
			e.stopPropagation();
		});
		document.getElementById("ok-button").addEventListener("click", e => {
			document.getElementById("confirm-dialog").style.display = "none";
			document.getElementById("game-over").style.display = "none";
			const sidebar = document.getElementById("sidebar");
			sidebar.style.display = "flex";
			engine.setGame(new Menu());
			engine.resetGame(this.engine.game.gameName);
		});
	}

	enableSidebar(enabled) {
		if (enabled) {
			this.sidebarDiv.classList.remove("blocked");
		} else {
			this.sidebarDiv.classList.add("blocked");
		}
	}

	setSidebars(sidebars) {
		this.sidebars.length = 0;
		for (let block of sidebars) {
			this.sidebars.push(block);
		}
	}

	updateSidebar(selected, joker) {
		const engine = this.engine;
		this.sidebarDiv.innerText = "";
		let foundSelected = false;
		let doHideSidebar = false;
		const allRows = [];
		this.sidebars.forEach(({ game, name, disabled, hideSidebar, onClick }, index) => {
			const classObj = nameToClass(game);
			const row = this.sidebarDiv.appendChild(document.createElement("div"));
			allRows.push(row);
			row.classList.add("sidebar-room");
			const icon = joker === game ? " 🤪" : index && index <= engine.score ? " ✔️" : "";
			row.innerText = `${name}${icon}`;
			if (!this.roomUnlocked(game)) {
				row.classList.add("locked");
			} else if (selected !== game && disabled && disabled(engine)) {
				row.classList.add("disabled");
			} else {
				if (selected !== game) {
					row.addEventListener("click", () => {
						if (onClick) {
							onClick(engine, this.sidebarDiv);
						} else {
							allRows.forEach(row => {
								row.classList.remove("selected");
								row.classList.add("wait");
							});
							row.classList.add("selected");
							engine.setGame(new classObj()).then(() => {
								allRows.forEach(row => row.classList.remove("wait"));
							});
						}
					});
				}
			}

			if (selected === game) {
				row.classList.add("selected");
				foundSelected = true;
				if (hideSidebar && hideSidebar(this)) {
					doHideSidebar = true;
				}
			}
		});
		this.sidebarDiv.style.display = !doHideSidebar && foundSelected ? "flex" : "none";
	}

	countUnlocked() {
		let count = 0;
		this.sidebars.forEach(({ game, name, disabled, hideSidebar }, index) => {
			if (this.roomUnlocked(game)) {
				count++;
			}
		});
		return count;
	}

	getLevelFor(name) {
		for (let i = 0; i < this.sidebars.length; i++) {
			if (this.sidebars[i].game === name) {
				return i;
			}
		}
		return -1;
	}

	roomUnlocked(game) {
		return localStorage.getItem(game + "-unlocked");
	}

}