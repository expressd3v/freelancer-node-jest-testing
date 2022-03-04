import express from 'express';

const router = express.Router();

export function handler(app) {
  const { logger } = app;
  router.route('/status').post(async (req, res) => {


    /** simple end point need to be changed with dev-ops  */
    try {

        if(req.body) {
            // publish to rabbitmq
            const { MessageStatus, MessageSid }=req.body;
             publish('sms.message', { eventType:MessageStatus, messageId:MessageSid });
             logger.info('Success Published incoming message');
            res.send();
        }

    } catch (error) {
        res.send();
    }
});


router.route('/inbound').post((req, res)=>{
    try {
        if(req.body) {
            // Publish to rabbitmq
             publish('sms.inbound', req.body);
            res.send();
        }

    } catch (error) {
        res.send();
    }
});

return router;

}
