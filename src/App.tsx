// App.tsx
import { useState, useEffect } from 'react';
import { LCDClient, Coins, Numeric, MnemonicKey, Db, queryStringPrepare, MatchPhraseQuery, prepareSQL } from '@glitterprotocol/glitter-sdk';
import './App.css';

export interface IBookItem {
  ipfs_cid: string;
  title: string;
  author: string;
  publisher: string;
  year: string;
  language: string;
  extension: string;
  size: string;
  filesize: string;
  _id: string;
  downloadPercent?: number;
  _highlight_title: string;
  _highlight_author: string;
}

function App() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<IBookItem[]>([]);
  const [dbClient, setDbClient] = useState<Db | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const XIAN_HOST = "https://api.xian.glitter.link";
  const CHAIN_ID = "xian";
  const mnemonicKey = 'lesson police usual earth embrace someone opera season urban produce jealous canyon shrug usage subject cigar imitate hollow route inhale vocal special sun fuel';
  const libraryTable =  'library.ebook';
  const libraryColumns = 'ipfs_cid,title,author,extension,language,publisher,year,filesize, _score,_id';

  useEffect(() => {
    if (!dbClient) {
      const client = new LCDClient({
        URL: XIAN_HOST,
        chainID: CHAIN_ID,
        gasPrices: Coins.fromString('0.15agli'),
        gasAdjustment: Numeric.parse(1.5),
      });

      const key = new MnemonicKey({
        mnemonic: mnemonicKey,
        account: 0,
        index: 0,
      });

      const dbClient = client.db(key);
      setDbClient(dbClient);
    }
  }, [dbClient]);

  const processDataModal = (resultArr: { row: any }[]): IBookItem[]  =>{
    return resultArr.map((item) => {
      const obj: Record<any, any> = {};
      Object.keys(item.row).forEach((key) => {
        obj[key] = item.row[key].value;
      });
      return obj as IBookItem;
    });
  }

  const  highlight = (fields: string[]) => {
    const fieldsStr = fields.map((field) => `"${field}"`).join(',');
    return `/*+ SET_VAR(full_text_option='{"highlight":{ "style":"html","fields":[${fieldsStr}]}}') */`;
  }

  const assembleSql = () => {
    const highlightStr = highlight(['title', 'author'])
    return `select ${highlightStr} ${libraryColumns} from ${libraryTable} where query_string(?) limit 0, 200`;
  }


  const searchBooks = async () => {
    if (dbClient && query) {
      setIsLoading(true);
      setBooks([]);
      const queries = [];
      if (query) {
        queries.push(new MatchPhraseQuery('title', `${query}`));
      }
      const sqlString = queryStringPrepare(queries);
  
      const sql = assembleSql();
      const newSql = prepareSQL(sql, sqlString);
      const sqlData = await dbClient.query(newSql);
      const bookList = processDataModal(sqlData?.result || [])
      setBooks(bookList);
      setIsLoading(false);
    }
  };

  return (
    <div className="search-container">
      <h1 className="text-center my-4">Book Search</h1>
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search for books"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              searchBooks();
            }
          }}
        />
       <div className="input-group-append">
          <button className="btn btn-primary" onClick={searchBooks} disabled={isLoading}>
            {isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                <span className="sr-only">Loading...</span>
              </>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </div>
      <div className="list-container">
        <div className="list-group">
          {books.map((book, index) => (
            <div onClick={() => window.open(`https://cloudflare-ipfs.com/ipfs/${book.ipfs_cid}?filename=${book.title}.${book.extension}`, '_blank')} className="list-group-item" key={index}>
              <h5
                  className="title-text"
                  dangerouslySetInnerHTML={{
                    __html:
                    book._highlight_title,
                  }}
                ></h5>
              <p>
                <span>Author: {book.author}</span>
                <span>Language: {book.language}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
