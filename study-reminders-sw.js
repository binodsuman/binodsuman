self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    var url = '/study-planner/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
            for (var i = 0; i < list.length; i++) {
                var c = list[i];
                if (c.url && c.url.indexOf('/study-planner') !== -1 && 'focus' in c) {
                    return c.focus();
                }
            }
            if (clients.openWindow) return clients.openWindow(url);
        })
    );
});
