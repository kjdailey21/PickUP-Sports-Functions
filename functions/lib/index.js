"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
// FIREBASE REALTIME DB REFERENCE
const ref = admin.database().ref();
// FIRESTORE BETTER DB REFERENCE
const db = admin.firestore();
// CREATE EXPRESS LAYER IN GOOGLE FUNCTIONS
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({ origin: true }));
// AUTHENTICATE THE REQUEST
// app.use(middleware of some kind);
app.get('/:id', (req, res) => {
    res.send(req.params.id);
    // const userFriendsList = db.collection('profiles').doc(req.params.id).collection('friends_list');
    // let friendArray = [];
    // userFriendsList.get().then((friends) => {
    //     friends.forEach((friend) => {
    //         const friendId = friend.data().friendId;
    //         const friendRef = db.collection('profiles').doc(friendId);
    //         const nextGame = friendRef.get().then(doc => {
    //             return doc.data().next_game;
    //         });
    //         console.log('Friend', nextGame);
    //
    //         friendArray.push({
    //             friendId: friendId,
    //             next_game: nextGame
    //         });
    //         });
    //     res.send(friendArray.splice(5));
    //     }).catch(err => {
    //         console.error('Some error', err);
    // }).catch(err => {
    //     console.error('User not found!', err);
    // });
});
////////////////////////////////
// PROFILE SPECIFIC FUNCTIONS //
////////////////////////////////
// CREATE OR ENABLE NEW / EXISTING ACCOUNTS (FIREBASE)
exports.createUserProfile = functions.auth.user().onCreate((user) => {
    console.log('This function is firing now');
    console.log('User: ', user);
    console.log('UID: ', user.uid);
    const uid = user.uid;
    const email = user.email;
    const photo = user.photoURL || 'https://firebasestorage.googleapis.com/v0/b/pickupsports-185012.appspot.com/o/profile_images%2Fplaceholders%2Fprofile_placeholder.png?alt=media&token=3ffcfe32-83dc-4e3b-b2cb-9a166dd0a754';
    let facebookId;
    if (user.providerData.length === 0 || user.providerData === []) {
        console.log('Not Facebook User');
        facebookId = 'not_facebook';
    }
    else {
        console.log('Facebook User', user.providerData[0].uid);
        facebookId = user.providerData[0].uid;
    }
    const newUserRef = ref.child(`/profiles/${uid}`);
    console.log('This user does not exist yet.  Creating User!');
    return newUserRef.set({
        email: email,
        photo: photo,
        createdDate: new Date(),
        isActive: true,
        alertMethod: 'push',
        bio: ' ',
        distance: 20,
        facebookId: facebookId,
        firstName: ' ',
        lastName: ' ',
        mapView: true,
        readyToPlay: false,
        roles: {
            admin: false,
            user: true,
            sponsor: false
        },
        aboutMeComplete: false,
        friendsComplete: false,
        homeComplete: false,
        sportsComplete: false,
        tutorialComplete: false,
        profileComplete: false,
        location: {
            lat: 0,
            lng: 0
        }
    });
});
// CREATE OR ENABLE NEW / EXISTING ACCOUNTS (FIRESTORE)
exports.createUserFirestoreProfile = functions.auth.user().onCreate((user) => {
    console.log('This function is firing now');
    console.log('User: ', user);
    console.log('UID: ', user.uid);
    const uid = user.uid;
    const email = user.email;
    const photo = user.photoURL || 'https://firebasestorage.googleapis.com/v0/b/pickupsports-185012.appspot.com/o/profile_images%2Fplaceholders%2Fprofile_placeholder.png?alt=media&token=3ffcfe32-83dc-4e3b-b2cb-9a166dd0a754';
    let facebookId;
    if (user.providerData.length === 0 || user.providerData === []) {
        console.log('Not Facebook User');
        facebookId = 'not_facebook';
    }
    else {
        console.log('Facebook User', user.providerData[0].uid);
        facebookId = user.providerData[0].uid;
    }
    const newUserRef = db.collection('profiles').doc(uid);
    // CREATE THE NEW USER'S PROFILE
    console.log('This user does not exist yet.  Creating User!');
    return newUserRef.set({
        email: email,
        photo: photo,
        createdDate: new Date(),
        isActive: true,
        alertMethod: 'push',
        bio: '',
        distance: 20,
        facebookId: facebookId,
        firstName: '',
        lastName: '',
        mapView: true,
        friends_count: 0,
        game_count: 0,
        readyToPlay: false,
        roles: {
            admin: false,
            user: true,
            sponsor: false
        },
        aboutMeComplete: false,
        friendsComplete: false,
        homeComplete: false,
        sportsComplete: false,
        tutorialComplete: false,
        profileComplete: false,
        location: {
            lat: 0,
            lng: 0
        }
    }).then(() => {
        // ADD KEVIN'S USER TO THE FRIENDS LIST
        return newUserRef.collection('friends_list').doc().set({
            friendId: 'bzGK0op8S4WuL5YliFRHcdBlKKr2',
            accepted: true
        }).then(() => {
            // ADD CHRIS'S USER TO THE FRIENDS LIST
            return newUserRef.collection('friends_list').doc().set({
                friendId: 'ASUUYgf28Wc9qk1UtIx0i44hVrZ2',
                accepted: true
            });
        });
    });
});
// UPDATE THE COUNT OF FRIENDS ON PROFILE
exports.incrementFriendsCount = functions.firestore.document('profiles/{profileId}/friends_list/{friendId}').onCreate((change, context) => {
    const profileId = context.params.profileId;
    const friendId = context.params.friendId;
    console.log('Updating friends for: ', profileId);
    console.log('Adding friend: ', friendId);
    const profileRef = db.collection('profiles').doc(profileId);
    return profileRef.get().then(profileDoc => {
        const friend_count = profileDoc.data().friends_count + 1;
        return profileRef.update({
            friends_count: friend_count
        });
    });
});
// UPDATE THE COUNT OF GAMES ON PROFILE
exports.decrementGamesCount = functions.firestore.document('profiles/{profileId}/games/{gameId}').onDelete((change, context) => {
    const profileId = context.params.profileId;
    const gameId = context.params.gameId;
    console.log('Updating games for: ', profileId);
    console.log('Removing game: ', gameId);
    const profileRef = db.collection('profiles').doc(profileId);
    return profileRef.get().then(profileDoc => {
        let game_count;
        if (profileDoc.data().game_count > 0) {
            game_count = profileDoc.data().game_count - 1;
        }
        else {
            game_count = 0;
        }
        return profileRef.update({
            game_count: game_count
        });
    });
});
// UPDATE THE COUNT OF GAMES ON PROFILE
exports.incrementGamessCount = functions.firestore.document('profiles/{profileId}/games/{gameId}').onCreate((change, context) => {
    const profileId = context.params.profileId;
    const gameId = context.params.gameId;
    console.log('Updating games for: ', profileId);
    console.log('Adding game: ', gameId);
    const profileRef = db.collection('profiles').doc(profileId);
    return profileRef.get().then(profileDoc => {
        const game_count = profileDoc.data().game_count + 1;
        return profileRef.update({
            game_count: game_count
        });
    });
});
// UPDATE THE COUNT OF FRIENDS ON PROFILE
exports.decrementFriendsCount = functions.firestore.document('profiles/{profileId}/friends_list/{friendId}').onDelete((change, context) => {
    const profileId = context.params.profileId;
    const friendId = context.params.friendId;
    console.log('Updating friends for: ', profileId);
    console.log('Removing friend: ', friendId);
    const profileRef = db.collection('profiles').doc(profileId);
    return profileRef.get().then(profileDoc => {
        let friend_count;
        if (profileDoc.data().friends_count > 0) {
            friend_count = profileDoc.data().friends_count - 1;
        }
        else {
            friend_count = 0;
        }
        return profileRef.update({
            friends_count: friend_count
        });
    });
});
////////////////////////////////
//  GAMES SPECIFIC FUNCTIONS  //
////////////////////////////////
// CREATING A NEW GAME
exports.createNewGame = functions.firestore.document('games/{gameId}').onCreate((change, context) => {
    console.log('Creating a new game');
    const gameId = context.params.gameId;
    const profileId = change.data().created_by;
    console.log('Game ' + gameId + ' was just created by user ' + profileId);
    const gameRef = db.collection('games').doc(gameId);
    const playerRef = db.collection('profiles').doc(profileId);
    return gameRef.collection('event_members').doc().set({
        profileId: profileId
    }).then(() => {
        return playerRef.collection('games').doc().set({
            gameId: gameId
        });
    });
});
// UPDATE THE COUNT OF PLAYERS ON GAME
exports.incrementPlayerCount = functions.firestore.document('games/{gameId}/event_members/{memberId}').onCreate((change, context) => {
    const gameId = context.params.gameId;
    const memberId = context.params.memberId;
    console.log('Updating player count for game: ', gameId);
    console.log('Adding player: ', memberId);
    const gameRef = db.collection('games').doc(gameId);
    return gameRef.get().then(gameDoc => {
        const member_count = gameDoc.data().member_count + 1;
        return gameRef.update({
            member_count: member_count
        });
    });
});
exports.decrementPlayerCount = functions.firestore.document('games/{gameId}/event_members/{memberId}').onDelete((change, context) => {
    const gameId = context.params.gameId;
    const memberId = change.data().profileId;
    console.log('Updating player count for game: ', gameId);
    console.log('Removing player: ', memberId);
    const gameRef = db.collection('games').doc(gameId);
    const playerRef = db.collection('profiles').doc(memberId);
    return gameRef.get().then(gameDoc => {
        let member_count;
        if (gameDoc.data().member_count > 0) {
            member_count = gameDoc.data().member_count - 1;
        }
        else {
            member_count = 0;
        }
        return gameRef.update({
            member_count: member_count
        }).then(() => {
            const document_query = playerRef.collection('games').where('gameId', '==', gameId);
            document_query.get().then((docs) => {
                docs.forEach((doc) => {
                    doc.ref.delete().then(() => {
                        console.log('Deleted game: ' + gameId);
                    }).catch(err => {
                        console.error("Error removing document", err);
                    });
                });
            }).catch(err => {
                console.error("Error removing document", err);
            });
        }).catch(err => {
            console.error("error removing document", err);
        });
    });
});
// DELETING A GAME - SHOULDNT REALLY EVER BE CALLED
exports.deleteGame = functions.firestore.document('games/{gameId}').onDelete((change, context) => {
    console.log('Deleting Game: ' + context.params.gameId);
    return true;
});
////////////////////////////////
//   NOTIFICATIONS SPECIFIC   //
////////////////////////////////
// ADDING PLAYERS TO GAMES
exports.createNotification = functions.firestore.document('notifications/{notifyId}/players/{playerId}').onCreate((change, context) => {
    console.log('Notifying some people');
});
////////////////////////////////
//   TEAMS / FRIENDS PAGE     //
////////////////////////////////
exports.nextFivePlayers = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map