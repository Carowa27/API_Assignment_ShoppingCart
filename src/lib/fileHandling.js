const fsPromises = require("fs/promises");

exports.checkingExistence = async (dataPath) =>
  !!(await fsPromises.stat(dataPath).catch((e) => false));
