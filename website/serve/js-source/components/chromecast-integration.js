define(["jquery"], function ($) {
    var applicationID = '67584AFB';
    var namespace = 'urn:x-cast:couk.psyked.projectstats';
    var session = null;

    return function () {
        $('.chromecast-link').on('click', function () {
            /**
             * Call initialization for Cast
             */
            if (!chrome.cast || !chrome.cast.isAvailable) {
                setTimeout(initializeCastApi, 1000);
            } else {
                initializeCastApi();
            }
        });

        /**
         * initialization
         */
        function initializeCastApi() {
            var sessionRequest = new chrome.cast.SessionRequest(applicationID);
            var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
                sessionListener,
                receiverListener);
            chrome.cast.initialize(apiConfig, onInitSuccess, onError);
        }

        /**
         * initialization success callback
         */
        function onInitSuccess() {
            appendMessage("onInitSuccess");
            $('.chromecast-link .material-icons').text("cast_connected").addClass("active");
            transcribe("tellsd");
        }

        /**
         * initialization error callback
         */
        function onError(message) {
            $('.chromecast-link .material-icons').text("cast").removeClass("active");
            appendMessage("onError: " + JSON.stringify(message));
        }

        /**
         * generic success callback
         */
        function onSuccess(message) {
            appendMessage("onSuccess: " + message);
        }

        /**
         * callback on success for stopping app
         */
        function onStopAppSuccess() {
            $('.chromecast-link .material-icons').text("cast").removeClass("active");
            appendMessage('onStopAppSuccess');
        }

        /**
         * session listener during initialization
         */
        function sessionListener(e) {
            appendMessage('New session ID:' + e.sessionId);
            session = e;
            session.addUpdateListener(sessionUpdateListener);
            session.addMessageListener(namespace, receiverMessage);
        }

        /**
         * listener for session updates
         */
        function sessionUpdateListener(isAlive) {
            var message = isAlive ? 'Session Updated' : 'Session Removed';
            message += ': ' + session.sessionId;
            appendMessage(message);
            if (!isAlive) {
                session = null;
            }
        }

        /**
         * utility function to log messages from the receiver
         * @param {string} namespace The namespace of the message
         * @param {string} message A message string
         */
        function receiverMessage(namespace, message) {
            appendMessage("receiverMessage: " + namespace + ", " + message);
        }

        /**
         * receiver listener during initialization
         */
        function receiverListener(e) {
            if (e === 'available') {
                appendMessage("receiver found");
            }
            else {
                appendMessage("receiver list empty");
            }
        }

        /**
         * stop app/session
         */
        function stopApp() {
            $('.chromecast-link .material-icons').text("cast").removeClass("active");
            session.stop(onStopAppSuccess, onError);
        }

        /**
         * send a message to the receiver using the custom namespace
         * receiver CastMessageBus message handler will be invoked
         * @param {string} message A message string
         */
        function sendMessage(message) {
            if (session != null) {
                session.sendMessage(namespace, message, onSuccess.bind(this, "Message sent: " + message), onError);
            }
            else {
                chrome.cast.requestSession(function (e) {
                    session = e;
                    session.sendMessage(namespace, message, onSuccess.bind(this, "Message sent: " + message), onError);
                }, onError);
            }
        }

        /**
         * append message to debug message window
         * @param {string} message A message string
         */
        function appendMessage(message) {
            console.log(message);
        }

        /**
         * utility function to handle text typed in by user in the input field
         */
        function update() {
            sendMessage(document.getElementById("input").value);
        }

        /**
         * handler for the transcribed text from the speech input
         * @param {string} words A transcibed speech string
         */
        function transcribe(words) {
            sendMessage(words);
        }
    }
});