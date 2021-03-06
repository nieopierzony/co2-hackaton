'use strict';

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

module.exports = class FileUtils {
  static async requireDirectory(dirPath, success, recursive = true) {
    const files = await FileUtils.readdir(dirPath);
    const filesObject = {};

    return Promise.all(
      files.map(async file => {
        const fullPath = path.resolve(dirPath, file);
        if (file.match(/\.(js|json)$/)) {
          try {
            const required = require(fullPath);
            if (success) success(required);
            filesObject[file] = required;
            return required;
          } catch (err) {
            console.error(err);
          }
        } else if (recursive) {
          const isDirectory = await FileUtils.stat(fullPath).then(f => f.isDirectory());
          if (isDirectory) {
            return FileUtils.requireDirectory(fullPath, success);
          }
        }
        return false;
      }),
    )
      .then(() => filesObject)
      .catch(console.error);
  }
};

module.exports.readdir = promisify(fs.readdir);
module.exports.readFile = promisify(fs.readFile);
module.exports.stat = promisify(fs.stat);
