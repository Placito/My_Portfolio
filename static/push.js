// Import the 'web-push' library
var push = require('web-push');

// Define the VAPID keys
let vapidKeys = {
    publicKey: 'BGfCBSTIIey3gnPXdtI5Z0Qz1qy_eShWxmUdy2jQnot83_xm84gl5CV-b1Q0k8CrsNPlc1RBj2lVHt0_vxAS-mM',
    privateKey: '9OOT51sCxTw3KSmVLHdRl3JFEfpYJmXjTj5RQPh6cSg'
};

// Set the VAPID details, which include the email address, public key, and private key
push.setVapidDetails(
    "mailto:mariana.placito@gmail.com",
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

// Pull the subscription object from the database
// This object should be obtained from a previous subscription request by the client
let sub = {
    // Example subscription object structure
    endpoint: 'https://fcm.googleapis.com/fcm/send/example-endpoint',
    keys: {
        auth: 'example-auth-key',
        p256dh: 'example-p256dh-key'
    }
};

// Send a push notification to the subscription
push.sendNotification(sub, "test message")
    .then(response => {
        console.log('Push notification sent successfully:', response);
    })
    .catch(error => {
        console.error('Error sending push notification:', error);
    });
