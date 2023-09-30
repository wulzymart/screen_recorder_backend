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
    c. id of recording video will be sent back as a message from the server. save the id
    d. Ensure recording is completed before closing the connection
2.  Get a video entry
    a. GET "/api/videos/{video_id}"
    b success Response example
    {
    downloadLink: "/URL/AVAILABLE/FOR/24HRS",
    streamLink: "martdev.tech/api/videos/{video_id}/stream",
    transciptJson: "transcript data",
    dateCreated: date of creation,
    }
3.  Delete a video DELETE "/api/videos/{video_id}"
    Success Response
    { mssg: "video with id {entryid} deleted" }
