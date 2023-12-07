const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
  let usersWithSameName = users.filter((user)=>{
    return user.username === username
  });
  if(usersWithSameName.length > 0){
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ 
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}
//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ error: "Error logging in. Both username and password are required." });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,
      username
    };

    return res.status(200).json({ message: "User successfully logged in", username });
  } else {
    return res.status(401).json({ error: "Invalid Login. Check username and password" });
  }
});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username; // Change this line

  if (!isbn || !review || !username) {
    return res.status(400).json({ error: "ISBN, review, and username are required in the request." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ error: "Book not found." });
  }

  const existingReview = books[isbn].reviews[username];

  if (existingReview) {
    books[isbn].reviews[username] = review;
    res.status(200).json({ message: "Review modified successfully." });
  } else {
    books[isbn].reviews[username] = review;
    res.status(201).json({ message: "Review added successfully." });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!isbn || !username) {
    return res.status(400).json({ error: "ISBN, and username are required in the request." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ error: "Book not found." });
  }

  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully." });
  } else {
    return res.status(404).json({ error: "Review not found for the specified user and book." });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
