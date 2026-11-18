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
    const SYNODIC_MONTH = 29.530588;          // mean synodic month in days
    const MS_PER_DAY = 86400000;

    // Anchor: 2025-08-23 06:06 UTC
    // = 12:06 am Guatemala (UTC-6) = Day 0 of Lunation 9, Year 12 NLE
    const ANCHOR_NEW_MOON = new Date(Date.UTC(2025, 7, 23, 6, 6, 0));
    const ANCHOR_YEAR = 12;
    const ANCHOR_LUNATION = 9;

    /**
     * Get the winter solstice (Dec 21 00:00 UTC) that starts the NLE year
     * containing the given date.
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
     * Find the New Moon that began the lunation containing the target date.
     * Works both forward and backward from the 2025-08-23 anchor.
     */
    function getPreviousNewMoon(target) {
        const diffDays = (target.getTime() - ANCHOR_NEW_MOON.getTime()) / MS_PER_DAY;
        const lunationsOffset = Math.floor(diffDays / SYNODIC_MONTH);
        const ms = ANCHOR_NEW_MOON.getTime() + lunationsOffset * SYNODIC_MONTH * MS_PER_DAY;
        return new Date(ms);
    }

    function calculateNLE(dateString) {
        // Interpret the date as Guatemala midnight (UTC-6)
        // so the Day 0 threshold matches the workshop rule
        const target = new Date(dateString + 'T00:00:00-06:00');

        // NLE Year (solstice-based)
        const solstice = getSolsticeForDate(target);
        let nleYear = solstice.getUTCFullYear() - 2012;
        if (solstice.getUTCFullYear() === 2012) nleYear = 0;

        // Days into the current lunar cycle (0 = New Moon day)
        const prevNewMoon = getPreviousNewMoon(target);
        let day = Math.floor((target.getTime() - prevNewMoon.getTime()) / MS_PER_DAY);
        if (day < 0) day = 0;
        if (day > 29) day = 29; // safety clamp

        // Lunation number within the year
        // Count new moons from the solstice's ongoing lunation
        const solsticePrevNewMoon = getPreviousNewMoon(solstice);
        const lunationsFromSolstice = Math.round(
            (prevNewMoon.getTime() - solsticePrevNewMoon.getTime()) / (SYNODIC_MONTH * MS_PER_DAY)
        );
        const lunation = lunationsFromSolstice;

        // True-sky zodiac (practical linear mapping from solstice)
        const daysSinceSolstice = (target.getTime() - solstice.getTime()) / MS_PER_DAY;
        const zodiacIndex = Math.floor((Math.max(0, daysSinceSolstice) / 365.25) * 13) % 13;

        // Status
        let status = "Ongoing Lunation";
        if (day === 0) status = "New Moon – Day 0 (Guatemala midnight threshold)";
        else if (day >= 28) status = "Approaching next New Moon";

        // Render
        outYear.textContent = `Year ${nleYear} NLE`;
        outLunation.textContent = `${nleYear} – ${lunation} – ${day} NLE`;
        outZodiac.textContent = trueSkyZodiac[zodiacIndex];
        outMeridian.textContent = status;
    }

    // Initial load
    calculateNLE(todayString);

    // Button + change events
    convertBtn.addEventListener('click', () => {
        if (dateInput.value) calculateNLE(dateInput.value);
    });

    dateInput.addEventListener('change', () => {
        if (dateInput.value) calculateNLE(dateInput.value);
    });
});
