console.log("Hello World");
// const state = require("./state.js");
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
    // await searchKaraokeVideos()
    // await stopWebServer(webServer)
    console.log("end");
}

async function robot() {
    // const content = state.load()
    console.log("Hello World");
    await authenticateWithOAuth()
    availableVideos = await searchKaraokeVideos()
    async function authenticateWithOAuth() {
        console.log("authenticate");
        const webServer = await startWebServer()
        // KPC sobe o servidor web para a tela de consentimento
        const OAuthClient = await createOAuthClient()
        // KPC cria o cliente de autenticação
        requestUserConsent(OAuthClient)
        // KPC solicita o consentimento abrindo a página de consentimento do Google
        const authorizationToken = await waitForGoogleCallback(webServer)
        await requestGoogleForAccessTokens(OAuthClient, authorizationToken)
        await setGlobalGoogleAuthentication(OAuthClient)
        // const youtubeKaraokeVideosHtml = await searchKaraokeVideos()
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
            // console.log(credentials);
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
                    // console.log(`Consent given. Received authorization code ${authCode}`)
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
                        // console.log(tokens)

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

        // async function searchKaraokeVideosHtml() {
        //     // Rota para a página inicial
        //     webServer.app.get('/', async (req, res) => {
        //         try {
        //             // Parâmetros de busca
        //             const searchQuery = 'karaoke';
        //             const maxResults = 5; // Número máximo de resultados

        //             // URL da API do YouTube
        //             const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=${maxResults}&key=${apiKey}`;

        //             // Realiza a requisição à API do YouTube
        //             const response = await axios.get(apiUrl);

        //             // Extrai os resultados da resposta
        //             const results = response.data.items;

        //             // Renderiza uma página HTML com os resultados
        //             res.send(`
        //         <html>
        //         <head>
        //             <title>Resultados da Busca do YouTube</title>
        //         </head>
        //         <body>
        //             <h1>Resultados da Busca do YouTube</h1>
        //             <ul>
        //             ${results.map(result => `<li>${result.snippet.title}</li>`).join('')}
        //             </ul>
        //         </body>
        //         </html>
        //     `);
        //         } catch (error) {
        //             // Trata erros
        //             console.error('Erro na Requisição:', error.message);
        //             res.status(500).send('Erro ao processar a solicitação.');
        //         }
        //     })}

        // async function searchKaraokeVideos() {
        //     // Parâmetros de busca
        //     const searchQuery = 'karaoke';
        //     const maxResults = 5; // Número máximo de resultados

        //     apiKey = "AIzaSyCf3-84MwdqslbYXjlDt8P2SQzhjs774Z8"

        //     // URL da API do YouTube
        //     const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=${maxResults}&key=${apiKey}`;

        //     // Realiza a requisição
          
        //     var results = youtube.search.list('id,snippet', {q: 'dogs', maxResults: 25});
              
        //     for(var i in results.items) {
        //     var item = results.items[i];
        //     console.log('[%s] Title: %s', item.id.videoId, item.snippet.title);
        //     }
        //     axios.get(apiUrl)
        //         .then(response => {
        //             // Manipule os dados de resposta aqui
        //             console.log('Resultado da Busca:', response.data);
        //             return response.data
        //         })
        //         .catch(error => {
        //             // Trate erros aqui
        //             console.error('Erro na Requisição:', error.message);
        //         });

        // }







    }
    async function searchKaraokeVideos(){
        availableVideos = youtube.search.list({
                "part": [
                "snippet"
                ],
                "maxResults": 10,
                "q": "karaoke reginaldo rossi bar"
            })
                .then(function(response) {
                        // Handle the results here (response.result has the parsed body).
                        console.log("Response", response.data.items[0].snippet.title);
                        },
                        function(err) { console.error("Execute error", err); });
        return availableVideos
      
    }

}


start()

