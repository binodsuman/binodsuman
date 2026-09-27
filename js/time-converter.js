/* Time Converter — any zone to any zone, CDT → IST by default, IST world clock. */
(function () {
    'use strict';

    var HOME = 'Asia/Kolkata';
    var STORAGE_KEY = 'binodsuman_tz_clock';
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    var LONG_TO_ABBR = {
        'India Standard Time': 'IST',
        'British Summer Time': 'BST',
        'Greenwich Mean Time': 'GMT',
        'Irish Standard Time': 'IST',
        'China Standard Time': 'CST',
        'Israel Daylight Time': 'IDT',
        'Israel Standard Time': 'IST',
        'Australian Eastern Standard Time': 'AEST',
        'Australian Eastern Daylight Time': 'AEDT',
        'Australian Western Standard Time': 'AWST',
        'Central European Summer Time': 'CEST',
        'Central European Standard Time': 'CET',
        'Central European Time': 'CET',
        'Eastern European Summer Time': 'EEST',
        'Eastern European Standard Time': 'EET',
        'Eastern European Time': 'EET',
        'Japan Standard Time': 'JST',
        'Korean Standard Time': 'KST',
        'Korea Standard Time': 'KST',
        'Singapore Standard Time': 'SGT',
        'Hong Kong Standard Time': 'HKT',
        'Pakistan Standard Time': 'PKT',
        'Bangladesh Standard Time': 'BDT',
        'Nepal Time': 'NPT',
        'Gulf Standard Time': 'GST',
        'Arabian Standard Time': 'AST',
        'Moscow Standard Time': 'MSK',
        'Brasilia Standard Time': 'BRT',
        'Argentina Standard Time': 'ART',
        'New Zealand Standard Time': 'NZST',
        'New Zealand Daylight Time': 'NZDT',
        'Indochina Time': 'ICT',
        'Western Indonesia Time': 'WIB',
        'Philippine Standard Time': 'PHT',
        'Taiwan Standard Time': 'TST',
        'Central Daylight Time': 'CDT',
        'Central Standard Time': 'CST',
        'Eastern Daylight Time': 'EDT',
        'Eastern Standard Time': 'EST',
        'Pacific Daylight Time': 'PDT',
        'Pacific Standard Time': 'PST',
        'Mountain Daylight Time': 'MDT',
        'Mountain Standard Time': 'MST',
        'Alaska Daylight Time': 'AKDT',
        'Alaska Standard Time': 'AKST',
        'Hawaii-Aleutian Standard Time': 'HST',
        'Hawaii Standard Time': 'HST',
        'Coordinated Universal Time': 'UTC',
        'East Africa Time': 'EAT',
        'West Africa Time': 'WAT',
        'South Africa Standard Time': 'SAST',
        'Türkiye Standard Time': 'TRT',
        'Turkey Standard Time': 'TRT',
        'Colombia Standard Time': 'COT',
        'Peru Standard Time': 'PET',
        'Sri Lanka Standard Time': 'SLST'
    };

    var ZONES = [
        { tz: 'UTC', city: 'UTC', country: 'Universal', region: 'UTC', aliases: ['UTC', 'GMT', 'Z', 'Zulu'] },
        { tz: 'Asia/Kolkata', city: 'Kolkata', country: 'India', region: 'India & South Asia', aliases: ['IST', 'India', 'India Standard Time', 'Mumbai', 'Bombay', 'Delhi', 'New Delhi', 'Bangalore', 'Bengaluru', 'Hyderabad', 'Chennai', 'Madras', 'Pune', 'Ahmedabad', 'Jaipur', 'Kolkata', 'Calcutta'] },
        { tz: 'Asia/Karachi', city: 'Karachi', country: 'Pakistan', region: 'India & South Asia', aliases: ['PKT', 'Pakistan', 'Lahore', 'Islamabad'] },
        { tz: 'Asia/Dhaka', city: 'Dhaka', country: 'Bangladesh', region: 'India & South Asia', aliases: ['BDT', 'Bangladesh'] },
        { tz: 'Asia/Kathmandu', city: 'Kathmandu', country: 'Nepal', region: 'India & South Asia', aliases: ['NPT', 'Nepal'] },
        { tz: 'Asia/Colombo', city: 'Colombo', country: 'Sri Lanka', region: 'India & South Asia', aliases: ['SLST', 'Sri Lanka'], forceAbbr: 'SLST', forceLong: 'Sri Lanka Standard Time' },
        { tz: 'America/Chicago', city: 'Chicago', country: 'United States', region: 'Americas', aliases: ['CDT', 'CST', 'CT', 'Central', 'Chicago', 'Dallas', 'Houston', 'Austin', 'Texas'] },
        { tz: 'America/New_York', city: 'New York', country: 'United States', region: 'Americas', aliases: ['EST', 'EDT', 'ET', 'Eastern', 'NYC', 'Boston', 'Miami', 'Atlanta', 'New York'] },
        { tz: 'America/Denver', city: 'Denver', country: 'United States', region: 'Americas', aliases: ['MST', 'MDT', 'MT', 'Mountain', 'Denver', 'Salt Lake City'] },
        { tz: 'America/Phoenix', city: 'Phoenix', country: 'United States', region: 'Americas', aliases: ['Arizona', 'Phoenix', 'MST'] },
        { tz: 'America/Los_Angeles', city: 'Los Angeles', country: 'United States', region: 'Americas', aliases: ['PST', 'PDT', 'PT', 'Pacific', 'San Francisco', 'Seattle', 'Los Angeles', 'LA'] },
        { tz: 'America/Anchorage', city: 'Anchorage', country: 'United States', region: 'Americas', aliases: ['AKST', 'AKDT', 'Alaska'] },
        { tz: 'Pacific/Honolulu', city: 'Honolulu', country: 'United States', region: 'Americas', aliases: ['HST', 'Hawaii'] },
        { tz: 'America/Toronto', city: 'Toronto', country: 'Canada', region: 'Americas', aliases: ['Toronto', 'Ottawa', 'Montreal'] },
        { tz: 'America/Vancouver', city: 'Vancouver', country: 'Canada', region: 'Americas', aliases: ['Vancouver'] },
        { tz: 'America/Mexico_City', city: 'Mexico City', country: 'Mexico', region: 'Americas', aliases: ['Mexico', 'Mexico City', 'CST'] },
        { tz: 'America/Bogota', city: 'Bogota', country: 'Colombia', region: 'Americas', aliases: ['COT', 'Colombia', 'Bogota'] },
        { tz: 'America/Lima', city: 'Lima', country: 'Peru', region: 'Americas', aliases: ['PET', 'Peru', 'Lima'] },
        { tz: 'America/Sao_Paulo', city: 'Sao Paulo', country: 'Brazil', region: 'Americas', aliases: ['BRT', 'Brazil', 'Sao Paulo'] },
        { tz: 'America/Argentina/Buenos_Aires', city: 'Buenos Aires', country: 'Argentina', region: 'Americas', aliases: ['ART', 'Argentina', 'Buenos Aires'] },
        { tz: 'Europe/London', city: 'London', country: 'United Kingdom', region: 'Europe', aliases: ['BST', 'GMT', 'London', 'UK', 'Britain', 'England'] },
        { tz: 'Europe/Dublin', city: 'Dublin', country: 'Ireland', region: 'Europe', aliases: ['IST', 'Dublin', 'Ireland', 'Irish'] },
        { tz: 'Europe/Paris', city: 'Paris', country: 'France', region: 'Europe', aliases: ['Paris', 'France'] },
        { tz: 'Europe/Berlin', city: 'Berlin', country: 'Germany', region: 'Europe', aliases: ['CET', 'CEST', 'Berlin', 'Germany', 'Frankfurt'] },
        { tz: 'Europe/Amsterdam', city: 'Amsterdam', country: 'Netherlands', region: 'Europe', aliases: ['Amsterdam', 'Netherlands'] },
        { tz: 'Europe/Madrid', city: 'Madrid', country: 'Spain', region: 'Europe', aliases: ['Madrid', 'Spain'] },
        { tz: 'Europe/Rome', city: 'Rome', country: 'Italy', region: 'Europe', aliases: ['Rome', 'Italy'] },
        { tz: 'Europe/Zurich', city: 'Zurich', country: 'Switzerland', region: 'Europe', aliases: ['Zurich', 'Switzerland'] },
        { tz: 'Europe/Stockholm', city: 'Stockholm', country: 'Sweden', region: 'Europe', aliases: ['Stockholm', 'Sweden'] },
        { tz: 'Europe/Warsaw', city: 'Warsaw', country: 'Poland', region: 'Europe', aliases: ['Warsaw', 'Poland'] },
        { tz: 'Europe/Athens', city: 'Athens', country: 'Greece', region: 'Europe', aliases: ['Athens', 'Greece', 'EEST', 'EET'] },
        { tz: 'Europe/Istanbul', city: 'Istanbul', country: 'Türkiye', region: 'Europe', aliases: ['TRT', 'Istanbul', 'Turkey', 'Türkiye'] },
        { tz: 'Europe/Moscow', city: 'Moscow', country: 'Russia', region: 'Europe', aliases: ['MSK', 'Moscow', 'Russia'] },
        { tz: 'Asia/Dubai', city: 'Dubai', country: 'United Arab Emirates', region: 'Middle East', aliases: ['GST', 'Dubai', 'UAE', 'Abu Dhabi'] },
        { tz: 'Asia/Riyadh', city: 'Riyadh', country: 'Saudi Arabia', region: 'Middle East', aliases: ['AST', 'Riyadh', 'Saudi'] },
        { tz: 'Asia/Qatar', city: 'Doha', country: 'Qatar', region: 'Middle East', aliases: ['Qatar', 'Doha'] },
        { tz: 'Asia/Jerusalem', city: 'Jerusalem', country: 'Israel', region: 'Middle East', aliases: ['IST', 'IDT', 'Israel', 'Jerusalem', 'Tel Aviv'] },
        { tz: 'Asia/Singapore', city: 'Singapore', country: 'Singapore', region: 'Asia Pacific', aliases: ['SGT', 'Singapore'] },
        { tz: 'Asia/Hong_Kong', city: 'Hong Kong', country: 'Hong Kong', region: 'Asia Pacific', aliases: ['HKT', 'Hong Kong'] },
        { tz: 'Asia/Shanghai', city: 'Shanghai', country: 'China', region: 'Asia Pacific', aliases: ['CST', 'China', 'Beijing', 'Shanghai'] },
        { tz: 'Asia/Taipei', city: 'Taipei', country: 'Taiwan', region: 'Asia Pacific', aliases: ['Taipei', 'Taiwan'] },
        { tz: 'Asia/Tokyo', city: 'Tokyo', country: 'Japan', region: 'Asia Pacific', aliases: ['JST', 'Tokyo', 'Japan'] },
        { tz: 'Asia/Seoul', city: 'Seoul', country: 'South Korea', region: 'Asia Pacific', aliases: ['KST', 'Seoul', 'Korea'] },
        { tz: 'Asia/Bangkok', city: 'Bangkok', country: 'Thailand', region: 'Asia Pacific', aliases: ['ICT', 'Bangkok', 'Thailand'] },
        { tz: 'Asia/Jakarta', city: 'Jakarta', country: 'Indonesia', region: 'Asia Pacific', aliases: ['WIB', 'Jakarta', 'Indonesia'] },
        { tz: 'Asia/Manila', city: 'Manila', country: 'Philippines', region: 'Asia Pacific', aliases: ['PHT', 'Manila', 'Philippines'] },
        { tz: 'Australia/Sydney', city: 'Sydney', country: 'Australia', region: 'Asia Pacific', aliases: ['AEST', 'AEDT', 'Sydney', 'Australia'] },
        { tz: 'Australia/Melbourne', city: 'Melbourne', country: 'Australia', region: 'Asia Pacific', aliases: ['Melbourne'] },
        { tz: 'Australia/Perth', city: 'Perth', country: 'Australia', region: 'Asia Pacific', aliases: ['AWST', 'Perth'] },
        { tz: 'Pacific/Auckland', city: 'Auckland', country: 'New Zealand', region: 'Asia Pacific', aliases: ['NZST', 'NZDT', 'Auckland', 'New Zealand'] },
        { tz: 'Africa/Cairo', city: 'Cairo', country: 'Egypt', region: 'Africa', aliases: ['Cairo', 'Egypt'] },
        { tz: 'Africa/Johannesburg', city: 'Johannesburg', country: 'South Africa', region: 'Africa', aliases: ['SAST', 'Johannesburg', 'South Africa'] },
        { tz: 'Africa/Lagos', city: 'Lagos', country: 'Nigeria', region: 'Africa', aliases: ['WAT', 'Lagos', 'Nigeria'] },
        { tz: 'Africa/Nairobi', city: 'Nairobi', country: 'Kenya', region: 'Africa', aliases: ['EAT', 'Nairobi', 'Kenya'] }
    ];

    var BOOST = {
        ist: 'Asia/Kolkata',
        cst: 'America/Chicago',
        cdt: 'America/Chicago',
        ct: 'America/Chicago',
        central: 'America/Chicago',
        est: 'America/New_York',
        edt: 'America/New_York',
        et: 'America/New_York',
        eastern: 'America/New_York',
        pst: 'America/Los_Angeles',
        pdt: 'America/Los_Angeles',
        pt: 'America/Los_Angeles',
        pacific: 'America/Los_Angeles',
        mst: 'America/Denver',
        mdt: 'America/Denver',
        mt: 'America/Denver',
        mountain: 'America/Denver',
        bst: 'Europe/London',
        gmt: 'Europe/London',
        utc: 'UTC',
        cet: 'Europe/Berlin',
        cest: 'Europe/Berlin',
        jst: 'Asia/Tokyo',
        sgt: 'Asia/Singapore',
        aest: 'Australia/Sydney',
        aedt: 'Australia/Sydney'
    };

    var CHIPS = [
        { tz: 'America/Chicago', label: 'Chicago' },
        { tz: 'Europe/London', label: 'London' },
        { tz: 'America/New_York', label: 'New York' },
        { tz: 'America/Los_Angeles', label: 'Los Angeles' },
        { tz: 'Asia/Singapore', label: 'Singapore' },
        { tz: 'Asia/Tokyo', label: 'Tokyo' },
        { tz: 'Australia/Sydney', label: 'Sydney' },
        { tz: 'Asia/Dubai', label: 'Dubai' },
        { tz: 'UTC', label: 'UTC' }
    ];

    var state = {
        zones: [],
        view: null,
        live: true,
        liveKey: '',
        matches: [],
        hi: 0,
        scroll: true,
        hourKey: ''
    };

    var fromSel, toSel, dateInput, timeInput, searchInput;

    function $(id) { return document.getElementById(id); }

    function pad(n) { return String(n).padStart(2, '0'); }

    function esc(str) {
        if (typeof escapeHtml === 'function') return escapeHtml(str);
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function toast(msg) {
        var el = $('toolsToast');
        if (!el) return;
        el.textContent = msg || 'Copied';
        el.classList.add('show');
        setTimeout(function () { el.classList.remove('show'); }, 1800);
    }

    function copyText(text, msg) {
        function done() { toast(msg || 'Copied'); }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
        } else {
            fallbackCopy(text, done);
        }
    }

    function fallbackCopy(text, done) {
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { toast('Copy failed'); }
        ta.remove();
    }

    function validTz(tz) {
        try {
            Intl.DateTimeFormat('en-US', { timeZone: tz });
            return true;
        } catch (e) {
            return false;
        }
    }

    function zoneByTz(tz) {
        for (var i = 0; i < ZONES.length; i++) {
            if (ZONES[i].tz === tz) return ZONES[i];
        }
        return null;
    }

    function synthetic(tz) {
        var city = tz.split('/').pop().replace(/_/g, ' ');
        return { tz: tz, city: city, country: '', region: 'Other', aliases: [] };
    }

    function canonicalTz(input) {
        var raw = String(input || '').trim();
        if (!raw) return '';
        var known = ZONES.find(function (z) { return z.tz.toLowerCase() === raw.toLowerCase(); });
        if (known) return known.tz;
        if (validTz(raw)) return raw;
        if (raw.indexOf('/') === -1) return '';
        var canon = raw.split('/').map(function (part) {
            return part.split('_').map(function (w) {
                return w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w;
            }).join('_');
        }).join('/');
        return validTz(canon) ? canon : '';
    }

    function zonedFields(date, tz) {
        var dtf = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            hourCycle: 'h23',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        var map = {};
        dtf.formatToParts(date).forEach(function (p) { map[p.type] = p.value; });
        var h = parseInt(map.hour, 10);
        if (h === 24) h = 0;
        return {
            y: parseInt(map.year, 10),
            m: parseInt(map.month, 10),
            d: parseInt(map.day, 10),
            h: h,
            min: parseInt(map.minute, 10),
            sec: parseInt(map.second, 10)
        };
    }

    function getOffsetMinutes(tz, date) {
        var f = zonedFields(date, tz);
        var asUTC = Date.UTC(f.y, f.m - 1, f.d, f.h, f.min, f.sec);
        return Math.round((asUTC - date.getTime()) / 60000);
    }

    function zonedToUtc(y, m, d, h, min, tz) {
        var guess = Date.UTC(y, m - 1, d, h, min, 0);
        var o1 = getOffsetMinutes(tz, new Date(guess));
        var utc = guess - o1 * 60000;
        var o2 = getOffsetMinutes(tz, new Date(utc));
        if (o2 !== o1) utc = guess - o2 * 60000;
        return new Date(utc);
    }

    function resolvesCleanly(y, m, d, h, min, tz) {
        var utc = zonedToUtc(y, m, d, h, min, tz);
        var f = zonedFields(utc, tz);
        return f.y === y && f.m === m && f.d === d && f.h === h && f.min === min;
    }

    function isOffsetName(raw) {
        return /^GMT[+-]/.test(raw) || /^UTC[+-]/.test(raw);
    }

    function intlName(tz, date, length) {
        try {
            var dtf = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: length });
            var part = dtf.formatToParts(date).find(function (p) { return p.type === 'timeZoneName'; });
            return part ? part.value : '';
        } catch (e) {
            return '';
        }
    }

    function shortName(tz, date) {
        var z = zoneByTz(tz);
        if (z && z.forceAbbr) return z.forceAbbr;
        if (tz === 'UTC') return 'UTC';
        var raw = intlName(tz, date, 'short');
        if (raw && !isOffsetName(raw)) return raw;
        var long = intlName(tz, date, 'long');
        if (LONG_TO_ABBR[long]) return LONG_TO_ABBR[long];
        if (z) {
            var letter = z.aliases.find(function (a) { return /^[A-Z]{2,5}$/.test(a); });
            if (letter) return letter;
        }
        return raw || tz;
    }

    function longName(tz, date) {
        var z = zoneByTz(tz);
        if (z && z.forceLong) return z.forceLong;
        return intlName(tz, date, 'long') || tz;
    }

    function abbrPair(tz, date) {
        var nowAbbr = shortName(tz, date);
        var y = zonedFields(date, tz).y;
        var jan = shortName(tz, new Date(Date.UTC(y, 0, 15, 18)));
        var jul = shortName(tz, new Date(Date.UTC(y, 6, 15, 18)));
        var other = jan !== nowAbbr ? jan : (jul !== nowAbbr ? jul : '');
        return { now: nowAbbr, other: other };
    }

    function zoneClockInfo(tz, date) {
        var abbr = shortName(tz, date);
        var long = longName(tz, date);
        var offset = getOffsetMinutes(tz, date);
        var y = zonedFields(date, tz).y;
        var janDate = new Date(Date.UTC(y, 0, 15, 18));
        var julDate = new Date(Date.UTC(y, 6, 15, 18));
        var janOff = getOffsetMinutes(tz, janDate);
        var julOff = getOffsetMinutes(tz, julDate);
        var observes = janOff !== julOff;
        var standardOff = Math.min(janOff, julOff);
        var daylightOff = Math.max(janOff, julOff);
        var stdDate = janOff === standardOff ? janDate : julDate;
        return {
            abbr: abbr,
            long: long,
            offset: offset,
            onDst: observes && offset === daylightOff && offset !== standardOff,
            stdAbbr: observes ? shortName(tz, stdDate) : abbr
        };
    }

    function cleanSpaces(s) {
        return String(s).replace(/[\u202f\u00a0]/g, ' ');
    }

    function formatClock(date, tz) {
        return cleanSpaces(new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).format(date));
    }

    function formatDay(date, tz) {
        return cleanSpaces(new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        }).format(date));
    }

    function formatCompact(date, tz) {
        var dtf = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        var map = {};
        dtf.formatToParts(date).forEach(function (p) {
            if (p.type !== 'literal') map[p.type] = p.value;
        });
        var ap = (map.dayPeriod || 'AM').charAt(0).toLowerCase();
        return parseInt(map.hour, 10) + ':' + map.minute + ap;
    }

    function hourParts(date, tz) {
        var dtf = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        var map = {};
        dtf.formatToParts(date).forEach(function (p) {
            if (p.type !== 'literal') map[p.type] = p.value;
        });
        var f = zonedFields(date, tz);
        return {
            hour12: parseInt(map.hour, 10),
            min: parseInt(map.minute, 10),
            ap: (map.dayPeriod || 'AM').charAt(0).toLowerCase(),
            h24: f.h
        };
    }

    function pillText(date, tz) {
        var dtf = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        var map = {};
        dtf.formatToParts(date).forEach(function (p) { map[p.type] = p.value; });
        return (map.weekday + ' ' + map.month + ' ' + map.day).toUpperCase();
    }

    function formatDuration(min) {
        var abs = Math.abs(min);
        var h = Math.floor(abs / 60);
        var m = abs % 60;
        var bits = [];
        if (h) bits.push(h + (h === 1 ? ' hour' : ' hours'));
        if (m) bits.push(m + (m === 1 ? ' minute' : ' minutes'));
        return bits.join(' ') || '0 minutes';
    }

    function formatShortDelta(min) {
        var sign = min > 0 ? '+' : min < 0 ? '−' : '';
        var abs = Math.abs(min);
        var h = Math.floor(abs / 60);
        var m = abs % 60;
        if (!h && !m) return '0h';
        if (!m) return sign + h + 'h';
        if (!h) return sign + m + 'm';
        return sign + h + 'h ' + m + 'm';
    }

    function formatDelta(min) {
        var sign = min > 0 ? '+' : min < 0 ? '-' : '';
        var abs = Math.abs(min);
        var h = Math.floor(abs / 60);
        var m = abs % 60;
        if (m === 0) return sign + String(h);
        if (m === 30) return sign + String(h + 0.5);
        return sign + h + ':' + pad(m);
    }

    function formatUtcOffset(min) {
        var sign = min >= 0 ? '+' : '−';
        var abs = Math.abs(min);
        var h = Math.floor(abs / 60);
        var m = abs % 60;
        return m ? 'UTC' + sign + h + ':' + pad(m) : 'UTC' + sign + h;
    }

    function ymdStr(ymd) {
        return ymd.y + '-' + pad(ymd.m) + '-' + pad(ymd.d);
    }

    function sameYmd(a, b) {
        return a && b && a.y === b.y && a.m === b.m && a.d === b.d;
    }

    function addDays(ymd, n) {
        var dt = new Date(Date.UTC(ymd.y, ymd.m - 1, ymd.d + n));
        return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
    }

    function todayYmd() {
        var f = zonedFields(new Date(), HOME);
        return { y: f.y, m: f.m, d: f.d };
    }

    function homeMidnight(ymd) {
        return zonedToUtc(ymd.y, ymd.m, ymd.d, 0, 0, HOME);
    }

    function placeLine(meta) {
        if (!meta) return '';
        if (meta.tz === 'UTC') return 'Coordinated Universal Time';
        if (meta.city && meta.country && meta.city !== meta.country) return meta.city + ', ' + meta.country;
        return meta.country || meta.city || meta.tz;
    }

    function metaFor(tz) {
        return zoneByTz(tz) || synthetic(tz);
    }

    function defaultZones() {
        return [
            { tz: HOME, addedAs: '' },
            { tz: 'America/Chicago', addedAs: '' },
            { tz: 'Europe/London', addedAs: '' }
        ];
    }

    function normalize(items) {
        var out = [];
        var seen = {};
        [{ tz: HOME, addedAs: '' }].concat(items).forEach(function (item) {
            var tz = item && item.tz;
            if (!tz || seen[tz] || !validTz(tz)) return;
            seen[tz] = true;
            out.push({ tz: tz, addedAs: item.addedAs || '' });
        });
        return out;
    }

    function readHashZones() {
        var raw = location.hash.replace(/^#/, '');
        if (raw.split('&')[0] !== 'timezone') return null;
        var params = new URLSearchParams(raw.split('&').slice(1).join('&'));
        var z = params.get('zones');
        if (!z) return null;
        return z.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    }

    function loadZones() {
        var hashZones = readHashZones();
        if (hashZones) {
            var valid = hashZones.filter(validTz);
            if (valid.length) {
                return {
                    zones: normalize(valid.map(function (tz) { return { tz: tz, addedAs: '' }; })),
                    fromHash: true
                };
            }
        }
        try {
            var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
            if (Array.isArray(saved) && saved.length) {
                var zones = normalize(saved.map(function (item) {
                    if (typeof item === 'string') return { tz: item, addedAs: '' };
                    return { tz: item.tz, addedAs: item.addedAs || '' };
                }));
                if (zones.length) return { zones: zones, fromHash: false };
            }
        } catch (e) { /* ignore broken storage */ }
        return { zones: defaultZones(), fromHash: false };
    }

    function shareUrl() {
        var zones = state.zones.map(function (z) { return z.tz; }).join(',');
        return location.origin + location.pathname + location.search + '#timezone&zones=' + encodeURIComponent(zones);
    }

    function syncTimeConverterHash() {
        if (!history.replaceState || !state.zones.length) return;
        history.replaceState(null, '', '#timezone&zones=' + encodeURIComponent(state.zones.map(function (z) { return z.tz; }).join(',')));
    }

    function persist() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.zones)); } catch (e) { /* private mode */ }
        var panel = document.querySelector('[data-tool-panel="timezone"]');
        if (panel && panel.classList.contains('active')) syncTimeConverterHash();
    }

    function scoreZone(z, s) {
        var city = z.city.toLowerCase();
        var country = (z.country || '').toLowerCase();
        var tz = z.tz.toLowerCase();
        var aliases = z.aliases.map(function (a) { return a.toLowerCase(); });
        if (tz === s || city === s || aliases.indexOf(s) !== -1) return 100;
        if (country === s) return 90;
        if (city.indexOf(s) === 0 || aliases.some(function (a) { return a.indexOf(s) === 0; })) return 80;
        if (tz.indexOf(s) === 0 || country.indexOf(s) === 0) return 70;
        if (city.indexOf(s) !== -1 || country.indexOf(s) !== -1 || tz.indexOf(s) !== -1 || aliases.some(function (a) { return a.indexOf(s) !== -1; })) return 50;
        return 0;
    }

    function searchZones(query) {
        var raw = String(query || '').trim();
        var s = raw.toLowerCase();
        if (!s) return [];
        if (s.length < 2 && !ZONES.some(function (z) { return z.aliases.some(function (a) { return a.toLowerCase() === s; }); })) {
            return [];
        }
        var ranked = ZONES.map(function (z) { return { zone: z, score: scoreZone(z, s) }; })
            .filter(function (x) { return x.score > 0; })
            .sort(function (a, b) {
                if (b.score !== a.score) return b.score - a.score;
                return a.zone.city.localeCompare(b.zone.city);
            });
        var canon = canonicalTz(raw);
        if (canon && canon.indexOf('/') !== -1 && !ranked.some(function (x) { return x.zone.tz === canon; })) {
            ranked.unshift({ zone: synthetic(canon), score: 100 });
        }
        var preferred = BOOST[s];
        if (preferred && ranked.length) {
            var max = ranked[0].score;
            var idx = -1;
            for (var i = 0; i < ranked.length; i++) {
                if (ranked[i].zone.tz === preferred && ranked[i].score === max) idx = i;
            }
            if (idx > 0) ranked.unshift(ranked.splice(idx, 1)[0]);
        }
        return ranked.slice(0, 6).map(function (x) { return x.zone; });
    }

    function addedAsFromQuery(q) {
        var s = String(q || '').trim();
        if (!/^[A-Za-z]{2,5}$/.test(s)) return '';
        return s.toUpperCase();
    }

    function optionLabel(z) {
        var pair = abbrPair(z.tz, new Date());
        var abbr = pair.other ? pair.now + '/' + pair.other : pair.now;
        return z.city + ' (' + abbr + ')' + (z.country ? ' — ' + z.country : '');
    }

    function fillSelect(sel) {
        var regions = [];
        ZONES.forEach(function (z) {
            if (regions.indexOf(z.region) === -1) regions.push(z.region);
        });
        sel.innerHTML = '';
        regions.forEach(function (region) {
            var group = document.createElement('optgroup');
            group.label = region;
            ZONES.filter(function (z) { return z.region === region; }).forEach(function (z) {
                var opt = document.createElement('option');
                opt.value = z.tz;
                opt.textContent = optionLabel(z);
                group.appendChild(opt);
            });
            sel.appendChild(group);
        });
    }

    function ensureOption(tz) {
        [fromSel, toSel].forEach(function (sel) {
            if (!sel) return;
            for (var i = 0; i < sel.options.length; i++) {
                if (sel.options[i].value === tz) return;
            }
            var opt = document.createElement('option');
            opt.value = tz;
            opt.textContent = tz;
            sel.appendChild(opt);
        });
    }

    function writeInputs(instant, tz) {
        var f = zonedFields(instant, tz);
        dateInput.value = ymdStr(f);
        timeInput.value = pad(f.h) + ':' + pad(f.min);
    }

    function liveKey() {
        var f = zonedFields(new Date(), fromSel.value || 'America/Chicago');
        return (fromSel.value || '') + f.y + f.m + f.d + f.h + f.min;
    }

    function setInputsToNow() {
        writeInputs(new Date(), fromSel.value);
        state.liveKey = liveKey();
    }

    function readParts() {
        if (!dateInput.value) return null;
        var bits = dateInput.value.split('-').map(Number);
        var hm = (timeInput.value || '00:00').split(':').map(Number);
        if (!bits[0] || !bits[1] || !bits[2] || isNaN(hm[0]) || isNaN(hm[1])) return null;
        return { y: bits[0], m: bits[1], d: bits[2], h: hm[0], min: hm[1] };
    }

    function readFromInstant() {
        var p = readParts();
        if (!p) return null;
        return zonedToUtc(p.y, p.m, p.d, p.h, p.min, fromSel.value);
    }

    function rangeLabel(start, end, tz) {
        var a = zonedFields(start, tz);
        var b = zonedFields(end, tz);
        var next = a.y !== b.y || a.m !== b.m || a.d !== b.d;
        return formatClock(start, tz) + ' – ' + formatClock(end, tz) + (next ? ' next day' : '');
    }

    function dayShift(fromF, toF) {
        var a = Date.UTC(fromF.y, fromF.m - 1, fromF.d);
        var b = Date.UTC(toF.y, toF.m - 1, toF.d);
        var days = Math.round((b - a) / 86400000);
        if (days === 0) return 'Same calendar day';
        if (days === 1) return 'Next calendar day';
        if (days === -1) return 'Previous calendar day';
        if (days > 1) return days + ' days later';
        return Math.abs(days) + ' days earlier';
    }

    function updateLiveButton() {
        var btn = $('tcLive');
        if (!btn) return;
        btn.classList.toggle('is-on', state.live);
        btn.textContent = state.live ? 'Live' : 'Paused';
        btn.setAttribute('aria-pressed', state.live ? 'true' : 'false');
    }

    function renderConverter() {
        var box = $('tcResult');
        var work = $('tcWork');
        if (!box || !work) return;
        var instant = readFromInstant();
        var parts = readParts();
        if (!instant || !parts) {
            box.innerHTML = '';
            work.innerHTML = '';
            return;
        }
        var fromTz = fromSel.value;
        var toTz = toSel.value;
        var fromInfo = zoneClockInfo(fromTz, instant);
        var toInfo = zoneClockInfo(toTz, instant);
        var diff = toInfo.offset - fromInfo.offset;
        var sentence = diff === 0
            ? fromInfo.abbr + ' and ' + toInfo.abbr + ' are the same time.'
            : toInfo.abbr + ' is ' + formatDuration(diff) + ' ' + (diff > 0 ? 'ahead of' : 'behind') + ' ' + fromInfo.abbr + ' at this time.';
        var shift = dayShift(zonedFields(instant, fromTz), zonedFields(instant, toTz));
        var gap = resolvesCleanly(parts.y, parts.m, parts.d, parts.h, parts.min, fromTz)
            ? ''
            : '<p class="tc-gap">This clock time falls in a daylight-saving gap or overlap, so the result uses the resolved instant.</p>';
        var dstBits = [];
        [fromInfo, toInfo].forEach(function (info) {
            if (info.onDst && info.stdAbbr && info.stdAbbr !== info.abbr) {
                dstBits.push(info.abbr + ' is daylight time. Standard time for this zone is ' + info.stdAbbr + '.');
            }
        });
        var homeDay = zonedFields(instant, HOME);
        var onView = sameYmd(homeDay, state.view);
        var showBtn = onView ? '' : '<button type="button" class="tc-textbtn" data-show-day="' + ymdStr(homeDay) + '">Show this time on the timeline</button>';

        box.innerHTML =
            '<div class="tc-eq">' +
                '<div><div class="tc-eq-time">' + esc(formatClock(instant, fromTz)) + '</div>' +
                '<div class="tc-eq-sub">' + esc(fromInfo.abbr + ' · ' + formatDay(instant, fromTz)) + '</div>' +
                '<div class="tc-eq-long">' + esc(fromInfo.long + ' · ' + formatUtcOffset(fromInfo.offset)) + '</div></div>' +
                '<div class="tc-eq-mid"><div class="tc-eq-arrow">→</div><div class="tc-eq-delta">' + esc(formatShortDelta(diff)) + '</div></div>' +
                '<div><div class="tc-eq-time">' + esc(formatClock(instant, toTz)) + '</div>' +
                '<div class="tc-eq-sub">' + esc(toInfo.abbr + ' · ' + formatDay(instant, toTz)) + '</div>' +
                '<div class="tc-eq-long">' + esc(toInfo.long + ' · ' + formatUtcOffset(toInfo.offset)) + '</div></div>' +
            '</div>' +
            '<p class="tc-sentence">' + esc(sentence + ' ' + shift + '.') + '</p>' +
            (dstBits.length ? '<p class="tc-dst">' + esc(dstBits.join(' ')) + '</p>' : '') +
            gap + showBtn;

        var fromYmd = zonedFields(instant, fromTz);
        var toYmd = zonedFields(instant, toTz);
        var fromWork = {
            start: zonedToUtc(fromYmd.y, fromYmd.m, fromYmd.d, 9, 0, fromTz),
            end: zonedToUtc(fromYmd.y, fromYmd.m, fromYmd.d, 18, 0, fromTz)
        };
        var toWork = {
            start: zonedToUtc(toYmd.y, toYmd.m, toYmd.d, 9, 0, toTz),
            end: zonedToUtc(toYmd.y, toYmd.m, toYmd.d, 18, 0, toTz)
        };
        var start = Math.max(fromWork.start.getTime(), toWork.start.getTime());
        var end = Math.min(fromWork.end.getTime(), toWork.end.getTime());
        var overlap = end > start ? { start: new Date(start), end: new Date(end) } : null;
        var line1 = 'A 9:00 AM – 6:00 PM ' + fromInfo.abbr + ' workday is ' + rangeLabel(fromWork.start, fromWork.end, toTz) + ' ' + toInfo.abbr + '.';
        var line2 = 'A 9:00 AM – 6:00 PM ' + toInfo.abbr + ' workday is ' + rangeLabel(toWork.start, toWork.end, fromTz) + ' ' + fromInfo.abbr + '.';
        var line3 = overlap
            ? 'Shared 9:00–18:00 window: ' + rangeLabel(overlap.start, overlap.end, toTz) + ' ' + toInfo.abbr + ' (' + formatDuration(Math.round((end - start) / 60000)) + ').'
            : 'No shared 9:00–18:00 window on these calendar days.';
        work.innerHTML = '<p>' + esc(line1) + '</p><p>' + esc(line2) + '</p><p>' + esc(line3) + '</p>';
    }

    function conversionSummary() {
        var instant = readFromInstant();
        if (!instant) return '';
        var fromTz = fromSel.value;
        var toTz = toSel.value;
        var fromInfo = zoneClockInfo(fromTz, instant);
        var toInfo = zoneClockInfo(toTz, instant);
        var diff = toInfo.offset - fromInfo.offset;
        var rel = diff === 0 ? 'same time' : (toInfo.abbr + ' is ' + formatDuration(diff) + ' ' + (diff > 0 ? 'ahead of' : 'behind') + ' ' + fromInfo.abbr);
        return formatClock(instant, fromTz) + ' ' + fromInfo.abbr + ' (' + formatDay(instant, fromTz) + ') = ' +
            formatClock(instant, toTz) + ' ' + toInfo.abbr + ' (' + formatDay(instant, toTz) + '). ' + rel + '.';
    }

    function renderDates() {
        var today = todayYmd();
        var note = $('tcViewNote');
        if (note) note.hidden = sameYmd(state.view, today);
        var input = $('tcViewDate');
        if (input) input.value = ymdStr(state.view);
        var todayBtn = $('tcToday');
        if (todayBtn) todayBtn.hidden = sameYmd(state.view, today);
        var start = addDays(state.view, -1);
        var prev = null;
        var html = '';
        for (var i = 0; i < 7; i++) {
            var ymd = addDays(start, i);
            var active = sameYmd(ymd, state.view);
            var boundary = !prev || prev.m !== ymd.m || ymd.d === 1;
            var label = (active || boundary) ? MONTHS[ymd.m - 1] + ' ' + ymd.d : String(ymd.d);
            html += '<button type="button" class="tc-day' + (active ? ' is-active' : '') + '" data-ymd="' + ymdStr(ymd) + '">' + label + '</button>';
            prev = ymd;
        }
        $('tcDates').innerHTML = html;
    }

    function renderChips() {
        $('tcChips').innerHTML = CHIPS.map(function (c) {
            var on = state.zones.some(function (z) { return z.tz === c.tz; });
            return '<button type="button" class="tc-chip' + (on ? ' is-on' : '') + '" data-chip="' + esc(c.tz) + '">' + esc(c.label) + '</button>';
        }).join('');
    }

    function cellHtml(instant, prevInstant, tz, nowMs) {
        var cur = zonedFields(instant, tz);
        var prev = zonedFields(prevInstant, tz);
        var hm = hourParts(instant, tz);
        var newDay = cur.y !== prev.y || cur.m !== prev.m || cur.d !== prev.d;
        var isNow = nowMs >= instant.getTime() && nowMs < instant.getTime() + 3600000;
        var cls = 'tc-cell ' + (hm.h24 >= 7 && hm.h24 < 19 ? 'is-day' : 'is-night') +
            (hm.h24 >= 9 && hm.h24 < 18 ? ' is-work' : '') +
            (isNow ? ' is-now' : '') +
            (newDay ? ' has-pill' : '');
        var top = newDay
            ? '<div class="tc-pill">' + esc(pillText(instant, tz)) + '</div>'
            : '<div class="tc-h">' + hm.hour12 + '</div>' + (hm.min ? '<div class="tc-m">' + pad(hm.min) + '</div>' : '');
        return '<div class="' + cls + '">' + top + '<div class="tc-ap">' + hm.ap + '</div></div>';
    }

    function renderRows() {
        var now = new Date();
        var nowMs = now.getTime();
        var start = homeMidnight(state.view);
        var html = state.zones.map(function (zone) {
            var tz = zone.tz;
            var meta = metaFor(tz);
            var info = zoneClockInfo(tz, now);
            var pair = abbrPair(tz, now);
            var off = getOffsetMinutes(tz, now) - getOffsetMinutes(HOME, now);
            var phrase = off === 0 ? 'Same time as IST' : formatDuration(off) + ' ' + (off > 0 ? 'ahead of' : 'behind') + ' IST';
            var offsetHtml = tz === HOME
                ? '<div class="tc-offset tc-home" title="Home timezone"><i class="fas fa-house"></i></div>'
                : '<div class="tc-offset" title="' + esc(phrase) + '">' + esc(formatDelta(off)) + '</div>';
            var fix = (zone.addedAs && zone.addedAs.toUpperCase() !== pair.now.toUpperCase())
                ? '<div class="tc-fix"><i class="fas fa-check"></i> Corrected from ' + esc(zone.addedAs.toUpperCase()) + '</div>'
                : '';
            var remove = tz === HOME ? '' : '<button type="button" class="tc-remove" data-remove="' + esc(tz) + '">Remove</button>';
            var istLine = tz === HOME ? 'Home' : '→ ' + formatCompact(now, HOME) + ' IST';
            var cells = '';
            for (var i = 0; i < 24; i++) {
                var instant = new Date(start.getTime() + i * 3600000);
                var prev = new Date(instant.getTime() - 3600000);
                cells += cellHtml(instant, prev, tz, nowMs);
            }
            return '<article class="tc-row" data-tz="' + esc(tz) + '">' +
                '<div class="tc-meta">' + offsetHtml +
                    '<div class="tc-ident"><div class="tc-abbr"><strong>' + esc(pair.now) + '</strong>' +
                    (pair.other ? '<span> / ' + esc(pair.other) + '</span>' : '') + '</div>' +
                    '<div class="tc-long">' + esc(info.long) + '</div>' +
                    '<div class="tc-place">' + esc(placeLine(meta)) + '</div>' + fix + remove + '</div>' +
                    '<div class="tc-clockblock">' +
                        '<button type="button" class="tc-clock" data-copy-clock>' + esc(formatCompact(now, tz)) + '</button>' +
                        '<div class="tc-date">' + esc(formatDay(now, tz)) + '</div>' +
                        '<div class="tc-ist">' + esc(istLine) + '</div>' +
                    '</div></div>' +
                '<div class="tc-track">' + cells +
                    '<div class="tc-nowmark" hidden title="Now"></div>' +
                    '<div class="tc-pickmark" hidden><span>Selected</span></div>' +
                '</div></article>';
        }).join('');
        $('tcRows').innerHTML = html;
        state.hourKey = zonedFields(now, HOME).d + '-' + zonedFields(now, HOME).h;
    }

    function cssPx(name, fallback) {
        var board = $('tcBoard');
        if (!board) return fallback;
        var v = parseFloat(getComputedStyle(board).getPropertyValue(name));
        return isFinite(v) && v > 0 ? v : fallback;
    }

    function positionMarkers() {
        var col = cssPx('--tc-col', 46);
        var start = homeMidnight(state.view).getTime();
        var nowH = (Date.now() - start) / 3600000;
        var showNow = nowH >= 0 && nowH < 24;
        document.querySelectorAll('.tc-nowmark').forEach(function (el) {
            el.hidden = !showNow;
            if (showNow) el.style.left = (nowH * col) + 'px';
        });
        var picked = readFromInstant();
        var pickH = picked ? (picked.getTime() - start) / 3600000 : -1;
        var showPick = !!(picked && !state.live && pickH >= 0 && pickH < 24 && Math.abs(picked.getTime() - Date.now()) > 90000);
        document.querySelectorAll('.tc-pickmark').forEach(function (el) {
            el.hidden = !showPick;
            if (showPick) el.style.left = (pickH * col) + 'px';
        });
    }

    function scrollNowIntoView() {
        var scroller = $('tcScroll');
        if (!scroller) return;
        var mark = document.querySelector('.tc-nowmark:not([hidden])') || document.querySelector('.tc-pickmark:not([hidden])');
        if (!mark) {
            scroller.scrollLeft = 0;
            return;
        }
        var meta = cssPx('--tc-meta', 360);
        var left = mark.getBoundingClientRect().left - scroller.getBoundingClientRect().left + scroller.scrollLeft;
        scroller.scrollLeft = Math.max(0, left - (scroller.clientWidth + meta) / 2);
    }

    function renderBoard() {
        renderDates();
        renderChips();
        renderRows();
        positionMarkers();
        if (state.scroll) {
            state.scroll = false;
            requestAnimationFrame(function () { requestAnimationFrame(scrollNowIntoView); });
        }
    }

    function updateLiveTexts(now) {
        document.querySelectorAll('.tc-row').forEach(function (row) {
            var tz = row.getAttribute('data-tz');
            var clock = row.querySelector('.tc-clock');
            var date = row.querySelector('.tc-date');
            var ist = row.querySelector('.tc-ist');
            if (clock) clock.textContent = formatCompact(now, tz);
            if (date) date.textContent = formatDay(now, tz);
            if (ist) ist.textContent = tz === HOME ? 'Home' : '→ ' + formatCompact(now, HOME) + ' IST';
        });
        document.querySelectorAll('[data-live-tz]').forEach(function (el) {
            var tz = el.getAttribute('data-live-tz');
            var kind = el.getAttribute('data-live-kind');
            if (kind === 'compact') el.textContent = formatCompact(now, tz);
            else if (kind === 'day') el.textContent = formatDay(now, tz);
            else if (kind === 'clock') el.textContent = formatClock(now, tz);
        });
    }

    function hideSuggest() {
        var box = $('tcSuggest');
        if (box) box.hidden = true;
        if (searchInput) searchInput.setAttribute('aria-expanded', 'false');
    }

    function renderSuggest() {
        var box = $('tcSuggest');
        if (!searchInput.value.trim() || !state.matches.length) {
            hideSuggest();
            box.innerHTML = '';
            return;
        }
        var now = new Date();
        box.hidden = false;
        searchInput.setAttribute('aria-expanded', 'true');
        box.innerHTML = state.matches.map(function (z, i) {
            var info = zoneClockInfo(z.tz, now);
            return '<div class="tc-sug' + (i === state.hi ? ' is-active' : '') + '">' +
                '<button type="button" class="tc-sug-main" data-pick="' + esc(z.tz) + '">' +
                    '<span class="tc-sug-title">' + esc(z.city) + (z.country ? ' · ' + esc(z.country) : '') + '</span>' +
                    '<span class="tc-sug-meta">' + esc(info.abbr) + ' · <span data-live-tz="' + esc(z.tz) + '" data-live-kind="compact">' + esc(formatCompact(now, z.tz)) + '</span> now · <span data-live-tz="' + esc(HOME) + '" data-live-kind="compact">' + esc(formatCompact(now, HOME)) + '</span> IST</span>' +
                '</button>' +
                '<button type="button" class="tc-sug-add" data-add="' + esc(z.tz) + '">Add</button></div>';
        }).join('');
    }

    function renderLookup() {
        var box = $('tcLookup');
        var q = searchInput.value.trim();
        if (!q) {
            box.hidden = true;
            box.innerHTML = '';
            return;
        }
        var z = state.matches[state.hi] || state.matches[0];
        box.hidden = false;
        if (!z) {
            box.innerHTML = '<p>No timezone found for “' + esc(q) + '”. Try a city, CDT, IST, or an IANA name like America/Chicago.</p>';
            return;
        }
        var now = new Date();
        var info = zoneClockInfo(z.tz, now);
        var ist = zoneClockInfo(HOME, now);
        var diff = ist.offset - info.offset;
        var ahead = diff === 0
            ? info.abbr + ' is the same time as IST.'
            : 'IST is ' + formatDuration(diff) + ' ' + (diff > 0 ? 'ahead of' : 'behind') + ' ' + info.abbr + '.';
        var extra = state.matches.length > 1
            ? '<p class="tc-ambig">Also matches ' + state.matches.slice(1, 4).map(function (m) { return esc(m.city); }).join(', ') + '. Pick one below, or add this one.</p>'
            : '';
        var onClock = state.zones.some(function (x) { return x.tz === z.tz; });
        box.innerHTML =
            '<div class="tc-lookup-grid">' +
                '<div><div class="tc-lookup-k">' + esc(info.abbr + ' · ' + z.city) + '</div>' +
                '<div class="tc-lookup-t" data-live-tz="' + esc(z.tz) + '" data-live-kind="clock">' + esc(formatClock(now, z.tz)) + '</div>' +
                '<div class="tc-lookup-d" data-live-tz="' + esc(z.tz) + '" data-live-kind="day">' + esc(formatDay(now, z.tz)) + '</div>' +
                '<div class="tc-lookup-long">' + esc(info.long) + '</div></div>' +
                '<div class="tc-lookup-arrow">→</div>' +
                '<div><div class="tc-lookup-k">IST · India</div>' +
                '<div class="tc-lookup-t" data-live-tz="' + esc(HOME) + '" data-live-kind="clock">' + esc(formatClock(now, HOME)) + '</div>' +
                '<div class="tc-lookup-d" data-live-tz="' + esc(HOME) + '" data-live-kind="day">' + esc(formatDay(now, HOME)) + '</div>' +
                '<div class="tc-lookup-long">' + esc(ist.long) + '</div></div>' +
            '</div>' +
            '<p class="tc-lookup-diff">' + esc(ahead) + '</p>' + extra +
            '<button type="button" class="tools-btn" id="tcLookupAdd"' + (onClock ? ' disabled' : '') + '>' +
            (onClock ? 'Already on the clock' : 'Add to clock') + '</button>';
    }

    function refreshSearch() {
        state.matches = searchZones(searchInput.value);
        state.hi = 0;
        renderSuggest();
        renderLookup();
    }

    function addZone(tz, addedAs) {
        if (!validTz(tz)) {
            toast('Unknown timezone');
            return;
        }
        if (state.zones.some(function (z) { return z.tz === tz; })) {
            toast('Already on the clock');
            return;
        }
        state.zones.push({ tz: tz, addedAs: addedAs || '' });
        ensureOption(tz);
        persist();
        renderBoard();
        toast('Added ' + (metaFor(tz).city || tz));
    }

    function removeZone(tz) {
        if (tz === HOME) return;
        state.zones = state.zones.filter(function (z) { return z.tz !== tz; });
        persist();
        renderBoard();
        if (searchInput.value.trim()) renderLookup();
    }

    function setView(ymd) {
        state.view = ymd;
        state.scroll = true;
        renderBoard();
        renderConverter();
    }

    function tick() {
        var now = new Date();
        updateLiveTexts(now);
        positionMarkers();
        if (state.live) {
            var key = liveKey();
            if (key !== state.liveKey) {
                state.liveKey = key;
                var active = document.activeElement;
                if (!active || (active.id !== 'tcDate' && active.id !== 'tcTime')) {
                    setInputsToNow();
                    renderConverter();
                    positionMarkers();
                }
            }
        }
        var hourKey = zonedFields(now, HOME).d + '-' + zonedFields(now, HOME).h;
        if (hourKey !== state.hourKey) {
            renderRows();
            positionMarkers();
        }
    }

    function init() {
        fromSel = $('tcFrom');
        toSel = $('tcTo');
        dateInput = $('tcDate');
        timeInput = $('tcTime');
        searchInput = $('tcSearch');
        if (!fromSel || !toSel || !dateInput || !timeInput || !searchInput) return;

        fillSelect(fromSel);
        fillSelect(toSel);
        fromSel.value = 'America/Chicago';
        toSel.value = HOME;

        var loaded = loadZones();
        state.zones = loaded.zones;
        state.zones.forEach(function (z) { ensureOption(z.tz); });
        state.view = todayYmd();
        setInputsToNow();
        updateLiveButton();
        renderConverter();
        renderBoard();

        if (loaded.fromHash) persist();
        else if (document.querySelector('[data-tool-panel="timezone"].active')) syncTimeConverterHash();

        window.syncTimeConverterHash = function () {
            syncTimeConverterHash();
            requestAnimationFrame(function () { requestAnimationFrame(scrollNowIntoView); });
        };

        fromSel.addEventListener('change', function () {
            if (state.live) setInputsToNow();
            renderConverter();
            positionMarkers();
        });
        toSel.addEventListener('change', function () {
            renderConverter();
            positionMarkers();
        });
        function pauseForEdit() {
            state.live = false;
            updateLiveButton();
            renderConverter();
            positionMarkers();
        }
        dateInput.addEventListener('input', pauseForEdit);
        timeInput.addEventListener('input', pauseForEdit);
        $('tcLive').addEventListener('click', function () {
            state.live = !state.live;
            updateLiveButton();
            if (state.live) setInputsToNow();
            renderConverter();
            positionMarkers();
        });
        $('tcUseNow').addEventListener('click', function () {
            state.live = true;
            updateLiveButton();
            setInputsToNow();
            renderConverter();
            positionMarkers();
        });
        $('tcCopyResult').addEventListener('click', function () {
            var text = conversionSummary();
            if (text) copyText(text);
        });
        $('tcSwap').addEventListener('click', function () {
            var a = fromSel.value;
            var b = toSel.value;
            var instant = state.live ? null : readFromInstant();
            fromSel.value = b;
            toSel.value = a;
            if (state.live) setInputsToNow();
            else if (instant) writeInputs(instant, fromSel.value);
            renderConverter();
            positionMarkers();
        });
        $('tcResult').addEventListener('click', function (e) {
            var btn = e.target.closest('[data-show-day]');
            if (!btn) return;
            var bits = btn.getAttribute('data-show-day').split('-').map(Number);
            setView({ y: bits[0], m: bits[1], d: bits[2] });
        });

        searchInput.addEventListener('input', refreshSearch);
        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                hideSuggest();
                return;
            }
            if (!state.matches.length) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                state.hi = (state.hi + 1) % state.matches.length;
                renderSuggest();
                renderLookup();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                state.hi = (state.hi - 1 + state.matches.length) % state.matches.length;
                renderSuggest();
                renderLookup();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                var z = state.matches[state.hi] || state.matches[0];
                if (!z) return;
                addZone(z.tz, addedAsFromQuery(searchInput.value));
                searchInput.value = '';
                state.matches = [];
                renderSuggest();
                renderLookup();
            }
        });
        $('tcSuggest').addEventListener('click', function (e) {
            var add = e.target.closest('[data-add]');
            var pick = e.target.closest('[data-pick]');
            if (add) {
                var tz = add.getAttribute('data-add');
                addZone(tz, addedAsFromQuery(searchInput.value));
                searchInput.value = '';
                state.matches = [];
                renderSuggest();
                renderLookup();
                return;
            }
            if (pick) {
                var picked = pick.getAttribute('data-pick');
                var idx = -1;
                for (var i = 0; i < state.matches.length; i++) {
                    if (state.matches[i].tz === picked) idx = i;
                }
                if (idx >= 0) state.hi = idx;
                renderSuggest();
                renderLookup();
            }
        });
        $('tcLookup').addEventListener('click', function (e) {
            if (!e.target.closest('#tcLookupAdd')) return;
            var z = state.matches[state.hi] || state.matches[0];
            if (!z) return;
            addZone(z.tz, addedAsFromQuery(searchInput.value));
            searchInput.value = '';
            state.matches = [];
            renderSuggest();
            renderLookup();
        });
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.tc-search')) hideSuggest();
        });

        $('tcChips').addEventListener('click', function (e) {
            var btn = e.target.closest('[data-chip]');
            if (!btn) return;
            var tz = btn.getAttribute('data-chip');
            if (state.zones.some(function (z) { return z.tz === tz; })) {
                if (tz === HOME) toast('IST stays on the clock');
                else removeZone(tz);
                return;
            }
            addZone(tz, '');
        });
        $('tcRows').addEventListener('click', function (e) {
            var remove = e.target.closest('[data-remove]');
            if (remove) {
                removeZone(remove.getAttribute('data-remove'));
                return;
            }
            var clock = e.target.closest('[data-copy-clock]');
            if (!clock) return;
            var row = clock.closest('.tc-row');
            var tz = row.getAttribute('data-tz');
            var now = new Date();
            var text = formatClock(now, tz) + ' ' + shortName(tz, now) + ', ' + formatDay(now, tz);
            if (tz !== HOME) text += ' · ' + formatClock(now, HOME) + ' IST';
            copyText(text);
        });
        $('tcDates').addEventListener('click', function (e) {
            var btn = e.target.closest('[data-ymd]');
            if (!btn) return;
            var bits = btn.getAttribute('data-ymd').split('-').map(Number);
            setView({ y: bits[0], m: bits[1], d: bits[2] });
        });
        $('tcPrevDay').addEventListener('click', function () { setView(addDays(state.view, -1)); });
        $('tcNextDay').addEventListener('click', function () { setView(addDays(state.view, 1)); });
        $('tcViewDate').addEventListener('change', function () {
            var bits = $('tcViewDate').value.split('-').map(Number);
            if (!bits[0] || !bits[1] || !bits[2]) return;
            setView({ y: bits[0], m: bits[1], d: bits[2] });
        });
        $('tcToday').addEventListener('click', function () { setView(todayYmd()); });
        $('tcLink').addEventListener('click', function () { copyText(shareUrl(), 'Link copied'); });
        $('tcReset').addEventListener('click', function () {
            state.zones = defaultZones();
            state.view = todayYmd();
            state.scroll = true;
            persist();
            renderBoard();
            toast('Reset to IST, CDT, and London');
        });

        setInterval(tick, 1000);
    }

    init();
})();
