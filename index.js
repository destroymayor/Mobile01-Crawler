import cheerio from "cheerio";
import fs from "fs";
import axios from "axios";

const getWebSiteContent = async url => {
  const result = [];
  try {
    const ResponseHTML = await axios.get(url);
    const $ = cheerio.load(ResponseHTML.data);

    $(".subject > span > a").each((index, value) => {
      axios.get("https://www.mobile01.com/" + $(value).attr("href")).then(ResponseContentPage => {
        const $contentPage = cheerio.load(ResponseContentPage.data);

        //迭代所有回覆
        const ReplyList = [];
        $contentPage(".single-post-content").each((index, value) => {
          ReplyList.push(
            $contentPage(value)
              .text()
              .replace(new RegExp("\\n|\\s+", "g"), "")
          );
        });

        result.push(
          Object.assign({
            title: $(value).text(),
            content: $contentPage(".single-post-content")
              .first()
              .text()
              .replace(new RegExp("\\n|\\s+", "g"), ""),
            reply: ReplyList
          })
        );

        console.log($(value).text());

        fs.writeFileSync("./question.json", JSON.stringify(result), err => {
          if (err) throw err;
        });
      });
    });
  } catch (error) {
    console.log(error);
  }
};

getWebSiteContent("https://www.mobile01.com/topiclist.php?f=291&p=1");
