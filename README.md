# Screen Recording API

This is a backend API for screen recording application. It is a requirement of ZURI HNGx stage 5 Frontend and backend collaboration

# Functionalities

It supports live recording of videos and saves on google cloud storage
Live recording is supported via Websockets API
At the begining of the recording, the id of the entity to being created is sent to the frontend as a websocket message
at the end of the recording transcript may be uploaded to the server by a POST request

# Usage

API root = http://martdev.tech:3000

1.  Saving a live recording
    a. Connect to the server using browser websock api at ws://martdev.tech:3000
    b. Send media recording streams via the opened communication to the server
    c. Ensure recording is completed before closing the connection
2.  Sending transcript
    a. send transcript as a body of a POST /api/{entries_id}/add_transcript
    b Format {text: transcript_string}
3.  Get an entry (entry contains id of video and transcript)
    a. GET "/api/entries/{entry_id}"
    b Response type {videoId: "id_string", transcriptId: "id_string"}
4.  Delete an entry DELETE "/api/entries/{entry_id}"
