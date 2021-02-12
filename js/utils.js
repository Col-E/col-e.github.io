function randInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
function getFirstWord(str) {
	let spaceIndex = str.indexOf(' ');
	return spaceIndex === -1 ? str : str.substr(0, spaceIndex);
}
function getLastWord(str) {
	let spaceIndex = str.lastIndexOf(' ');
	return str.substr(spaceIndex + 1);
}