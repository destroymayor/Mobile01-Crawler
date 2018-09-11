import { modeFast, mode, combinationsReplacement, combinations } from "simple-statistics";
import nodejieba from "nodejieba";
import fs from "fs";

import util from "util";
const fs_writeFile = util.promisify(fs.writeFileSync);

nodejieba.load({
  dict: "./jieba/dict.txt"
});

const readFileAsync = path => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf-8", (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};

readFileAsync("./data/Regulation.json")
  .then(data => {
    const jsonData = JSON.parse(data);
    jsonData.Regulation.map(RegulationValue => {
      console.log(RegulationValue);
      const statisticsList = [];
      nodejieba.extract(RegulationValue, 10).map(item => {
        console.log(item);
        nodejieba.tag(item.word).map(TagValue => {
          if (TagValue.tag == "n") {
            statisticsList.push(TagValue.word);
          }
        });
      });
      console.log(statisticsList);
    });
  })
  .catch(err => {
    console.log(err);
  });
