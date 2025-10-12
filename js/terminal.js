// WIP mock windows JS
// (c) 2020 Matt Coley

const WINDOW_FONT = "arial",
	WINDOW_HEADER_BG = "rgb(200, 200, 200)",
	WINDOW_HEADER_FG = "black";

const PROMPT_INPUT = 1,
	PROMPT_PASSWORD = 2,
	PROMPT_CONFIRM = 3;

const BLINK_MS = 500;

const KEY_ENTER = 13,
	KEY_TAB = 9;
	KEY_UP = 38,
	KEY_DOWN = 40,
	KEY_LEFT = 37,
	KEY_RIGHT = 39;

// OS stuff
class System {
	constructor() {
		this.commands = new CommandManager();
	}
}

// Interaction with a given system
class Terminal {
	constructor(sys) {
		this.sys = sys;
	}
}

// Base window logic 
class Window {
	constructor(id, className) {
		if (typeof(id) === 'string') {
			this.id = id;
		}
		// Setup window title bar element
		this.header = document.createElement('div');
		this.header.className = "header";
		if (typeof(id) == 'string') {
			this.header.id = id + "-header";
		}
		this.header.style.padding = '5px';
		this.header.style.background = WINDOW_HEADER_BG;
		this.headerText = document.createElement('span');
		this.headerIcon = document.createElement('span');
		this.headerText.style.color = WINDOW_HEADER_FG;
		this.headerText.style.pointerEvents = 'none';
		this.headerText.className = 'title';
		this.header.appendChild(this.headerIcon);
		this.header.appendChild(this.headerText);
		// Setup window content wrapper
		this.contentWrapper = document.createElement('div');
		this.contentWrapper.className = "content";
		// Setup main window wrapper element
		this.window = document.createElement('div');
		this.window.className = className;
		this.window.id = id;
		this.window.appendChild(this.header);
		this.window.appendChild(this.contentWrapper);
		this.window.style.position = 'absolute';
		this.window.style.margin = '0';
		this.window.style.border = "1px solid white";
		this.window.style.fontFamily = WINDOW_FONT;
	}

	setIcon(path, width, height, margin) {
		this.headerIcon.innerHTML = '';
		var img = document.createElement('img');
		img.src = path;
		if (width) img.style.width = width;
		if (height) img.style.height = height;
		if (margin) img.style.marginRight = margin;
		this.headerIcon.appendChild(img);
	}
	
	set setTitle(title) { this.headerText.innerText = title; }
	set setWidth(size) { // TODO: Using this on resizble children is wack
		this.window.style.width = size;
		this.contentWrapper.style.width = size;
	}
	set setHeight(size) { 
		this.window.style.height = size;
		this.contentWrapper.style.height = size;
	}
	set setMinWidth(size) { 
		this.window.style.minWidth = size; 
		this.contentWrapper.style.minWidth = size;
	}
	set setMinHeight(size) { 
		this.window.style.minHeight = size;
		this.contentWrapper.style.minWidth = size;
	}
}

class VideoWindow extends Window {
	constructor(id) {
		super(id, "video-window");
	}
}

class TerminalWindow extends Window {
	isFirstPrompt = true;
	blinkingEnabled = true;

	constructor(id, terminal) {
		super(id, "terminal");
		this.terminal = terminal;
		this.input = document.createElement('p');
		this.input.style.margin = '0';
		this.output = document.createElement('p');
		this.output.style.margin = '0';
		this.ioWrapper = document.createElement('pre');
		this.ioWrapper.appendChild(this.output);
		this.ioWrapper.appendChild(this.input);
		this.ioWrapper.style.padding = '10px';
		this.ioWrapper.style.margin = '0';
		this.contentWrapper.className = 'resizable';
		this.inputLine = document.createElement('span');
		this.cursor = document.createElement('span');
		this.cursor.innerHTML = '#';
		this.cursor.style.display = 'none';
		this.input.appendChild(this.inputLine);
		this.input.appendChild(this.cursor);
		this.setTextColor = 'white';
		this.setTextFont = 'monospace';
		this.setBackgroundColor = "black";
		// Add terminal stuff to base window
		this.contentWrapper.appendChild(this.ioWrapper);
	}

	print(message) {
		var newLine = document.createElement('div');
		newLine.textContent = message;
		this.output.appendChild(newLine);
		this.contentWrapper.scrollTop = this.contentWrapper.scrollHeight;
		setTimeout(() => {
			this.contentWrapper.scrollTop = this.contentWrapper.scrollHeight;
		}, 100);
	}

	printHtml(message) {
		var newLine = document.createElement('div');
		newLine.innerHTML = message;
		this.output.appendChild(newLine);
	}

	prompt(message, callback)	{ this.promptInput(message, PROMPT_INPUT, callback); }
	password(message, callback) { this.promptInput(message, PROMPT_PASSWORD, callback); }
	confirm(message, callback)	{ this.promptInput(message, PROMPT_CONFIRM, callback); }
	
	loopInput() {
		this.prompt("", (input) => {
			this.print(" ");
			var cmd = this.terminal.sys.commands.commandMap[getFirstWord(input)];
			if (cmd != undefined) {
				var threaded = (cmd.attributes["threaded"] != undefined);
				this.terminal.sys.commands.exec(input);
				if (!threaded) { this.print(" "); }
			} else {
				this.print("'" + input + "' is not recognized as an internal or external command.");
			}
			this.loopInput();
		});
	}
	
	promptInput(message, PROMPT_TYPE, callback) {
		// Print prompt message
		if (message.length) {
			var promptMsg = PROMPT_TYPE === PROMPT_CONFIRM ? message + ' (y/n)' : message;
			this.print(promptMsg);
		}
		
		var shouldDisplayInput = (PROMPT_TYPE === PROMPT_INPUT);
		var targetFieldHost = this.window;
		// Setup the hidden input field
		if (this.inputField == null) {
			this.input.style.display = 'block';
			this.inputField = document.createElement('input');
			this.inputField.style.position = 'absolute';
			this.inputField.style.zIndex = '-100';
			this.inputField.style.outline = 'none';
			this.inputField.style.border = 'none';
			this.inputField.style.opacity = '0';
			this.inputField.style.fontSize = '12px';
			this.inputLine.textContent = '';
			targetFieldHost.appendChild(this.inputField); // TODO: Can we append to a more relevant node?
			this.fireCursorInterval(this.inputField);
		} else {
			this.input.style.display = 'block';
			this.input.style.visibility = 'visible';
			return;
		}

		// Unfocusing from the terminal hides the cursor
		this.inputField.onblur = () => { this.cursor.style.display = 'none'; }

		// Interaction with the input shows the cursor
		this.inputField.onfocus = () => {
			this.inputField.value = this.inputLine.textContent;
			this.cursor.style.display = 'inline';
		}

		// Clicking the terminal focuses the input field
		this.window.onclick = () => { this.inputField.focus(); }

		// Handle user typing input
		this.inputField.onkeydown = (e) => {
			if (e.keyCode === KEY_LEFT || e.keyCode === KEY_RIGHT || 
				e.keyCode === KEY_UP || e.keyCode === KEY_DOWN || e.keyCode === KEY_TAB) {
				// Prevent normal behavior of key... handling it properly is too much effort
				e.preventDefault()
				// TODO: Handle UP/DOWN message history
				// TODO: Tab completion interaction with terminal/system commands + local files
			} else if (shouldDisplayInput && e.keyCode !== KEY_ENTER) {
				setTimeout(() => {
					this.inputLine.textContent = this.inputField.value
				}, 1)
			}
		}
		// Handle user submitting their text
		this.inputField.onkeyup = (e) => {
			if (PROMPT_TYPE === PROMPT_CONFIRM || e.keyCode === KEY_ENTER) {
				var inputValue = this.inputField.value;
				// Clear content
				this.clearInput();
				// Log what the user entered
				if (shouldDisplayInput) {
					this.print(inputValue);
				}
				// Execute callback
				if (typeof (callback) === 'function') {
					if (PROMPT_TYPE === PROMPT_CONFIRM) {
						callback(inputValue.toUpperCase()[0] === 'Y' ? true : false)
					} else {
						callback(inputValue);
					}
				}
			}
		}

		// Focus the input field
		if (this.isFirstPrompt) {
			this.isFirstPrompt = false
			setTimeout(() => { this.inputField.focus(); }, 50);
		} else {
			this.inputField.focus();
		}
	}

	fireCursorInterval(inputField) {
		setTimeout(() => {
			if (inputField.parentElement && this.blinkingEnabled) {
				this.cursor.style.visibility = this.cursor.style.visibility === 'visible' ? 'hidden' : 'visible';
				this.fireCursorInterval(inputField);
			} else {
				this.cursor.style.visibility = 'visible';
			}
		}, BLINK_MS);
	}

	clear() { this.output.innerHTML = ''; }
	clearInput() { 
		this.inputField.value = '';
		this.inputLine.textContent = '';
		this.input.style.display = 'none';
	}

	set setCursorBlink(blink) { this.blinkingEnabled = blink; }
	set setTextColor(color) {
		this.contentWrapper.style.color = color;
		this.cursor.style.background = color;
	}
	set setTextFont(font) { this.contentWrapper.style.fontFamily = font; }
	set setBackgroundColor(color) { this.contentWrapper.style.background = color; }
}
