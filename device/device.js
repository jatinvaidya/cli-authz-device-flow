const { default: Axios } = require("axios");
require('dotenv').config();
const qrcode = require('qrcode-terminal');

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const CLIENT_ID = process.env.CLIENT_ID;
const AUDIENCE = process.env.AUDIENCE;
const SCOPE = process.env.SCOPE;

let getDeviceCode = async () => {

    const url = `https://${AUTH0_DOMAIN}/oauth/device/code`;
    const postBody = {
        client_id: CLIENT_ID,
        audience: AUDIENCE,
        scope: SCOPE
    };

    return Axios.post(url, postBody)
        .then(res => {
            console.log(res.data);
            qrcode.generate(res.data.verification_uri_complete, { small: false }, function (qrcode) {
                console.log(qrcode);
            });
            return res.data.device_code;
        });
}

let callTokenEndpoint = async (device_code) => {

    const url = `https://${AUTH0_DOMAIN}/oauth/token`
    const postBody = {
        client_id: CLIENT_ID,
        device_code: device_code,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
    };

    return Axios.post(url, postBody)
        .then(res => res.data)
        .catch(err => console.error(err.response.data));
}

let sleep = ms => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

let getAccessToken = async (deviceCode) => {
    while (true) {
        await sleep(5000);
        console.info('polling ...');
        let response = await callTokenEndpoint(deviceCode)
            .catch(error => {
                console.error(error);
            });
        if (!!response) {
            console.info('received access token, stop polling ...');
            return response.access_token;
        }
    }
}

let callApi = async () => {
    let deviceCode = await getDeviceCode();
    let accessToken = await getAccessToken(deviceCode);
    console.log('calling api with access token ...');
    const options = {
        url: `http://${process.env.API_HOST}:${process.env.API_PORT}/data`,
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            'authorization': `Bearer ${accessToken}`
        }
    };
    Axios(options)
        .then(response => {
            console.log(`api response: ${JSON.stringify(response.data)}`);
        }).catch(error => console.log(error.message));
}

callApi();