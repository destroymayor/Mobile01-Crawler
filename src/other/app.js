import { combinations, combinationsReplacement } from "simple-statistics";
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

readFileAsync("./data/Regulation1.json")
  .then(data => {
    const jsonData = JSON.parse(data);
    const Result = [];
    const KeywordListNoun = [];
    const KeywordListVerb = [];
    jsonData.Regulation.map(RegulationValue => {
      nodejieba.extract(RegulationValue, 5).map(item => {
        nodejieba.tag(item.word).map(TagValue => {
          if (TagValue.tag == "n") {
            KeywordListNoun.push(TagValue.word);
          }
          if (TagValue.tag == "v") {
            KeywordListVerb.push(TagValue.word);
          }
        });
      });
    });

    const NounList = [];
    const VerbList = [];
    combinations(KeywordListNoun, 2).map(NounItem => {
      NounList.push({
        n: NounItem
      });
    });

    combinations(KeywordListVerb, 2).map(VerbItem => {
      VerbList.push({
        v: VerbItem
      });
    });

    const results = NounList.map((item, i) => Object.assign({}, item, VerbList[i]));

    Result.push({
      item: results
    });

    // fs_writeFile("./output/Combination.json", JSON.stringify(Result), err => {
    //   if (err) console.log("write", err);
    // });
  })
  .catch(err => {
    console.log(err);
  });
