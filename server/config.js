require('dotenv').config(); 
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
try {
    const serviceAccount = require("./makfr-hacc-firebase-adminsdk-fbsvc.json");

    initializeApp({
      credential: cert(serviceAccount),
      databaseURL: "https://makfr-hacc-default-rtdb.firebaseio.com"
    });

    //const analytics = getAnalytics(firebaseApp);
    const db = getFirestore();
    const User = db.collection('Users');

    const getUserDataByEmail = async (email) => {
        const userQuery = await User.where('email', '==', email).get();
        console.log('User data response:', email);
        const usersData = userQuery.docs.map(doc => doc.data());
        return usersData;
    }

    module.exports = { User, getUserDataByEmail };
} catch (error) {
    console.error("Firebase service account key file is missing. Please provide 'makfr-hacc-firebase-adminsdk-fbsvc.json'.");
    process.exit(1);
}


