const path = require("path"),
  fs = require("fs"),
  loaderUtils = require("loader-utils"),
  schemaUtils = require("schema-utils"),
  RecursiveIterator = require("recursive-iterator"),
  optionsSchema = require("./options.json");

function loader(source) {
  // Loader Options
  const options = loaderUtils.getOptions(this) || {};

  schemaUtils.validate(options, optionsSchema, "Mini Json Loader");

  const json = JSON.parse(source),
    urls = [];

  if (options.test) {
    for (let { node } of new RecursiveIterator(json)) {
      if (options.test.exec(node)) {
        urls.push({
          outputPath: path.relative(path.dirname(this.context), node),
          data: fs.readFileSync(
            path.resolve(path.dirname(this.resourcePath), node),
          ),
        });
      }
    }
  }

  if (
    urls.length &&
    (typeof options.emitFile === "undefined" || options.emitFile)
  ) {
    urls.forEach((file) => {
      this.emitFile(file.outputPath, file.data);
    });
  }

  return "{}";
}

module.exports = loader;
