/*global console*/
/*global Notification*/

/******************************************************************************************
                            NOTIFICATION FUNCTIONS
******************************************************************************************/
document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    if (!Notification) {
        console.error('Desktop notifications not available in your browser. Try Chromium.');
        return;
    }
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }
});

function createNotification(title, body, icon) {
    'use strict';
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    } else {
        var notification = new Notification(title, {
            body: body,
            icon: icon,
            requireInteraction: true,
            sound: 'Sosumi.aiff' // not supported
        });
        notification.onclick = function () {
            window.focus(document);
            notification.close();
        };
        notification.onerror = function () {
            console.error('The notification encountered an error');
        };
    }
}

function notify() {
    'use strict';
    var date = new Date(),
        time = date.toLocaleTimeString();
    createNotification('PureComm',
                       time + ' new notification',
                       'logo.png');
}

/******************************************************************************************
                            SIMULATION FUNCTIONS
******************************************************************************************/
var isSimulation = false;

function loop() {
    'use strict';
    if (isSimulation) {
        if (Math.random() < 0.1) {
            notify();
        }
        setTimeout(loop, 1000);
    }
}

function simulate() {
    'use strict';
    var button = document.getElementById('btnSimulate');
    if (isSimulation) {
        isSimulation = false;
        button.style.backgroundColor = "red";
    } else {
        isSimulation = true;
        button.style.backgroundColor = "green";
        loop();
    }
}