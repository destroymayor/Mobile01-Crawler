import axios from "axios";
import cheerio from "cheerio";

//寫入檔案
import { exportResults } from "./src/exportResult";
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

  const result = [];
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

    await result.push({
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

    await exportResults(result, coverFile);
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
    );
};

// forum = 討論區代號
// startCode = 從第幾頁開始爬
// total = 該討論區總共頁數
// output = 輸出路徑
const StartCrawler = async (forum, startCode, totalCode, output) => {
  const list = [];
  for (let i = startCode; i <= totalCode; i++) {
    list.push(i);
  }
  await asyncForEach(list, async num => {
    await waitFor(5000);
    getWebSiteContent("https://www.mobile01.com/topiclist.php?f=" + forum + "&p=" + num, output);
  });
};

StartCrawler(692, 1, 2, "./output/result.json");
// 欲寫入的json需預設有一個Array
