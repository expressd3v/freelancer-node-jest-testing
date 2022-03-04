# Rabbitmq-gateway-service

This service was created as a gatway to any calls required to the system from thrird party service. It's just a `READ` service where it will query
the needed datat from the system but it will not `mutate` or `write`. it will only publish through rabbitmq to the worker handler of the service
`rabbitmq-gateway-workers` where that worker will mutate and report what ever needed to be reported .

This service uses mostly two main third parties `AWS` and `twilio` where `AWS` currently to report the emails statuses and `twilio` for the `sms` and phone calles
and it's devided into routes:

## Environment variables

**Required**

* `RECORDINGS_BASE_URL`: A base endpoint which contains a `http(s)//<domain>/<path>/` pointing to where the audio records as stored  
* `RECORDINGS`: A file e.g. `recordings.json` referencing all supported audio recordings. Referenced audio files should be relative to the base URL (i.e. `welcome.us.mp3` or `us/welcome.mp3`)
* `TWILIO_AUTH_TOKEN`: Auth token extracted from Twilio Console
* `TWILIO_PUBLIC_URL`: A link to rabbitmq-gateway-service from outside. Will be used for follow-up requests for [phone call events](https://www.twilio.com/docs/chat/webhook-events)

**Optional**

* `TWILIO_DISABLE_REQUEST_VALIDATION`: Disable [request validation](https://www.twilio.com/docs/usage/tutorials/how-to-secure-your-express-app-by-validating-incoming-twilio-requests#disable-request-validation-during-testing) from Twilio. Should only be used for testing or, if preferred, in local development.

## 1- Amazon route `/amazon`

Amazon send to this gateway all the emails report regarding the email statuses  'send', 'reject', 'bounce', 'complaint', 'delivery', 'open', 'renderingFailure', ..etc where you can
can see that under `send-emai-worker` `AWS configurations`.

Amazon route consist of two main reports handler from AWS . 
1- `SubscriptionConfirmation`: when we initiate the `send-email-worker` twilio send a request to this route to accept the subscription.
2- `Notification` : every email been sent will be reported under `Notification`.

and once the report is recieved from Amazon we will publish to `rabbitmq-gateway-service` to log the status and the activity of the message.

## 2- Twilio inbound call `/inboundcall`

when the candidate call the number they will see they will endup in this wroute where a friendly message will say:
`Thank you for calling . we will contact you shortly. Good bye`

Note this route is prepared for the inbound phone call where we can provide two env_variables:`TRANSPERFECT_PHONENUMBER` and `JANSSEN_STUDYID`.
and if these two params are true the phone call will be redirected to the `TRANSPERFECT_PHONENUMBER`.
and will be reported with it's status

## 3- Twilio outbound call  `outboundcall`
This is the proxynumber that the `site users` uses to call out the candidates.
and publish to rabbitmq through the `/status`.

## 4- Twilio sms 

consist of two routes
- `/status` where twilio report back the status of the sms sent from the system and then publish it to `rabbitmq-gateway-worker`
- `/inbound` when the candidates sent an sms to the system it will be redirected to this route .



## Development (2019-01-29)

### Tunnel

Find a tunnel software, for example ngrok. Start the tunnel to your computer on port 5000.

### Start

| Env  | Value |
|----------|--------|
| TWILIO_DEV_NUMBER | YOUR_PHONE_NUMBER |
| TWILIO_CALLER_ID | +46105517569 |
| TWILIO_PUBLIC_URL | Your tunnel url + /webhook |
| CANDIDATE_SERVICE_URL | http://localhost:3020/graphql |
| TWILIO_AUTH_TOKEN | valid token |


**Always use all the env when you start the application**

We use a twilio development number (`+46105517569`) connected to a Twiml app named [`AdminDevelopment`](https://www.twilio.com/console/voice/twiml/apps).
With your credentials log in to the Twilio app and change the voice request url to your tunnel url.



## Overview
Call service acts as a webhook for [Twilio](https://www.twilio.com/) service. It's responsible for catching incomming **Manager** calls and redirecting them to **Candidates**. Call service will also send **Candidate activity** updates whenever phonecall status changes.

## Run on local machine

 1. Make sure that you have a [Twilio account](https://www.twilio.com/try-twilio).
    ***We already have a xxx account. See Carl for info***
     1. Create a [New Project](https://www.twilio.com/console/projects/create). **Trial** project does not require adding any of payment info and is good enough for development use.
     2. [Buy](https://www.twilio.com/console/phone-numbers/search) **Voice capable** phone number. It will cost you virtual twilio dollars, so no worries.
     3. For **Trial** projects you need to [verify](https://www.twilio.com/console/phone-numbers/verified) the number, you will be calling. For dev purposes, just use your private phone number. It will become handy in a minute.

 5. ~~Proceed to `/config/default.js` file and fill missing fields:~~
    Use environment variables:

     - ~~`app.publicUrl`~~ `PUBLIC_URL` - your public-exposed app address. Can be `ngrok` addres, or your IP (if you have public one)
     - ~~`candidateService.endpoint`~~ `CANDIDATE_SERVICE_URL` - local **running** `candidate-service` instance address
     - ~~`twilio.callerId`~~ `TWILIO_CALLER_ID` - Twilio phone number, you've bought in previous steps. Has to be in [E.164 Format](https://www.twilio.com/docs/glossary/what-e164)
     - ~~`twilio.devNumber`~~ `TWILIO_DEV_NUMBER` - Your **[verified](https://www.twilio.com/console/phone-numbers/verified)** test phone number. In `development` mode, **every single** call will be redirected to this number, **no matter** the selected candidate. Also has to be in [E.164 Format](https://www.twilio.com/docs/glossary/what-e164)

        See [How to add your number](#how-to-add-your-number) to be used in development.
     - ~~`twilio.authToken`~~ `TWILIO_AUTH_TOKEN` - Auth token, that can be found on the main page of your Twilio project.
     <small>***The token is mandatory in production and is picked up internally by `Twilio.webhook()`***</small>

6. Start the app with `npm run start-dev` and expose it to the public
7. [Create](https://www.twilio.com/console/phone-numbers/runtime/twiml-apps/add) new TwiML app, where `Request URL` points to your exposed app, with `/webhook` postfix. Ex: `https://1337app.ngrok.io/webhook`
8. Now plug in your TwiML App to the Twilio number. Navigate to [Active numbers](https://www.twilio.com/console/phone-numbers/incoming). Click your phone number (red link). In number's configuration page change `Configure with` dropdown to `TwiML App`, then `TwiML App` dropdown to your TwiML app. Then save.
9. Boom! Everything's ready. You can call your previously bought Twilio number. Most likely you will not have second **verified** phone device to use, so Twilio lets you to call from the browser (Firefox has issues with microphone detection). It is possible after clicking **Call** button in TwiML app page, which can be accessed from [TwiML Apps page](https://www.twilio.com/console/phone-numbers/runtime/twiml-apps)

## How to add your number

Login to Twilio web console and got to [Verified Caller IDs](https://www.twilio.com/console/phone-numbers/verified).

## Call flow
1. Call your Twilio number
2. Enter Candidate's **token** when asked (it's an Candidate ID for now)
3. If Candidate has been found, your call will be redirected to Candidate's phone number (or in `development` mode - your phone number, specified in `config -> twilio.devNumber`
4. All call status updates are logged into the console (for now)

## Troubleshooting
All **Twilio related** errors are reported [here](https://www.twilio.com/console/runtime/debugger). In-app logs can be found in `/logs` directory.
