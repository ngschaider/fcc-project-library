/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.MONGO_URI;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});



module.exports = function (app) {
  MongoClient.connect(MONGODB_CONNECTION_STRING, {}, (err, client) => {
    if(err) throw err;

    const db = client.db("personallibrary").collection("books");
    app.route('/api/books')
      .get(function (req, res){
        db.find({}).toArray((err, books) => {
          if(err) throw err;

          for(var i = 0; i < books.length; i++) {
            books[i].commentcount = books[i].comments.length;
            delete books[i].comments;
          }

          res.json(books);
        });
        //response will be array of book objects
        //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      })
      
      .post(function (req, res){
        const title = req.body.title;

        if(!title) {
          res.send("missing required field");
          return;
        }

        db.insertOne({title: title, comments: []}, {new: true}, (err, dbRes) => {
          if(err) throw err;

          res.json({
            title: title,
            _id: dbRes.insertedId
          });
        });
        //response will contain new book object including atleast _id and title
      })
      
      .delete(function(req, res){
        const id = req.body.id;

        db.delete({}, {}, (err, res) => {
          if(err) throw err;

          res.send("complete delete successful");
        });
        //if successful response will be 'complete delete successful'
      });



    app.route('/api/books/:id')
      .get(function (req, res){
        if(!req.params.id.match(/[a-zA-Z0-9]{24}/)) {
          res.send("no book exists");
          return;
        }
        const bookId = new ObjectId(req.params.id);
        

        db.findOne({_id: bookId}, {}, (err, book) => {
          if(err) throw err;

          if(!book) {
            console.log("!!!no book exists!!!");
            res.send("no book exists");
            return;
          }
          res.json(book);
        });
        //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      })
      
      .post(function(req, res){
        const bookId = new ObjectId(req.params.id);
        const comment = req.body;

        db.findOneAndUpdate({_id: bookId}, {
          $push: {
            comments: comment,
          },
        }, {returnOriginal: false}, (err, dbRes) => {
          if(err) throw err;
          res.json(dbRes.value);
        });
        //json res format same as .get
      })
      
      .delete(function(req, res){
        const bookId = req.params.id;
        db.deleteOne({_id: id}, {}, (err, res) => {
          if(err) throw err;

          res.send("delete successful");
        });
        //if successful response will be 'delete successful'
      });

    console.log("...done");
  });
  
};