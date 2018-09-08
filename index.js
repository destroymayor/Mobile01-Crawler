import cheerio from "cheerio";
import fs from "fs";
import axios from "axios";

const result = [];
const linkList = [];

const getWebSiteContent = async url => {
  try {
    const ResponseHTML = await axios.get(url);
    const $ = cheerio.load(ResponseHTML.data);
    $(".subject > span > a").each((index, value) => {
      linkList.push("https://www.mobile01.com/" + $(value).attr("href"));
    });
  } catch (error) {
    console.log(error);
  }

  linkList.map(link => {
    axios.get(link).then(ResponseHTML => {
      const $ = cheerio.load(ResponseHTML.data);
      //迭代所有回覆
      const ReplyList = [];
      $(".single-post-content").each((index, value) => {
        ReplyList.push(
          $(value)
            .text()
            .replace(new RegExp("\\n|\\s+", "g"), "")
        );
      });

      result.push(
        Object.assign({
          title: $("#forum-content-main")
            .find("h1")
            .text(),
          content: $(".single-post-content")
            .first()
            .text()
            .replace(new RegExp("\\n|\\s+", "g"), ""),
          reply: ReplyList
        })
      );
      console.log(
        $("#forum-content-main")
          .find("h1")
          .text()
      );
      fs.writeFileSync("./question.json", JSON.stringify(result), err => {
        if (err) throw err;
      });
    });
  });
};

for (let i = 0; i < 10; i++) {
  getWebSiteContent("https://www.mobile01.com/topiclist.php?f=291&p=" + i);
}
