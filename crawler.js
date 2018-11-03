import axios from "axios";
import cheerio from "cheerio";

import { exportResults, readFileAsync, writeFileAsync } from "./src/exportResult";
import { waitFor, asyncForEach } from "./src/delayFunction";

const getWebSiteContent = async (url, coverFile) => {
  const linkList = [];
  //取得每一頁的文章url
  const RequestLink = async () => {
    const ResponseHTML = await axios.get(url);
    const $ = cheerio.load(ResponseHTML.data);
    await $(".subject > span > a").each((index, value) => {
      linkList.push({ link: "https://www.mobile01.com/" + $(value).attr("href"), page: $(".numbers").text() });
    });
  };

  const crawlerList = [];
  const RequestDataAsync = async (url, page) => {
    const ResponseHTML = await axios.get(url);
    const $ = cheerio.load(ResponseHTML.data);
    //主題回覆 list
    const ReplyList = [];
    await $(".single-post-content").map(index => {
      ReplyList.push(
        $(".single-post-content")
          .eq(index + 1)
          .text()
          .replace(new RegExp("\\n|\\s+|{|}|\"|'", "g"), "")
      );
    });

    await crawlerList.push({
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

    await exportResults(crawlerList, coverFile);
  };

  Promise.resolve()
    .then(() => RequestLink())
    .then(() =>
      Promise.all(
        linkList.map(async link => {
          await RequestDataAsync(link.link, link.page);
          return link.page;
        })
      )
    )
    .then(page => console.log("Save Success!", page[0], ", Time:", new Date().toTimeString().split(" ")[0]));
};

// forum = 討論區代號
// total = 該討論區總共頁數
const startCrawler = async (forum, totalCode) => {
  const outputPath = "./output/" + forum + ".json";
  //預先創建一個json來儲存資料
  writeFileAsync(outputPath, []);

  const list = [];
  for (let i = 1; i <= totalCode; i++) list.push(i);

  await asyncForEach(list, async num => {
    await waitFor(5000);
    await getWebSiteContent("https://www.mobile01.com/topiclist.php?f=" + forum + "&p=" + num, outputPath);
  });
};

// file merger
// mainFile = 主要的檔案
// mergerFile = 被合併的檔案
const fileMerger = (mainFile, mergerFile) => {
  readFileAsync(mainFile).then(mainFileData => {
    const mainDataList = JSON.parse(mainFileData);
    console.log(mainDataList.length);

    readFileAsync(mergerFile).then(mergerFileData => {
      console.log(JSON.parse(mergerFileData).length);

      JSON.parse(mergerFileData).map(item => {
        mainDataList.push(item);
      });

      console.log("total length ", mainDataList.length);
      fs_writeFile(mainFile, JSON.stringify(mainDataList, null, 2), err => {
        if (err) console.log("write", err);
      });
    });
  });
};

export { startCrawler, fileMerger };
