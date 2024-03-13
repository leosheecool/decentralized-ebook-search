import {
  Db,
  MatchPhraseQuery,
  prepareSQL,
  queryStringPrepare,
} from "@glitterprotocol/glitter-sdk";
import { IBookItem } from "./definitions";

type Row = {
  [key: string]: {
    value: string;
  };
};

type DynamicBookItem = Record<keyof IBookItem, string | number>;

const processDataModal = (resultArr: { row: Row }[]): IBookItem[] => {
  return resultArr.map((item) => {
    const obj: DynamicBookItem = {} as DynamicBookItem;
    Object.keys(item.row).forEach((key) => {
      obj[key as keyof IBookItem] = item.row[key].value;
    });
    return obj as IBookItem;
  });
};

const highlight = (fields: string[]) => {
  const fieldsStr = fields.map((field) => `"${field}"`).join(",");
  return `/*+ SET_VAR(full_text_option='{"highlight":{ "style":"html","fields":[${fieldsStr}]}}') */`;
};

const assembleSql = (libraryColumns: string, libraryTable: string) => {
  const highlightStr = highlight(["title", "author"]);
  return `select ${highlightStr} ${libraryColumns} from ${libraryTable} where query_string(?) limit 0, 200`;
};

export const searchBooks = async (
  query: string,
  libraryColumns: string,
  libraryTable: string,
  dbClient: Db
): Promise<IBookItem[]> => {
  const queries = [];
  queries.push(new MatchPhraseQuery("title", `${query}`));
  const sqlString = queryStringPrepare(queries);

  const sql = assembleSql(libraryColumns, libraryTable);
  const newSql = prepareSQL(sql, sqlString);
  const sqlData = await dbClient.query(newSql);
  return processDataModal(sqlData?.result || []);
};
