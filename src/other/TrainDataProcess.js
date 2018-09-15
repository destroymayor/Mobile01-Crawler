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

fs.readFile("./data/finance-1-1083.json", "utf-8", (err, data) => {
  JSON.parse(data).articles.map(item => {
    const CutTitle = nodejieba.cut(item.article_title).join(" ");
    const CutContent = nodejieba.cut(item.content).join(" ");
    const CutReply = nodejieba.cut(item.messages).join(" ");
    splitMulti(CutTitle, [",", "，", "。", "？", "?"]).map(value => {
      if (value.length >= 5 && value.length <= 100) {
        fs.appendFileSync("./output/train.txt", value + "\n", err => {
          if (err) throw err;
        });
      }
    });
    splitMulti(CutContent, [",", "，", "。", "？", "?"]).map(value => {
      if (value.length >= 10 && value.length <= 100) {
        fs.appendFileSync("./output/train.txt", value + "\n", err => {
          if (err) throw err;
        });
      }
    });
    splitMulti(CutReply, [",", "，", "。", "？", "?"]).map(value => {
      if (value.length >= 10 && value.length <= 100) {
        fs.appendFileSync("./output/train.txt", value + "\n", err => {
          if (err) throw err;
        });
      }
    });
  });
});
