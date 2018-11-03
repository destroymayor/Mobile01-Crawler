import fs from "fs";
import util from "util";
const fs_writeFile = util.promisify(fs.writeFileSync);

// read file async
const readFileAsync = path => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf-8", (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};

const writeFileAsync = (path, data) => {
  return new Promise((resolve, reject) => {
    fs_writeFile(path, JSON.stringify(data, null, 2), err => {
      if (err) reject(err);

      resolve(data);
    });
  });
};

// file write
const exportResults = (parsedResults, coverFile) => {
  readFileAsync(coverFile)
    .then(data => {
      const jsonData = JSON.parse(data);

      parsedResults.map(item => {
        jsonData.push(item);
      });

      writeFileAsync(coverFile, jsonData);
    })
    .catch(err => {});
};

export { exportResults, readFileAsync, writeFileAsync };
