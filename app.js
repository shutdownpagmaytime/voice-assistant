require('dotenv-extended').load();

const builder = require('botbuilder');
const restify = require('restify');

const constants = require('./constants');
const utils = require('./utils');

const helpModule = require('./dialogs/help');
const authModule = require('./dialogs/auth');
const addEntryModule = require('./dialogs/addEntry');
const removeEntryModule = require('./dialogs/removeEntry');
const editEntryModule = require('./dialogs/editEntry');
const checkAvailabilityModule = require('./dialogs/checkAvailability');
const summarizeModule = require('./dialogs/summarize');
const primaryCalendarModule = require('./dialogs/primaryCalendar');
const prechecksModule = require('./dialogs/prechecks');

authModule.setResolvePostLoginDialog((session, args) => {
    if (!session.privateConversationData.calendarId) {
        args.followUpDialog = primaryCalendarModule.getPrimaryCalendarDialogName();
        args.followUpDialogArgs = {
            intent: {
                entities: [
                    utils.wrapEntity(constants.entityNames.Action, constants.entityValues.Action.set)
                ]
            }
        };
    }
    return args;
});

// setup our web server
const server = restify.createServer();
server.use(restify.queryParser());
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log('%s listening to %s', server.name, server.url);
});

// initialize the chat bot
const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

const bot = new builder.UniversalBot(connector, [
    session => {
        helpModule.help(session);
    }
]);

server.post('/api/messages', connector.listen());
server.get('/oauth2callback', (req, res, next) => {
    authModule.oAuth2Callback(bot, req, res, next);
});

const luisModelUri = 'https://eastasia.api.cognitive.microsoft.com/luis/v2.0/apps/' + process.env.LUIS_APP + '?subscription-key=' + process.env.LUIS_SUBSCRIPTION_KEY;
bot.recognizer(new builder.LuisRecognizer(luisModelUri));

bot.library(addEntryModule.create());
bot.library(helpModule.create());
bot.library(authModule.create());
bot.library(removeEntryModule.create());
bot.library(editEntryModule.create());
bot.library(checkAvailabilityModule.create());
bot.library(summarizeModule.create());
bot.library(primaryCalendarModule.create());
bot.library(prechecksModule.create());

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.set('port', process.env.PORT || 5000);

console.log("+++++++++++++++"+ app.get('port'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

app.listen(app.get('port'), function(){
          console.log('Express server listening on port ' + app.get('port'));
          });
