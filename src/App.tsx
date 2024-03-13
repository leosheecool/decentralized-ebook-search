import { useState } from "react";
import "./App.css";
import { useDbClient } from "./hooks";
import { IBookItem } from "./lib/definitions";
import { searchBooks } from "./lib/search";

function App() {
  const dbClient = useDbClient();
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<IBookItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const libraryTable = "library.ebook";
  const libraryColumns =
    "ipfs_cid,title,author,extension,language,publisher,year,filesize, _score,_id";

  const handleSearchBooks = async () => {
    if (!dbClient || !query) return;

    setIsLoading(true);
    setBooks([]);
    const bookList = await searchBooks(
      query,
      libraryColumns,
      libraryTable,
      dbClient
    );
    setBooks(bookList);
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearchBooks();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <div className='search-container'>
      <h1 className='text-center my-4'>Book Search</h1>
      <form className='input-group mb-3' onSubmit={handleSubmit}>
        <input
          type='text'
          className='form-control form-input'
          placeholder='Search for books'
          value={query}
          onChange={handleSearchChange}
        />
        <button className='btn btn-primary' disabled={isLoading}>
          {isLoading ? <span className='sr-only'>Loading...</span> : "Search"}
        </button>
      </form>
      <div className='list-container'>
        <div className='list-group'>
          {books.map((book) => (
            <a
              href={`https://cloudflare-ipfs.com/ipfs/${book.ipfs_cid}?filename=${book.title}.${book.extension}`}
              target='_blank'
              className='list-group-item'
              key={book._id}
            >
              <h5
                className='title-text'
                dangerouslySetInnerHTML={{
                  __html: book._highlight_title,
                }}
              ></h5>
              <p>
                <span>Author: {book.author}</span>
                <span>Language: {book.language}</span>
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
