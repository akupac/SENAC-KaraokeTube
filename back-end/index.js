console.log("Hello World");
const express = require('express');
const axios = require('axios');
const google = require('googleapis').google;
const OAuth2 = google.auth.OAuth2
const youtube = google.youtube({
    version: 'v3'
})

async function start() {
    console.log("start");
    await robot()
    console.log("end");
}

async function robot() {
    console.log("Hello World");
    await authenticateWithOAuth()
    availableVideos = await searchKaraokeVideos()
    async function authenticateWithOAuth() {
        console.log("authenticate");
        const webServer = await startWebServer()
        const OAuthClient = await createOAuthClient()
        requestUserConsent(OAuthClient)
        const authorizationToken = await waitForGoogleCallback(webServer)
        await requestGoogleForAccessTokens(OAuthClient, authorizationToken)
        await setGlobalGoogleAuthentication(OAuthClient)
        const youtubeKaraokeVideos = await searchKaraokeVideos()
        console.log(youtubeKaraokeVideos)
        await stopWebServer(webServer)

        async function startWebServer() {
            console.log("startWebServer");
            return new Promise((resolve, reject) => {
                const port = 5000
                const app = express()

                const server = app.listen(port, () => {
                    console.log(`Listening on http://localhost:${port}`)
                    resolve({
                        app,
                        server
                    })
                })
            })
        }
        async function createOAuthClient() {
            console.log("OAuthClient");
            const credentials = require("./credentials/google-youtube.json");
            const OAuthClient = new OAuth2(
                credentials.web.client_id,
                credentials.web.client_secret,
                credentials.web.redirect_uris[0]
            )
            return OAuthClient

        }

        function requestUserConsent(OAuthClient) {
            console.log("requestUserConsent");
            const consentUrl = OAuthClient.generateAuthUrl({
                access_type: "offline",
                scope: "https://www.googleapis.com/auth/youtube"
            })
            console.log(`Please give your consent to KaraokeTube access Youtube data: ${consentUrl}`);
        }
        async function waitForGoogleCallback(webServer) {
            return new Promise((resolve, reject) => {
                webServer.app.get("/oauth2callback", (req, res) => {
                    const authCode = req.query.code
                    console.log(`Consent given. Received authorization code`)
                    res.send("<h1>Success!</h1><p>Close this tab to start using KaraokeTube.</p>")
                    resolve(authCode)
                })
            })
        }

        async function requestGoogleForAccessTokens(OAuthClient, authorizationToken) {
            return new Promise((resolve, reject) => {
                OAuthClient.getToken(authorizationToken, (error, tokens) => {
                    if (error) {
                        return reject(error)
                    } else {
                        console.log("Received access tokens")

                        OAuthClient.setCredentials(tokens)
                        resolve()
                    }
                })
            })
        }

        async function setGlobalGoogleAuthentication(OAuthClient) {
            console.log("setGlobalGoogleAuthentication");
            google.options({
                auth: OAuthClient
            })
        }

        async function stopWebServer(webServer) {
            return new Promise((resolve, reject) => {
                webServer.server.close(() => {
                    resolve()
                })
            })
        }







    }
    async function searchKaraokeVideos() {
        availableVideos = youtube.search.list({
                "part": [
                    "snippet"
                ],
                "maxResults": 10,
                "q": "karaoke reginaldo rossi bar"
            })
            .then(function (response) {
                    console.log("Response", response.data.items[0].snippet.title);
                },
                function (err) {
                    console.error("Execute error", err);
                });
        return availableVideos

    }

}


start()