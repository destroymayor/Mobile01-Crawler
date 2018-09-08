import cheerio from "cheerio";
import fs from "fs";
import axios from "axios";

const exportResults = (parsedResults) => {
  fs.readFile('./question.json', 'utf-8', (err, data) => {
    if (err) console.log('read', err)
    const jsonData = JSON.parse(data);

    parsedResults.map(item => {
      jsonData.push(item);
      fs.writeFile("./question.json", JSON.stringify(jsonData), (err) => {
        if (err) console.log('write', err);

      });
    });
  });
}

const getWebSiteContent = async url => {
  const result = [];
  const linkList = [];
  try {
    const ResponseHTML = await axios.get(url);
    const $ = cheerio.load(ResponseHTML.data);
    $(".subject > span > a").each((index, value) => {
      linkList.push({ link: "https://www.mobile01.com/" + $(value).attr("href"), page: $('.numbers').text() });
    });
  } catch (error) {
    console.log(error);
  }

  linkList.map(link => {
    axios.get(link.link).then(ResponseHTML => {
      const $ = cheerio.load(ResponseHTML.data);
      //迭代所有回覆
      const ReplyList = [];
      $(".single-post-content").map((index, value) => {
        ReplyList.push(
          $(value)
            .text()
            .replace(new RegExp("\\n|\\s+", "g"), "")
        );
      });

      result.push({
        title: $("#forum-content-main")
          .find("h1")
          .text(),
        content: $(".single-post-content")
          .first()
          .text()
          .replace(new RegExp("\\n|\\s+", "g"), ""),
        reply: ReplyList,
        page: link.page
      });
      exportResults(result);
    }).catch(error => {
      console.log(error);
    });
  });
};

for (let i = 7; i < 2900; i++) {
  (num => {
    setTimeout(() => {
      getWebSiteContent("https://www.mobile01.com/topiclist.php?f=291&p=" + num);
      console.log(num)
    }, 5000 * (i + 1));
  })(i);
}