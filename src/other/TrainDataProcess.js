import fs from "fs";
import nodejieba from "nodejieba";

import util from "util";
const fs_writeFile = util.promisify(fs.writeFileSync);

nodejieba.load({
  dict: "./jieba/dict.txt",
  stopWordDict: "./jieba/stop_words.utf8",
  userDict: "./jieba/userDict.utf8"
});

// read file async
const readFileAsync = path => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf-8", (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};

const writeAsyncFile = (output, result) => {
  return new Promise((resolve, reject) => {
    fs.appendFileSync(output, result + "\n", err => {
      if (err) throw err;
      resolve(data);
    });

    //組合生成句用的
    // const combinationsReplaceList = {
    //   articles: result
    // };
    // fs_writeFile(output, JSON.stringify(combinationsReplaceList), err => {
    //   if (err) console.log("write", err);
    // });
  });
};

const splitMulti = (str, tokens) => {
  let tempChar = tokens[0];
  for (let i = 1; i < tokens.length; i++) {
    str = str.split(tokens[i]).join(tempChar);
  }
  str = str.split(tempChar);
  return str;
};

const TrainDataProcess = (input, output) => {
  const outputJSON = [];
  readFileAsync(input).then(data => {
    Object.values(JSON.parse(data).articles).map(item => {
      const InterrogativeSentenceRegexPattern = "\\?|？|為什麼|嗎|如何|如果|若要|是否|請將|可能|多少"; //疑問句pattern

      const NumberCode = "\\d+";
      const SpecialSymbolCode = "[`-~～!@#$^&*()=|{}'：；:;'\\[\\].<>/?~！@#￥……&*（）——|{}《》【】．、‘”“'%+_]";
      const EmojiCode = "([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2694-\u2697]|\uD83E[\uDD10-\uDD5D])";

      const title = item.article_title
        .replace(new RegExp(SpecialSymbolCode, "g"), "") //特殊符號取代
        .replace(new RegExp(NumberCode, "g"), "Number") //將數字以特定文字代替
        .replace(/  +/g, ""); //去多餘空白

      const content = item.content
        .replace(new RegExp(SpecialSymbolCode, "g"), "") //特殊符號取代
        .replace(new RegExp(NumberCode, "g"), "Number") //將數字以特定文字代替
        .replace(/  +/g, ""); // 去多餘空白

      const reply = [];
      item.messages.map(item => {
        const replyItem = item
          .replace(new RegExp(SpecialSymbolCode, "g"), "") //特殊符號取代
          .replace(new RegExp(NumberCode, "g"), "Number")
          .replace(new RegExp(EmojiCode, "g"), "") //將數字以特定文字代替
          .replace(/  +/g, ""); // 去多餘空白
        reply.push(replyItem);
      });

      if (item.article_title.match(new RegExp(InterrogativeSentenceRegexPattern, "g"))) {
        const CutTitle = nodejieba.cut(title, true).join(" ");
        splitMulti(CutTitle, [",", "，", "。", "？", "?"]).map(value => {
          const result = value.replace(/\s\s+/g, " ").replace(/^ /g, ""); //去空白跟起頭空白
          if (result.length >= 5 && result.length <= 100) {
            // outputJSON.push({
            //   article_title: result
            // });
            writeAsyncFile(output, result);
          }
        });

        const CutContent = nodejieba.cut(content, true).join(" ");
        splitMulti(CutContent, [",", "，", "。", "？", "?"]).map(value => {
          const result = value.replace(/\s\s+/g, " ").replace(/^ /g, ""); //去空白跟起頭空白
          if (result.length >= 10 && result.length <= 100) {
            // writeAsyncFile(output, result);
          }
        });

        const CutReply = nodejieba.cut(reply, true).join(" ");
        splitMulti(CutReply, [",", "，", "。", "？", "?"]).map(value => {
          const result = value.replace(/\s\s+/g, " ").replace(/^ /g, ""); //去空白跟起頭空白
          if (result.length >= 10 && result.length <= 100) {
            //writeAsyncFile(output, result);
          }
        });
      }
    });
  });
};

TrainDataProcess("./data/PTT_finance.json", "./output/data.json");
