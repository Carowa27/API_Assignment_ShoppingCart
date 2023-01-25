const fsPromises = require("fs/promises");

exports.checkingExistence = async (dataPath) =>
  !!(await fsPromises.stat(dataPath).catch((e) => false));

exports.readJSON = async (dataPath) =>
  JSON.parse(await fsPromises.readFile(dataPath, { encoding: "utf-8" }));
