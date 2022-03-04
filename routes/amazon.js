import bodyParser from 'body-parser';
import express from 'express';

const router = express.Router();

export function handler(app) {
  app.use(bodyParser.urlencoded({ extended: false }));
  const { logger } = app;

  logger.info('checking: at Amazon handler');

  router.route('/').post(bodyParser.text(), async (req, res) => {
    logger.info('checking: at Amazon Main route');

    /** simple end point need to be changed with dev-ops  */
    let payload;
    try {
       payload=JSON.parse(req.body);

       logger.info('checking: at Amazon  handler payload ', payload);

    } catch (error) {
      return null;
    }

    if (payload.Type === 'SubscriptionConfirmation') {
      const { SubscribeURL } = payload;

        await fetch(SubscribeURL)
        .then(res => res.text())
        .then(() => {
          logger.info('Yess! We have accepted the confirmation from AWS!!');
          return res.sendStatus(200);

        }).catch(()=>res.sendStatus(500));
    }

    if(payload.Type === 'Notification') {
      if(payload.Message === 'Successfully validated SNS topic for Amazon SES event publishing.') {

        logger.info('Response success from Amazon');
        res.send(payload.Message);
      }
        let data;
      try {

         data= JSON.parse(payload.Message);

         logger.info('checking: at Amazon  handler data ', data);

      } catch (error) {
        return;
      }
      const { eventType, mail:{ commonHeaders: { messageId } } } = data;
     // rabbitmq-gateway-worker will handle the message
      publish('amazon.message', { eventType, messageId });
    }

  });


  return router;
}

