const functions = require("firebase-functions");

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
exports.findMyTwitterFollowersOnPostNews = functions.https.onRequest(async (request, response) => {
  
  let handle = request.query.handle;
  if (handle != undefined) {
    let postList = await getFollowing(handle);
    let responseHTML = `<html><body style="font-family:Arial, Helvetica, sans-serif;">These followers of yours are on post.news. You can follow them using the links below.<br /><br />`;

    for (let post of postList) {
        responseHTML += `<a href="https://post.news/${post}" target="_blank" rel="noopener noreferrer">${post}</a><br />`;
    }
    
    responseHTML += `</body></html>`;

    response.send(responseHTML);
  } else {
    response.send("Please provide a Twitter handle in the query string.");
  };
});

// Fetch the users being followed by a specific account, by ID
// https://developer.twitter.com/en/docs/twitter-api/users/follows/quick-start

const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

const bearerToken = process.env.BEARER_TOKEN;
const options = {
    headers: {
        "User-Agent": "onwards",
        "Authorization": `Bearer ${bearerToken}`
    }
}

async function getUserId(handle) {

    let response = await fetch(`https://api.twitter.com/2/users/by/username/${handle}`, options);
    let data = await response.json();
    let userId = data.data.id;
    console.log(userId);
    return userId;
}

async function getFollowing(handle) {
    let userId = await getUserId(handle);

    let nextToken = "";
    let followings = [];
    let count = 0;
    while (nextToken != undefined) {
        let url = `https://api.twitter.com/2/users/${userId}/following?max_results=1000`;
        if (nextToken != "") {
            url += `&pagination_token=${nextToken}`;
        }
        let response = await fetch(url, options);
        let responseJson = await response.json();
        nextToken = responseJson.meta.next_token;

        if (responseJson.data != undefined) {
            for (let user of responseJson.data) {
                followings.push(user);
            }
            count++;
        } else {
            break;
        }
    }
    let postList = [];
    let promises = [];

    for (let i = 0; i < followings.length; i++) {
        let following = followings[i].username;
        console.log(`Checking ${following} on Post.News`)
        let postStatusPromise =  fetch(`https://post.news/${following}`);
        promises.push(postStatusPromise);
    }
    let postResponses = await Promise.all(promises);
    for (let postResponse of postResponses) {
        let responseCode = postResponse.status;
        let following = postResponse.url.split('/')[3];
        if (responseCode == 200) {
            postList.push(following);
        }
    }
    
    return postList.sort();
}

