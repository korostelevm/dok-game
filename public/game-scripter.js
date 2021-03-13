const data = {
	gender: "M",	//	M,W,T
};

const entrance = new Entrance(imageLoader, data);

document.addEventListener("DOMContentLoaded", () => {
	engine.setGame(entrance);
});
