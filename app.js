/**
 * Module dependencies.
 */

var express = require('express');
var ArticleProvider = require('./articleprovider-mongodb').ArticleProvider; 


var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use(express.json());
  app.use(express.urlencoded());
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

var articleProvider = new ArticleProvider('localhost', 27017);
// Routes

app.get('/', function(req, res){
    articleProvider.findAll( function(error,docs){
        res.render('index.jade', { 
                title: 'Bloggy',
                articles:docs,
				score: 'togetright'
        });
    })
});

app.get('/blog/new', function(req, res) {
    res.render('blog_new.jade', {  
        title: 'New Restaurant'
    });
});

app.post('/blog/:id/delete', function(req, res) {
		articleProvider.delete(req.param('_id'), function(error, docs) {
			res.redirect('/')
		});
});

app.get('/blog/:id/edit', function(req, res) {
	articleProvider.findById(req.param('_id'), function(error, article) {
		res.render('blog_edit',
		{
			title: article.title,
			article: article
		});
	});
});

app.post('/blog/:id/save', function(req, res) {
	articleProvider.updateBlog(req.param('_id'),{
		title: req.param('title'),
		body: req.param('body'),
        startscore: req.param('startscore'),
        rating: parseInt(req.param('startscore')) //added parseInt  
	}, function(error, docs) {
		res.redirect('/')
	});
});

app.post('/blog/new', function(req, res){
    articleProvider.saveNew(
        { 
             // has a name, descript and initial rating
              title: req.param('title'),
              body: req.param('body'),
              startscore: req.param('startscore'),
              rating: parseInt(req.param('startscore')) //added parseInt 
        }, 
        function( error, docs) {
            res.redirect('/')
        });
});

app.post('/blog/addComment', function(req, res) { //todo sneak in the average method somewhere
    articleProvider.addCommentToArticle(
        req.param('_id'),
         { //arg2
            person: req.param('person'), //if returns =right of eq. sign for post/query params
            comment: req.param('remark'), //remark is what the user's put in as text, goes from the html form to here (app.js)
            score: parseInt(req.param('score')), //edited to parseInt() wrapper
            created_at: new Date() //arg2 end
          }
        , function( error, docs) { //arg3 = option
           res.redirect('/blog/' + req.param('_id'))
       });
});

app.get('/blog/doAveraging', function(req, res) {
    res.render('blog_doAveraging.jade', {  
        
    });
});

//deprecate
app.post('/blog/doAveraging', function(req, res) {
    articleProvider.doAvgToArray(
        { // has a name, descript and initial rating
          startscore: req.param('startscore'),
          anotherstartscore: req.param('anotherstartscore')
        },
        function( error, docs) {
            res.redirect('/')
        });
});

//new 6-28
app.post('/blog/averageTest', function(req, res) {
    articleProvider.addCommentAlternate(
        req.param('_id'),
         { //arg2
            person: req.param('person'), //if returns =right of eq. sign for post/query params
            comment: req.param('remark'), //remark is what the user's put in as text, goes from the html form to here (app.js)
            score: parseInt(req.param('score')), //edited to parseInt() wrapper
            created_at: new Date() //arg2 end
          }
        , function( error, docs) { //arg3 = option
           res.redirect('/blog/' + req.param('_id'))
       });
});


app.get('/blog/:id', function(req, res) { 
    articleProvider.findById(req.params.id, function(error, articleDocs) {
        res.render('blog_show-final.jade', 
        { 
            title: articleDocs.title, 
            article:articleDocs,
            avscore: articleDocs.rating
        });
    });
});

app.post('/blog/doAvgPost' ,function(req, res) { //todo sneak in the average method somewhere
    articleProvider.doAvgToArray(
        {
            startscore: parseInt(req.param('startscore')),
            anotherstartscore: parseInt(req.param('anotherstartscore'))
            
        }, function( error, docs) {
            res.redirect('/')
        });
});


var listener = app.listen(3000);
console.log("Express server listening on port %d in %s mode", listener.address().port, app.settings.env);