import fs from "fs";
import nodejieba from "nodejieba";

nodejieba.load({
  dict: "./jieba/dict.txt"
});

const splitMulti = (str, tokens) => {
  let tempChar = tokens[0];
  for (let i = 1; i < tokens.length; i++) {
    str = str.split(tokens[i]).join(tempChar);
  }
  str = str.split(tempChar);
  return str;
};

const TrainDataProcess = (input, output) => {
  fs.readFile(input, "utf-8", (err, data) => {
    Object.values(JSON.parse(data).article).map(item => {
      const CutTitle = nodejieba.cut(item.article_title).join(" ");
      const CutContent = nodejieba.cut(item.content).join(" ");
      const CutReply = nodejieba.cut(item.messages).join(" ");

      const regex = "[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？%+_]";

      splitMulti(CutTitle, [",", "，", "。", "？", "?"]).map(value => {
        if (value.length >= 5 && value.length <= 100) {
          const result = value.replace(new RegExp(regex, "g"), "");
          fs.appendFileSync(output, result + "\n", err => {
            if (err) throw err;
          });
        }
      });

      splitMulti(CutContent, [",", "，", "。", "？", "?"]).map(value => {
        if (value.length >= 10 && value.length <= 100) {
          const result = value.replace(new RegExp(regex, "g"), "");
          fs.appendFileSync(output, result + "\n", err => {
            if (err) throw err;
          });
        }
      });

      splitMulti(CutReply, [",", "，", "。", "？", "?"]).map(value => {
        if (value.length >= 10 && value.length <= 100) {
          const result = value.replace(new RegExp(regex, "g"), "");
          fs.appendFileSync(output, result + "\n", err => {
            if (err) throw err;
          });
        }
      });
    });
  });
};

TrainDataProcess("./data/291.json", "./output/train1.txt");
