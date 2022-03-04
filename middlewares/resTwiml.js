const middleware = (req, res, next) => {
  if (res.twilio) {
    return next();
  }

  res.twiml = (twilioResponse) => {
    return res.status(200)
      .set('Content-Type', 'text/xml')
      .send(twilioResponse);
  };

  next();
};

export default (app) => {
    app.use('/', middleware);
};
