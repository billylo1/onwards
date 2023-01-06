// Fetch the users being followed by a specific account, by ID
// https://developer.twitter.com/en/docs/twitter-api/users/follows/quick-start

import fetch from 'node-fetch';

import dotenv from 'dotenv';
dotenv.config();

// this is the ID for @TwitterDev
const userId = 2244994945;
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
    console.log(data.data.id);
    return data.data.id;
}

async function getFollowing(handle) {
    let userId = await getUserId(handle);
    const url = `https://api.twitter.com/2/users/${userId}/following?max_results=1000`;
    let response = await fetch(url, options);
    let data = await response.json();
    let followings = data.data;
    let postList = [];
    for (let i = 0; i < followings.length; i++) {
        let following = followings[i].username;
        let postStatus = await fetch(`https://post.news/${following}`);
        let responseCode = postStatus.status;
        if (responseCode == 200) {
            console.log(`${following} is on Post.News`);
            postList.push(following);
        }
    }
    console.log(postList);
}

getFollowing('billylo');