import cheerio from "cheerio";
import fs from "fs";
import axios from "axios";

const readFileAsync = path => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};

const exportResults = parsedResults => {
  readFileAsync("./question.json")
    .then(data => {
      const jsonData = JSON.parse(data);
      jsonData.push(parsedResults);

      fs.writeFile("./question.json", JSON.stringify(jsonData), err => {
        if (err) console.log("write", err);
      });
    })
    .catch(err => {
      console.log(err);
    });
};

const getWebSiteContent = async url => {
  const linkList = [];
  try {
    const ResponseHTML = await axios.get(url);
    const $ = cheerio.load(ResponseHTML.data);
    $(".subject > span > a").each((index, value) => {
      linkList.push({ link: "https://www.mobile01.com/" + $(value).attr("href"), page: $(".numbers").text() });
    });
  } catch (error) {
    console.log(error);
  }

  const result = [];
  const LinkAsyncRequest = async (url, page) => {
    try {
      const ResponseHTML = await axios.get(url);
      const $ = cheerio.load(ResponseHTML.data);

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
        title: $("#forum-content-main > h1")
          .first()
          .text(),
        content: $(".single-post-content")
          .first()
          .text()
          .replace(new RegExp("\\n|\\s+|{|}|\"|'", "g"), ""),
        reply: ReplyList,
        page: page
      });

      console.log(page);
    } catch (error) {}

    await exportResults(result);
  };

  Promise.all(
    linkList.map(async link => {
      await LinkAsyncRequest(link.link, link.page);
    })
  );
};

const runFunction = (pageNumber, total) => {
  for (let i = 1; i < total; i++) {
    (num => {
      setTimeout(() => {
        getWebSiteContent("https://www.mobile01.com/topiclist.php?f=291&p=" + (num + pageNumber));
        console.log(num + pageNumber);
      }, 2000 * (i + 1));
    })(i);
  }
};

runFunction(350, 2900);
