var fs = require('fs'),
	path = null;

if (process.argv.length >= 3) {
	path = process.argv[2];
}

if (!path) {
	console.log('Please specify the path to the argument.');
}

(function(path) {

	var IGNORE = ['$', 'jQuery', '_'];

	function forward(content, chars) {
		var contentArray = content.split('');

		var charsArray = chars.split(''),
			charsLength = chars.length,
			charsIndex = 0,
			forwardIndex = null;

		for (var i = 0, length = contentArray.length; i < length; i++) {
			if (contentArray[i] === charsArray[charsIndex]) {
				if (charsIndex === charsLength - 1) {
					charsLength = 0;
					forwardIndex = i;
					break;
				} else {
					charsIndex++;
				}
			} else {
				charsIndex = 0;
			}
		}

		return {
			index: forwardIndex,
			extract: content.substring(0, forwardIndex + 1),
			content: content.substring(forwardIndex + 1, content.length)
		};
	};

	function analyze(path) {
		fs.readFile(path, {encoding: 'UTF-8'}, function(err, data) {
			var content = data.toString(),
				result = forward(forward(forward(content, 'define([').content, 'function(').content, ')'),
				args = result.extract.substring(0, result.extract.length - 1).trim().split(',');

			args.forEach(function(item) {
				var arg = item.trim();

				if (!isUsed(result.content, arg)) {
					console.log(path + ': ' + arg + ' is not found.');
				}
			});

		});
	};

	function isUsed(content, arg) {
		for (var i = 0, length = IGNORE.length; i < length; i++) {
			if (IGNORE[i] === arg) return true;
		}

		if (new RegExp('//').test(arg)) {
			return true;
		}

		if (new RegExp(' ' + arg).test(content)) {
			return true;
		}

		if (new RegExp(arg + '\\.').test(content)) {
			return true;
		}

		if (new RegExp('\\(' + arg + '\\)').test(content)) {
			return true;
		}

		return false;
	};

	function walk(path) {
		var REGEXP_JS = new RegExp('.+\\.js');

		fs.readdir(path, function(err, files) {
			files.forEach(function(file) {
				file = path + '/' + file;

				fs.stat(file, function(err, stat) {
					if (stat.isDirectory()) {
						walk(file);
					} else if (REGEXP_JS.test(file)) {
						analyze(file);
					}
				});
			});
		});
	};

	walk(path);

})(path);
