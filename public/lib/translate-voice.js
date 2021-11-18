const PHONEME = {
	"Thomas": {
		"I": "aille",
		"pleasure": "plésure",
		"son": "sonne",
		"impossible": "imme possibeul",
		"was": "weuz",
		"named": "nemmede",
		"grand-mother,": "grainde-mozeur,",
		"Her": "Heur",
		"But": "Beutte",
		"but": "beutte",
		"since": "sinne s'",
		"know,": "now,",
		"the": "zeu",
		"after": "afteur",
		"reached": "riched",
		"escape,": "esképe,",
		"called": "collede",
		"that": "thate",
		"There": "Theire",
		"me,": "mi,",
		"did": "dide",
		"host.": "hoste.",
		"why": "waille",
		"choice": "choïce",
		"will": "wile",
		"this": "disse",
		"This": "Disse",
		"this?": "disse?",
		"already": "olreddy",
		"locked.": "lokt.",
		"exit,": "exitte,",
		"do": "doux",
		"Unfortunately,": "Eunfortunately,",
		"defeat": "difitte",
		"cannot": "cannotte",
		"let": "lette",
		"Can": "Canne",
		"hold": "holde",
		"once": "ouansse",
		"apologies": "apologize",
		"an": "eune",
		"matter": "matteur",
		"attend": "attennde",
		"urgent": "urgeunte",
		"Thank": "Theinke",
		"Feel": "Fill",
		"ways": "wayze",
		"keyhole": "kihole",
		"stuck.": "steuck.",
		"stuck": "steuck",
		"me": "mi",
		"responsible": "responsibeul",
		"prank?": "preink?",
		"locks": "lockse",
		"longer": "longueure",
		"can": "canne",
		"forever": "foreveur!",
		"I'm": "aïme",
	},
};

function getPhoneme(msg, voice) {
	const words = PHONEME[voice];
	if (!words) {
		return msg;
	}
	const m = msg.split(" ").map(word => {
		return words[word] || word;
	}).join(" ").replaceAll("' ", "'");
	console.log(m);
	return m;
}