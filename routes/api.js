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
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
  console.log("connecting to mongo database");
  MongoClient.connect(process.env.MONGO_URI, {}, (err, client) => {
    console.log("...done");
    if(err) throw err;

    console.log("...successfully");
    const db = client.db("personallibrary").collection("books");
    console.log("registering routes");
    app.route('/api/books')
      .get(function (req, res){
        console.log("got request");
        db.find({}).toArray((err, books) => {
          if(err) throw err;
          console.log("found books");

          for(var i = 0; i < books.length; i++) {
            books.commentcount = books.comments.length;
            delete books.comments;
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
        const bookId = req.params.id;

        db.findOne({_id: bookId}, {}, (err, book) => {
          if(err) throw err;

          res.json(book);
        });
        //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      })
      
      .post(function(req, res){
        const bookId = req.params.id;
        const comment = req.body.comment;

        db.findOneAndUpdate({_id: bookId}, {
          $push: {
            comments: comment,
          },
        }, {returnOriginal: false}, (err, dbRes) => {
          if(err) throw err;

          res.json(dbRes.result.value);
        });
        //json res format same as .get
      })
      
      .delete(function(req, res){
        var bookId = req.params.id;
        db.deleteOne({_id: id}, {}, (err, res) => {
          if(err) throw err;

          res.send("delete successful");
        });
        //if successful response will be 'delete successful'
      });

    console.log("...done");
  });

  
  
};
