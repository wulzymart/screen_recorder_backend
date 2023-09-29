# Screen Recording API

This is a backend API for screen recording application. It is a requirement of ZURI HNGx stage 5 Frontend and backend collaboration

# Functionalities

It supports live recording of videos and saves on google cloud storage
Live recording is supported via Websockets API
At the begining of the recording, the id of the entity to being created is sent to the frontend as a websocket message
at the end of the recording transcript may be uploaded to the server by a POST request

# Usage

1.  Saving a live recording
    a. Connect to the server using browser websock api at.
    b. Send media recording streams via the opened communication to the server
    c. Ensure recording is completed before closing the connection
2.  Sending transcript
    a. send transcript as a body of a POST
