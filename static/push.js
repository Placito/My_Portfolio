// Import the 'web-push' library
var push = require('web-push');
var fs = require('fs');

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

// Read subscription objects from the JSON file
let subscriptions = JSON.parse(fs.readFileSync('subscriptions.json'));

// Send a push notification to each subscription
subscriptions.forEach(sub => {
    push.sendNotification(sub, "test message")
        .then(response => {
            console.log('Push notification sent successfully:', response);
        })
        .catch(error => {
            console.error('Error sending push notification:', error);
        });
});
