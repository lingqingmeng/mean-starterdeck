var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

ArticleProvider = function(host, port) {
  this.db= new Db('node-mongo-blog', new Server(host, port, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};


ArticleProvider.prototype.getCollection= function(callback) {
  this.db.collection('articles', function(error, article_collection) { //constructor args: (dbInstance, collectionName, primKeyFactory, options)
    if( error ) callback(error);
    else callback(null, article_collection);
  });
};

ArticleProvider.prototype.findAll = function(callback) { 
    this.getCollection(function(error, article_collection) {
      if( error ) callback(error)
      else {
        article_collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};


ArticleProvider.prototype.findById = function(id, callback) { //id = req params, callback is func containing render
    this.getCollection(function(error, article_collection) {
      if( error ) callback(error)
      else {
        article_collection.findOne({_id: article_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};


ArticleProvider.prototype.saveNew = function(articles, callback) {
    this.getCollection(function(error, article_collection) {
      if( error ) callback(error)
      else {
        if( typeof(articles.length)=="undefined")  articles = [articles]; 
        for( var i =0;i< articles.length;i++ ) { //iterate through all articles
          article = articles[i]; //each article
          article.created_at = new Date(); //created at = now
          if( article.comments === undefined ) article.comments = []; //inst. comment class member if it doesn't exist
          for(var j =0;j< article.comments.length; j++) { //iterate through all comments of each article
            article.comments[j].created_at = new Date(); //comment.created_at = now
          }
          if( article.startscores === undefined ) article.startscores = []; //inst. startscores array if not exist
          for(var j =0;j< article.startscores.length; j++) { //iterate through all startscores ...
            article.startscores[j].created_at = new Date(); //startscore.created_at = now
          }
          if( article.rating === undefined ) article.rating = [];
        }
        article_collection.insert(articles, function() { //inserts fully formed articles
          callback(null, articles);
        });
      }
    }); 
};

//new stuff
ArticleProvider.prototype.delete = function(articleId, callback) {
	this.getCollection(function(error, article_collection) {
		if(error) callback(error);
		else {
			article_collection.remove(
				{_id: article_collection.db.bson_serializer.ObjectID.createFromHexString(articleId)},
				function(error, article){
					if(error) callback(error);
					else callback(null, article)
				});
			}
	});
};

ArticleProvider.prototype.addCommentToArticle = function(articleId, someJsonArray, callback) {
  this.getCollection(function(error, article_collection) {
    if( error ) callback( error );
    else {
      var i = 0;  
      article_collection.update(
        {_id: article_collection.db.bson_serializer.ObjectID.createFromHexString(articleId)},
        {
            "$push": {  
                comments: someJsonArray
            } 
        }, //someJsonArray is person,comment,score,date
        function(error, article){ //arg3: option, arg2: update
          if( error ) callback(error);
          else callback(null, article)
        });
    }
  });
};

// update a blog post
ArticleProvider.prototype.updateBlog = function(articleId, articles, callback) {
    this.getCollection(function(error, article_collection) {
      if( error ) callback(error);
      else {
        article_collection.update(
            {_id: article_collection.db.bson_serializer.ObjectID.createFromHexString(articleId)},
            {"$set": {
                        title: articles.title,
                        body: articles.body,
                        startscore: articles.startscore
                     }
            },
            function(error, articles) {
                if(error) callback(error);
                else callback(null, articles)       
            });
      }
    });
};

ArticleProvider.prototype.doAvgToArray = function( someJsonArray, callback) {
   this.getCollection(function(error, article_collection) {
      if( error ) callback(error)
      else {
          if( typeof(someJsonArray.length)=="undefined")  someJsonArray = [someJsonArray]; 
          article_collection.insert(someJsonArray, function() { //inserts fully formed someJsonArray
              callback(null, someJsonArray);
          });
      }
  });
};

exports.ArticleProvider = ArticleProvider;