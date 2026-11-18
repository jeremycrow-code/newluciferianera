document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('gregorian-date');
    const convertBtn = document.getElementById('convert-btn');

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    dateInput.value = todayString;

    const outYear = document.getElementById('out-nle-year');
    const outLunation = document.getElementById('out-lunation');
    const outZodiac = document.getElementById('out-zodiac');
    const outMeridian = document.getElementById('out-meridian');

    // True Sky / IAU constellation date ranges for the Sun (approximate, non-leap; includes Ophiuchus)
    // Format: [startMonth, startDay, endMonth, endDay, name]
    // Note: ranges that cross year boundary are handled specially
    const sunTrueSkyRanges = [
        { start: [1, 20], end: [2, 16], name: "Capricornus" },
        { start: [2, 16], end: [3, 11], name: "Aquarius" },
        { start: [3, 11], end: [4, 18], name: "Pisces" },
        { start: [4, 18], end: [5, 13], name: "Aries" },
        { start: [5, 13], end: [6, 21], name: "Taurus" },
        { start: [6, 21], end: [7, 20], name: "Gemini" },
        { start: [7, 20], end: [8, 10], name: "Cancer" },
        { start: [8, 10], end: [9, 16], name: "Leo" },
        { start: [9, 16], end: [10, 30], name: "Virgo" },
        { start: [10, 30], end: [11, 23], name: "Libra" },
        { start: [11, 23], end: [11, 29], name: "Scorpius" },
        { start: [11, 29], end: [12, 17], name: "Ophiuchus" },
        { start: [12, 17], end: [1, 20], name: "Sagittarius" } // crosses year
    ];

    const SYNODIC_MONTH = 29.530588;
    const MS_PER_DAY = 86400000;
    const ANCHOR_NEW_MOON = new Date(Date.UTC(2025, 7, 23, 6, 6, 0)); // 2025-08-23 06:06 UTC

    function toGuatemalaDateString(date) {
        const gt = new Date(date.getTime() - 6 * 3600 * 1000);
        return gt.toISOString().split('T')[0];
    }

    function getSolsticeForDate(date) {
        const y = date.getUTCFullYear();
        let solstice = new Date(Date.UTC(y, 11, 21, 0, 0, 0));
        if (date < solstice) {
            solstice = new Date(Date.UTC(y - 1, 11, 21, 0, 0, 0));
        }
        return solstice;
    }

    function getLunationStartNewMoon(targetDate) {
        const probe = new Date(targetDate.getTime() + 18 * 3600 * 1000);
        const diffDays = (probe.getTime() - ANCHOR_NEW_MOON.getTime()) / MS_PER_DAY;
        const offset = Math.floor(diffDays / SYNODIC_MONTH);
        return new Date(ANCHOR_NEW_MOON.getTime() + offset * SYNODIC_MONTH * MS_PER_DAY);
    }

    function getSunTrueSky(date) {
        const month = date.getUTCMonth() + 1; // 1-12
        const day = date.getUTCDate();
        const md = month * 100 + day; // for easy comparison

        for (const r of sunTrueSkyRanges) {
            const startMd = r.start[0] * 100 + r.start[1];
            const endMd = r.end[0] * 100 + r.end[1];

            if (r.start[0] > r.end[0]) {
                // crosses year (Sagittarius)
                if (md >= startMd || md < endMd) return r.name;
            } else {
                if (md >= startMd && md < endMd) return r.name;
            }
        }
        return "Unknown";
    }

    function getLunarPhase(day) {
        // day = 0..29.5
        if (day < 1) return { phase: "New Moon", direction: "" };
        if (day < 7.4) return { phase: "Waxing Crescent", direction: "Waxing" };
        if (day < 8.4) return { phase: "First Quarter", direction: "Waxing" };
        if (day < 14.8) return { phase: "Waxing Gibbous", direction: "Waxing" };
        if (day < 15.8) return { phase: "Full Moon", direction: "" };
        if (day < 22.1) return { phase: "Waning Gibbous", direction: "Waning" };
        if (day < 23.1) return { phase: "Last Quarter", direction: "Waning" };
        if (day < 29.5) return { phase: "Waning Crescent", direction: "Waning" };
        return { phase: "New Moon", direction: "" };
    }

    function calculateNLE(dateString) {
        const target = new Date(dateString + 'T00:00:00-06:00');

        // NLE Year
        const solstice = getSolsticeForDate(target);
        let nleYear = solstice.getUTCFullYear() - 2012;
        if (solstice.getUTCFullYear() === 2012) nleYear = 0;

        // Lunation day
        const lunationNewMoon = getLunationStartNewMoon(target);
        const newMoonGtDate = toGuatemalaDateString(lunationNewMoon);
        const targetNoon = new Date(dateString + 'T12:00:00Z');
        const newMoonNoon = new Date(newMoonGtDate + 'T12:00:00Z');
        const day = Math.max(0, Math.round((targetNoon - newMoonNoon) / MS_PER_DAY));

        // Lunation index
        const solsticeNewMoon = getLunationStartNewMoon(solstice);
        const lunation = Math.max(0, Math.round(
            (lunationNewMoon.getTime() - solsticeNewMoon.getTime()) / (SYNODIC_MONTH * MS_PER_DAY)
        ));

        // Sun in true sky
        const sunConstellation = getSunTrueSky(target);

        // Lunar phase
        const lunar = getLunarPhase(day);
        let status = lunar.phase;
        if (lunar.direction) status += ` (${lunar.direction})`;

        // Output
        outYear.textContent = `Year ${nleYear} NLE`;
        outLunation.textContent = `${nleYear} – ${lunation} – ${day} NLE`;
        outZodiac.textContent = sunConstellation;
        outMeridian.textContent = status;
    }

    calculateNLE(todayString);

    convertBtn.addEventListener('click', () => {
        if (dateInput.value) calculateNLE(dateInput.value);
    });

    dateInput.addEventListener('change', () => {
        if (dateInput.value) calculateNLE(dateInput.value);
    });
});
