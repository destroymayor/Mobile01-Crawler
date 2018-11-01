import axios from "axios";
import cheerio from "cheerio";

//寫入檔案
import { exportResults, readFileAsync, fs_writeFile } from "./src/exportResult";
//延遲執行
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
    await console.log(page, new Date().toString());
  };

  Promise.resolve()
    .then(() => RequestLink())
    .then(() =>
      Promise.all(
        linkList.map(async link => {
          await RequestDataAsync(link.link, link.page);
        })
      )
    )
    .catch(err => {});
};

// forum = 討論區代號
// startCode = 從第幾頁開始爬
// total = 該討論區總共頁數
const StartCrawler = async (forum, startCode, totalCode) => {
  const outputPath = "./output/" + forum + ".json";
  //預先創建一個json來儲存資料
  fs_writeFile(outputPath, JSON.stringify([]), err => {
    if (err) console.log("write", err);
  });

  const list = [];
  for (let i = startCode; i <= totalCode; i++) list.push(i);

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

//mainFile, mergerFile
//fileMerger('./data/computer/computer.json', './data/computer/233.json');

StartCrawler(258, 1, 515);
