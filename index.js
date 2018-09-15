import axios from "axios";
import cheerio from "cheerio";

//寫入檔案
import { exportResults } from "./src/exportResult";
//延遲執行
import { waitFor, asyncForEach } from "./src/delayFunction";

const getWebSiteContent = async (url, coverFile) => {
  const linkList = [];
  const RequestLink = async () => {
    try {
      const ResponseHTML = await axios.get(url);
      const $ = cheerio.load(ResponseHTML.data);
      $(".subject > span > a").each((index, value) => {
        linkList.push({ link: "https://www.mobile01.com/" + $(value).attr("href"), page: $(".numbers").text() });
      });
    } catch (error) {}
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

// forum = 討論區代號
// startCode = 從第幾頁開始爬
// total = 該討論區總共頁數
// output = 輸出路徑
const StartCrawler = async (forum, startCode, totalCode, output) => {
  const list = [];
  for (let i = startCode; i < totalCode; i++) {
    list.push(i);
  }
  await asyncForEach(list, async num => {
    await waitFor(5000);
    getWebSiteContent("https://www.mobile01.com/topiclist.php?f=" + forum + "&p=" + num, output);
  });
  console.log("Done");
};

StartCrawler(692, 1, 2, "./data/result.json", "./data/result.json");
