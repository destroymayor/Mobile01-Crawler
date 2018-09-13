import { combinations } from "simple-statistics";
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
    const Result = [];
    const KeywordList = [];
    jsonData.Regulation.map(RegulationValue => {
      nodejieba.extract(RegulationValue, 10).map(item => {
        nodejieba.tag(item.word).map(TagValue => {
          if (TagValue.tag == "n") {
            KeywordList.push(TagValue.word);
          }
        });
      });
    });

    const NounList = [];
    combinations(KeywordList, 2).map(item => {
      NounList.push({
        n: item
      });
    });

    Result.push({
      Noun: NounList
    });
    console.log(Result);
    fs_writeFile("./data/Combination.json", JSON.stringify(Result), err => {
      if (err) console.log("write", err);
    });
  })
  .catch(err => {
    console.log(err);
  });
