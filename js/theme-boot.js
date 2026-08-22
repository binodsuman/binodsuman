(function () {
    try {
        var t = localStorage.getItem('bs-appearance');
        if (t) document.documentElement.setAttribute('data-theme', t);
        else document.documentElement.setAttribute('data-theme', 'dark');
    } catch (e) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
})();
