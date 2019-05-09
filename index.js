const { startCrawler, fileMerger } = require("./crawler");
const program = require("commander");

//mainFile, mergerFile
//fileMerger("./data/computer/computer1.json", "./data/computer/605.json");

const ParseInt = (value, dummyPrevious) => parseInt(value);

program
  .option("-f, --forum <number>", "論壇代碼", ParseInt)
  .option("-s, --startPage <number>", "從哪一頁開始抓取", ParseInt)
  .option("-t, --totalPage <number>", "共有多少頁", ParseInt);

program.parse(process.argv);

if (program.forum !== undefined && program.startPage !== undefined && program.totalPage !== undefined) {
  console.log(`論壇代碼 ${program.forum} , 從第 ${program.startPage} 頁開始爬取 , 總共${program.totalPage}頁。`);

  // forum = 討論區代號
  // StartPage = 從哪頁開始抓取
  // total = 該討論區總共頁數
  startCrawler(program.forum, program.startPage, program.totalPage);
}
