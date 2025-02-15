import fs from "fs";
import path from "path";
import xml2js from "xml2js";

const queriesPath = path.join(process.cwd(), "queries.xml");

const loadQueries = async () => {
  const xmlData = fs.readFileSync(queriesPath, "utf-8");
  const parser = new xml2js.Parser();
  
  const result = await parser.parseStringPromise(xmlData);
  const queries = {};

  result.queries.query.forEach((q) => {
    queries[q.$.id] = q._;
  });

  return queries;
};

export default loadQueries;
