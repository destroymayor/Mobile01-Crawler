import axios from "axios";
import cheerio from "cheerio";
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

// 檔案寫入  json預設需有一個array
const exportResults = (parsedResults, coverFile) => {
  readFileAsync(coverFile)
    .then(data => {
      const jsonData = JSON.parse(data);
      parsedResults.map(item => {
        jsonData.push(item);
      });

      fs_writeFile(coverFile, JSON.stringify(jsonData), err => {
        if (err) console.log("write", err);
      });
    })
    .catch(err => {});
};

const getWebSiteContent = async (url, coverFile) => {
  const linkList = [];
  const RequestLink = async () => {
    try {
      const ResponseHTML = await axios.get(url);
      const $ = cheerio.load(ResponseHTML.data);
      $(".subject > span > a").each((index, value) => {
        linkList.push({ link: "https://www.mobile01.com/" + $(value).attr("href"), page: $(".numbers").text() });
      });
    } catch (error) {
      //console.log(error);
    }
  };

  const result = [];
  const RequestDataAsync = async (url, page) => {
    try {
      const ResponseHTML = await axios.get(url);
      const $ = cheerio.load(ResponseHTML.data);

      //主題回覆 list
      const ReplyList = [];
      $(".single-post-content").map((index, value) => {
        ReplyList.push(
          $(".single-post-content")
            .eq(index + 1)
            .text()
            .replace(new RegExp("\\n|\\s+|{|}|\"|'", "g"), "")
        );
      });

      result.push({
        article_title: $("#forum-content-main > h1")
          .first()
          .text(),
        content: $(".single-post-content")
          .first()
          .text()
          .replace(new RegExp("\\n|\\s+|{|}|\"|'", "g"), ""),
        messages: ReplyList,
        page: page
      });

      console.log(page, new Date().toString());
    } catch (error) {}
    await exportResults(result, coverFile);
  };

  Promise.resolve()
    .then(() => RequestLink())
    .then(() =>
      Promise.all(
        linkList.map(async link => {
          await RequestDataAsync(link.link, link.page);
        })
      )
    );
};

// 延遲執行函數
const waitFor = ms => new Promise(r => setTimeout(r, ms));
const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

// forum = 討論區代號
// startCode = 從第幾頁開始爬
// total = 該討論區總共頁數
const StartCrawler = async (forum, startCode, totalCode) => {
  const list = [];
  for (let i = startCode; i < totalCode; i++) {
    list.push(i);
  }
  await asyncForEach(list, async num => {
    await waitFor(10000);
    getWebSiteContent("https://www.mobile01.com/topiclist.php?f=" + forum + "&p=" + num, "./data/result.json");
  });
  console.log("Done");
};

// file merger
const fileMerger = () => {
  readFileAsync("./data/data.json").then(data => {
    const list = JSON.parse(data).articles;

    readFileAsync("./data/question.json").then(question => {
      console.log(JSON.parse(question));
      JSON.parse(question).map(item => {
        list.push(item);
      });
      let result = {
        article: list
      };
      fs_writeFile("./data/question2.json", JSON.stringify(result), err => {
        if (err) console.log("write", err);
      });
    });
  });
};

StartCrawler(692, 1, 2);
