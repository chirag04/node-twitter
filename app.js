
/**
 * Module dependencies.
 */

var express = require('express')
  , pg = require('pg')
  , hash = require('pwd').hash 
  , http = require('http')
  , path = require('path')
  , moment = require('moment');

var app = express();

var conString = process.env.DATABASE_URL;
var DB_NAME = 'dj1i6nklti7cl';

app.configure(function(){
  app.set('port', process.env.PORT || 5000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser('sta'));
  app.use(express.session());
  app.use(express.methodOverride());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(function(req, res, next){
    if(req.session && req.session.profile) {
      res.locals.profile = req.session.profile;  
    } else {
      res.locals.profile = null;
    }
    next();
  });
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.get('/',function(req, res){
  if(!req.session.profile) {
    res.render('home.ejs',{"error":null,"comments":null});
  } else {
  pg.connect(conString, function(err, client) {
    if(err){
      res.render('home.ejs',{"error" : "Unable to connect to database","comments":null});
    } else {
      var query = "SELECT * FROM "+DB_NAME+".comments"+
                    " left join "+DB_NAME+".users on comments.userid = users.userid"+
                    " left join "+DB_NAME+".followers on comments.userid = followers.userid"+
                    " WHERE followerid ='" + req.session.profile.userid + "'";
      client.query(query, function(err,result){
        if(err){
          res.render('home.ejs',{"error" : "Error occoured while querying the database","comments":null});
        }else {
            for (var i = result.rows.length - 1; i >= 0; i--) {
                  result.rows[i].addedat = moment.unix(result.rows[i].addedat).fromNow();
            }
            res.render('home.ejs',{"error":null,"comments":result.rows});
        }
      });
    }
  });
  }
});

app.get('/profile', function(req, res){
  if(req.session && req.session.profile) {
    res.redirect('/profile/'+req.session.profile.username);
  } else {
    res.render('404.ejs');
  }
});

app.get('/profile/:id',function(req, res){
  pg.connect(conString, function(err, client) {
    if(err){
      res.render('profile.ejs',{"error" : "Unable to connect to database"});
    } else {
      var query = "SELECT * FROM "+DB_NAME+".users where username='" + req.params.id +"'";
      client.query(query, function(err,result){
        if(err){
          res.render('profile.ejs',{"error" : "Error occoured while querying the database"});
        }else {
          if(result.rowCount == 1) {
            var query = "SELECT * FROM "+DB_NAME+".comments"+
                    " left join "+DB_NAME+".users on comments.userid = users.userid"+
                    " WHERE username='" + req.params.id + "'";
            client.query(query, function(err,result){
              if(err){
                res.render('profile.ejs',{"error" : "Error occoured while querying the database"});
              }else {
                for (var i = result.rows.length - 1; i >= 0; i--) {
                  result.rows[i].addedat = moment.unix(result.rows[i].addedat).fromNow();
                }
                if(req.session.profile && req.session.profile.username != req.params.id){
                   var query = "SELECT * FROM "+DB_NAME+".followers"+
                               " left join "+DB_NAME+".users on followers.userid = users.userid"+
                               " WHERE followerid='" + req.session.profile.userid + "' AND"+
                               " username = '" + req.params.id + "'";
                    client.query(query, function(err,followersresult){
                      if(err){
                        res.render('profile.ejs',{"error" : "Error occoured while querying the database"});
                      }else {
                        if(followersresult.rowCount == 1) {
                          res.render('profile.ejs',{"error":null,"comments":result.rows,"follow":true});        
                        } else {
                          res.render('profile.ejs',{"error":null,"comments":result.rows,"follow":false});        
                        }
                      }
                    });
                } else {
                  res.render('profile.ejs',{"error":null,"comments":result.rows,"follow":null});
                }
              }
            });
          } else {
            res.render('404.ejs');  
          }
        }
      });
    }
  });
});

app.post('/unfollow',restrict,function(req,res){
   pg.connect(conString, function(err, client) {
    if(err){
      res.json({"error":"Unable to connect to database"});
    } else {
      var query = "delete from "+DB_NAME+".followers where followerid = '" +req.session.profile.userid+ "' AND " +
                   "userid = (select userid from "+DB_NAME+".users where username = '" + req.body.username + "')";
      client.query(query, function(err, result) {
        if(err){
          res.json({"error":"error occured while querying the database"});
        } else {
          res.json({"success":"1"});
        }
      });
    }
  });
});

app.post('/follow',restrict,function(req,res){
   pg.connect(conString, function(err, client) {
    if(err){
      res.json({"error":"Unable to connect to database"});
    } else {
      var query = "insert into "+DB_NAME+".followers select '" + req.session.profile.userid + "',userid from "+DB_NAME+".users where username = '" + req.body.username + "'";
      client.query(query, function(err, result) {
        if(err){
          res.json({"error":"error occured while querying the database"});
        } else {
          res.json({"success":"1"});
        }
      });
    }
  });
});

app.get('/login',function(req, res){
  if(req.session && req.session.profile) {
    res.redirect('/');
  } else {
    var error = null;
    if(req.session && req.session.error){
      error = req.session.error;
      delete req.session.error;
    }
    res.render('login.ejs',{"error":error});
  }
});

app.get('/signup',function(req, res){
  if(req.session && req.session.profile) {
    res.redirect('/');
  } else {
    var error = null;
    if(req.session && req.session.error){
      error = req.session.error;
      delete req.session.error;
    }
    res.render('signup.ejs',{"error":error});
  }
});

app.post('/login',function(req, res){
  pg.connect(conString, function(err, client) {
    if(err){
      req.session.error = "Unable to connect to database";
      res.redirect('/login');
    } else {
      var query = "SELECT * FROM "+DB_NAME+".users WHERE " +
                   "username='" + req.body.username + "' OR "+
                   "email='" + req.body.username + "'";
      client.query(query, function(err, result) {
        if(err){
          req.session.error = "Error occoured while querying the database";
          res.redirect('/login');
        }else {
          if(result.rowCount == 1) {
            hash(req.body.password, result.rows[0].salt, function(err, hash){
              if (err) {
                req.session.error = "Error occoured while hashing";
                res.redirect('/login');
              } else if (hash == result.rows[0].password) {
                req.session.regenerate(function(){
                  var profile = {"userid":result.rows[0].userid,
                                 "username":result.rows[0].username
                                };
                  req.session.profile = profile;
                  res.redirect('/');
                });
              } else {
                req.session.error = "Invalid password";
                res.redirect('/login');  
              }
            });
          } else {
            req.session.error = "Invalid username/email";
            res.redirect('/login');
          }
        }
      });
    }
  });
});

app.post('/signup',function(req, res){
  pg.connect(conString, function(err, client) {
    if(err){
      req.session.error = "Unable to connect to database";
      res.redirect('/signup');
    } else {
      var query = "SELECT * FROM "+DB_NAME+".users WHERE " +
                   "username='" + req.body.username + "' OR "+ 
                   "email='" + req.body.email + "'";
      client.query(query, function(err, result) {
        if(err){
          console.log(err);
          req.session.error = "Error occoured while querying the database";
          res.redirect('/signup');
        }else {
          if(result.rowCount > 0) {
            req.session.error = "Username/email is already in use";
            res.redirect('/signup');
          } else {
            hash(req.body.password, function(err, salt, hash){
              if (err) {
                req.session.error = "Error occoured while hashing";
                res.redirect('/signup');
              } else {
                var query = "INSERT INTO "+DB_NAME+".users(username,password,salt,email) VALUES($1,$2,$3,$4) RETURNING userid";
                client.query(query,[req.body.username,hash,salt,req.body.email],function(err,result){
                  if(err){
                    req.session.error = "Error occoured while querying the database";
                    res.redirect('/signup');
                  }else {
                    req.session.regenerate(function(){
                      var profile = {"userid":result.rows[0].userid,
                                     "username":req.body.username
                                    };
                      req.session.profile = profile;
                      res.redirect('/');
                    });
                  }
                });
              }
            });
          }
        }
      });
    }
  });
});

app.get('/logout',function(req, res){
  req.session.destroy(function(){
    res.redirect('/');
  });
});

app.get('/about',function(req, res){
  res.render('about.ejs');
});

/* this is when no route is matched */
app.get('*',function(req, res){
  res.render('404.ejs');
});

// helper middilewares 

function restrict(req, res, next){
  if(req.session && req.session.profile) {
    next();
  } else {
    req.session.error = "Please login to continue";
    res.redirect('/login');
  }
}

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
