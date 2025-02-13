import admin from "firebase-admin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const serviceAccount = require("../serviceaccount.json");

// Initialize Firebase Admin (Only Once)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

class NotificationUtils {

    static async sendNotificationToDisplay(fcm_tokens, title, body) {
        const message = {
            tokens: fcm_tokens, 
            notification: {
                title: title,
                body: body,
            },
        };

        try {

            const response = await admin.messaging().sendEachForMulticast(message);
            console.log(response)
        } catch (error) {
            console.error("Error sending notifications:", error);
        }
    }

}

export default NotificationUtils;
