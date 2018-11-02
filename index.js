import { startCrawler, fileMerger } from "./crawler";

// forum = 討論區代號
// startCode = 從第幾頁開始爬
// total = 該討論區總共頁數

startCrawler(174, 1, 1701);

//mainFile, mergerFile
//fileMerger('./data/computer/computer.json', './data/computer/605.json');
