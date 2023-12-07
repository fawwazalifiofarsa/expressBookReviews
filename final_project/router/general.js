const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
async function getBookList() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(books);
    }, 1000);
  });
}

public_users.get('/', async function (req, res) {
  try {
    const books = await getBookList();
    res.send(JSON.stringify({ books }, null, 4));
  } catch (error) {
    console.error('Error fetching book list:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Get book details based on ISBN
async function getBookDetailsByISBN(isbn) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!isNaN(isbn) && books.hasOwnProperty(isbn)) {
        const bookDetails = books[isbn];
        resolve(bookDetails);
      } else {
        reject({ error: 'Book not found' });
      }
    }, 1000);
  });
}

public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const bookDetails = await getBookDetailsByISBN(isbn);
    res.send({ book: bookDetails });
  } catch (error) {
    res.status(404).send(error);
  }
});
  
// Get book details based on author
async function getBookDetailsByAuthor(author) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const filteredBooks = Object.values(books).filter((book) => book.author.toLowerCase().includes(author.toLowerCase()));
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject({ error: 'No books found for the author' });
      }
    }, 1000);
  });
}

public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const bookDetails = await getBookDetailsByAuthor(author);
    res.send({ books: bookDetails });
  } catch (error) {
    res.status(404).send(error);
  }
});

// Get all books based on title
async function getBookDetailsByTitle(title) {
  return new Promise((resolve, reject) => {
    // Replace the setTimeout with your actual asynchronous operation to fetch book details
    setTimeout(() => {
      const filteredBooks = Object.values(books).filter((book) => book.title.toLowerCase().includes(title.toLowerCase()));
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject({ error: 'No books found for the title' });
      }
    }, 1000); // Simulating a delay of 1 second
  });
}

public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const bookDetails = await getBookDetailsByTitle(title);
    res.send({ books: bookDetails });
  } catch (error) {
    res.status(404).send(error);
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  if (!isNaN(isbn) && books.hasOwnProperty(isbn)) {
    const filtered_books = books[isbn];
    if (filtered_books.reviews && Object.keys(filtered_books.reviews).length > 0) {
      res.send({ reviews: filtered_books.reviews });
    } else {
      res.status(404).send({ error: 'No reviews found for the book' });
    }
  } else {
    res.status(404).send({ error: 'Book not found' });
  }
});

module.exports.general = public_users;
