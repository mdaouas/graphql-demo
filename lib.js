const fetch = require('node-fetch');
const HttpsProxyAgent = require('https-proxy-agent');

const proxy = new HttpsProxyAgent('http://185.46.214.32:9400/');

const requestGithubToken = (credentials) =>
  fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(credentials),
    agent: proxy,
  })
    .then((res) => res.json())
    .catch((error) => {
      throw new Error(JSON.stringify(error));
    });

const requestGithubUserAccount = (token) =>
  fetch(`https://api.github.com/user?access_token=${token}`, {
    agent: proxy,
  })
    .then((res) => res.json())
    .catch((error) => {
      throw new Error(JSON.stringify(error));
    });

const authorizeWithGithub = async (credentials) => {
  const { access_token } = await requestGithubToken(credentials);
  const githubUser = await requestGithubUserAccount(access_token);
  return { ...githubUser, access_token };
};

module.exports = { authorizeWithGithub, proxy };

// https://github.com/login/oauth/authorize?client_id=3ff9ff3dc1c19ed06e45&scope=user
