import fs from "fs";
import nodejieba from "nodejieba";

nodejieba.load({
  dict: "./jieba/dict.txt",
  stopWordDict: "./jieba/stop_words.utf8"
});

const splitMulti = (str, tokens) => {
  let tempChar = tokens[0];
  for (let i = 1; i < tokens.length; i++) {
    str = str.split(tokens[i]).join(tempChar);
  }
  str = str.split(tempChar);
  return str;
};

const writeAsyncFile = (output, result) => {
  fs.appendFileSync(output, result + "\n", err => {
    if (err) throw err;
  });
};

const TrainDataProcess = (input, output) => {
  fs.readFile(input, "utf-8", (err, data) => {
    Object.values(JSON.parse(data).article).map(item => {
      const InterrogativeSentenceRegexPattern = "？|為什麼|嗎|如何|如果|若要|是否|請將|可能|多少";
      const SpecialSymbolRegex = "[`~!@#$^&*()=|{}':;'\\[\\].<>/?~！@#￥……&*（）——|{}【】‘”“'%+_]";

      if (item.article_title.match(new RegExp(InterrogativeSentenceRegexPattern, "g"))) {
        console.log(item.article_title);
        const CutTitle = nodejieba.cut(item.article_title).join(" ");
        const CutContent = nodejieba.cut(item.content).join(" ");
        const CutReply = nodejieba.cut(item.messages).join(" ");

        splitMulti(CutTitle, [",", "，", "。", "？", "?"]).map(value => {
          if (value.length >= 5 && value.length <= 100) {
            //  const result = value.replace(new RegExp(SpecialSymbolRegex, "g"), "");
            writeAsyncFile(output, value);
          }
        });

        splitMulti(CutContent, [",", "，", "。", "？", "?"]).map(value => {
          if (value.length >= 10 && value.length <= 100) {
            const result = value.replace(new RegExp(SpecialSymbolRegex, "g"), "");
            writeAsyncFile(output, result);
          }
        });

        // splitMulti(CutReply, [",", "，", "。", "？", "?"]).map(value => {
        //   if (value.length >= 10 && value.length <= 100) {
        //     const result = value.replace(new RegExp(SpecialSymbolRegex, "g"), "");
        //     writeAsyncFile(output, result);
        //   }
        // });
      }
    });
  });
};

TrainDataProcess("./data/291.json", "./output/train1.txt");
