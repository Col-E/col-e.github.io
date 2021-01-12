function getFirstWord(str) {
	let spaceIndex = str.indexOf(' ');
	return spaceIndex === -1 ? str : str.substr(0, spaceIndex);
}
function getLastWord(str) {
	let spaceIndex = str.lastIndexOf(' ');
	return str.substr(spaceIndex + 1);
}