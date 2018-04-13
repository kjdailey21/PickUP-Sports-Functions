import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp(functions.config().firebase);

const ref = admin.database().ref();

// CREATE OR ENABLE NEW / EXISTING ACCOUNTS
exports.createUserProfile = functions.auth.user().onCreate((user) => {

    console.log('This function is firing now');

    const uid = user.uid;
    const email = user.email;
    const photo = user.photoURL || 'https://firebasestorage.googleapis.com/v0/b/pickupsports-185012.appspot.com/o/profile_images%2Fplaceholders%2Fprofile_placeholder.png?alt=media&token=3ffcfe32-83dc-4e3b-b2cb-9a166dd0a754';
    let facebookId: string;

    if (!user.providerData) {
        console.log('Not Facebook User');
        facebookId = 'not_facebook';
    } else {
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
    })

});



