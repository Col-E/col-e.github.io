// Simple command logic
// (c) 2021 Matt Coley

class CommandManager {
	constructor() {
		this.commandMap = new Map();
	}
	
	execArgs(cmd, args) {
		var command = this.commandMap[cmd];
		if (command !== undefined) {
			command.run(args);
		} else {
			console.log("Unknown command: " + cmd);
		}
	}
	
	exec(cmd) {
		if (cmd.includes(" ")) {
			var splits = cmd.split(" ");
			var name = splits[0];
			var args = splits.slice(1, splits.length);
			this.execArgs(name, args);
		} else {
			this.execArgs(cmd);
		}
	}
	
	register(cmd) {
		var i;
		for (i = 0; i < cmd.aliases.length; i++) { 
			var alias = cmd.aliases[i];
			this.commandMap[alias] = cmd;
		}
	}
}

class Command {
	constructor(aliases, description, attributes, behavior) {
		this.aliases = aliases;
		this.description = description;
		this.attributes = attributes;
		this.behavior = behavior;
	}
	
	run(args) {
		this.behavior(args);
	}
}