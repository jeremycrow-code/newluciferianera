document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('gregorian-date');
    const convertBtn = document.getElementById('convert-btn');

    // Set default date to today
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    dateInput.value = todayString;

    // Output elements
    const outYear = document.getElementById('out-nle-year');
    const outLunation = document.getElementById('out-lunation');
    const outZodiac = document.getElementById('out-zodiac');
    const outMeridian = document.getElementById('out-meridian');

    // True Sky Zodiac (13 stations)
    const trueSkyZodiac = [
        "Aquarius (The Star)",
        "Pisces (The Moon)",
        "Aries (The Emperor)",
        "Taurus (The High Priest)",
        "Gemini (The Lovers)",
        "Cancer (The Chariot)",
        "Leo (Strength / Lust)",
        "Virgo (The Hermit)",
        "Libra (Justice / Scales)",
        "Scorpio (Death)",
        "Ophiuchus (The Healer)",
        "Sagittarius (Alchemy / Art)",
        "Capricorn (The Devil)"
    ];

    // Constants
    const SYNODIC_MONTH = 29.530588;
    const MS_PER_DAY = 86400000;

    // Anchor New Moon: 2025-08-23 06:06 UTC
    // = 00:06 Guatemala time → Guatemala calendar day 2025-08-23 = Day 0
    const ANCHOR_NEW_MOON = new Date(Date.UTC(2025, 7, 23, 6, 6, 0));

    /**
     * Guatemala calendar date string (YYYY-MM-DD) for a given UTC Date
     */
    function toGuatemalaDateString(date) {
        const gt = new Date(date.getTime() - 6 * 3600 * 1000);
        return gt.toISOString().split('T')[0];
    }

    /**
     * Winter solstice that begins the NLE year containing the given date
     */
    function getSolsticeForDate(date) {
        const y = date.getUTCFullYear();
        let solstice = new Date(Date.UTC(y, 11, 21, 0, 0, 0));
        if (date < solstice) {
            solstice = new Date(Date.UTC(y - 1, 11, 21, 0, 0, 0));
        }
        return solstice;
    }

    /**
     * Return the New Moon whose Guatemala calendar day is Day 0
     * of the lunation that contains the target date.
     * A New Moon any time during a Guatemala day makes that day Day 0.
     */
    function getLunationStartNewMoon(targetDate) {
        // Probe into the afternoon of the Guatemala day so a New Moon
        // even a few minutes after midnight is still claimed by this day
        const probe = new Date(targetDate.getTime() + 18 * 3600 * 1000);
        const diffDays = (probe.getTime() - ANCHOR_NEW_MOON.getTime()) / MS_PER_DAY;
        const offset = Math.floor(diffDays / SYNODIC_MONTH);
        return new Date(ANCHOR_NEW_MOON.getTime() + offset * SYNODIC_MONTH * MS_PER_DAY);
    }

    function calculateNLE(dateString) {
        // Guatemala midnight of the selected date
        const target = new Date(dateString + 'T00:00:00-06:00');

        // NLE Year
        const solstice = getSolsticeForDate(target);
        let nleYear = solstice.getUTCFullYear() - 2012;
        if (solstice.getUTCFullYear() === 2012) nleYear = 0;

        // New Moon that defines Day 0 of this lunation
        const lunationNewMoon = getLunationStartNewMoon(target);
        const newMoonGtDate = toGuatemalaDateString(lunationNewMoon);

        // Day number = difference in Guatemala calendar days
        const targetNoon = new Date(dateString + 'T12:00:00Z');
        const newMoonNoon = new Date(newMoonGtDate + 'T12:00:00Z');
        const day = Math.round((targetNoon - newMoonNoon) / MS_PER_DAY);

        // Lunation index within the NLE year
        const solsticeNewMoon = getLunationStartNewMoon(solstice);
        const lunation = Math.max(0, Math.round(
            (lunationNewMoon.getTime() - solsticeNewMoon.getTime()) / (SYNODIC_MONTH * MS_PER_DAY)
        ));

        // True-sky zodiac (linear mapping from solstice)
        const daysSinceSolstice = (target.getTime() - solstice.getTime()) / MS_PER_DAY;
        const zodiacIndex = Math.floor((Math.max(0, daysSinceSolstice) / 365.25) * 13) % 13;

        // Status
        let status = "Ongoing Lunation";
        if (day === 0) status = "New Moon – Day 0 (Guatemala calendar day)";
        else if (day >= 28) status = "Approaching next New Moon";

        // Output
        outYear.textContent = `Year ${nleYear} NLE`;
        outLunation.textContent = `${nleYear} – ${lunation} – ${day} NLE`;
        outZodiac.textContent = trueSkyZodiac[zodiacIndex];
        outMeridian.textContent = status;
    }

    // Initial calculation
    calculateNLE(todayString);

    convertBtn.addEventListener('click', () => {
        if (dateInput.value) calculateNLE(dateInput.value);
    });

    dateInput.addEventListener('change', () => {
        if (dateInput.value) calculateNLE(dateInput.value);
    });
});
