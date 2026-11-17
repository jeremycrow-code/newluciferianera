document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('gregorian-date');
    const convertBtn = document.getElementById('convert-btn');
    
    // Set default date input to today
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    dateInput.value = todayString;

    // Output DOM elements
    const outYear = document.getElementById('out-nle-year');
    const outLunation = document.getElementById('out-lunation');
    const outZodiac = document.getElementById('out-zodiac');
    const outMeridian = document.getElementById('out-meridian');

    // True Sky Zodiac Stations (13 stations starting with Aquarius)
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
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    
    // Reference New Moon: 2012-12-13 ~00:00 UTC (tuned so Dec 21 2012 is day 8)
    const REF_NEW_MOON = new Date(Date.UTC(2012, 11, 13, 0, 0, 0));
    
    // Epoch solstice: Dec 21, 2012 (start of Year 0)
    const EPOCH_SOLSTICE = new Date(Date.UTC(2012, 11, 21, 0, 0, 0));

    /**
     * Approximate the previous New Moon before or on the given date.
     * Uses average synodic month from reference.
     */
    function getPreviousNewMoon(targetDate) {
        const diffMs = targetDate.getTime() - REF_NEW_MOON.getTime();
        const diffDays = diffMs / MS_PER_DAY;
        const lunationsSinceRef = Math.floor(diffDays / SYNODIC_MONTH);
        const prevNewMoonMs = REF_NEW_MOON.getTime() + lunationsSinceRef * SYNODIC_MONTH * MS_PER_DAY;
        return new Date(prevNewMoonMs);
    }

    /**
     * Get the winter solstice date (approx Dec 21) for the NLE year of the target.
     */
    function getSolsticeForDate(targetDate) {
        const year = targetDate.getUTCFullYear();
        let solstice = new Date(Date.UTC(year, 11, 21, 0, 0, 0));
        if (targetDate < solstice) {
            solstice = new Date(Date.UTC(year - 1, 11, 21, 0, 0, 0));
        }
        return solstice;
    }

    function calculateNLE(dateString) {
        // Parse as UTC midnight for consistency (Guatemala UTC-6 is close enough for day boundaries)
        const targetDate = new Date(dateString + 'T00:00:00Z');
        
        // NLE Year: number of solstices since Dec 21, 2012
        const solstice = getSolsticeForDate(targetDate);
        let nleYear = solstice.getUTCFullYear() - 2012;
        if (solstice.getUTCFullYear() === 2012) nleYear = 0;

        // Find previous New Moon
        const prevNewMoon = getPreviousNewMoon(targetDate);
        const daysIntoLunation = Math.floor((targetDate.getTime() - prevNewMoon.getTime()) / MS_PER_DAY);
        
        // Determine lunation number within the NLE year
        // Find the New Moon that was active on the solstice (or the previous one)
        const solsticePrevNewMoon = getPreviousNewMoon(solstice);
        
        // Count how many new moons have occurred from solsticePrevNewMoon up to prevNewMoon
        const lunationsFromSolstice = Math.round((prevNewMoon.getTime() - solsticePrevNewMoon.getTime()) / (SYNODIC_MONTH * MS_PER_DAY));
        
        // Lunation 0 is the one ongoing (or starting) on the solstice
        let lunationIndex = lunationsFromSolstice;
        
        // Special case: if the solstice itself is a new moon day, lunation starts at 0
        // For most years, the ongoing cycle becomes lunation 0
        
        // Zodiac: approximate based on days since solstice (true sky is more complex; this is a practical mapping)
        const daysSinceSolstice = (targetDate.getTime() - solstice.getTime()) / MS_PER_DAY;
        const zodiacIndex = Math.floor((Math.max(0, daysSinceSolstice) / 365.25) * trueSkyZodiac.length) % trueSkyZodiac.length;

        // Status
        let status = "Ongoing Lunation";
        if (daysIntoLunation === 0) status = "New Moon (Day 0)";
        else if (daysIntoLunation >= 28) status = "Approaching Next New Moon";

        // Render
        outYear.textContent = `Year ${nleYear} NLE`;
        outLunation.textContent = `${nleYear} – ${lunationIndex} – ${daysIntoLunation} NLE`;
        outZodiac.textContent = trueSkyZodiac[zodiacIndex];
        outMeridian.textContent = status;
    }

    // Initial calculation on load
    calculateNLE(todayString);

    // Event listener for button click
    convertBtn.addEventListener('click', () => {
        if (dateInput.value) {
            calculateNLE(dateInput.value);
        }
    });

    // Also recalculate on date change
    dateInput.addEventListener('change', () => {
        if (dateInput.value) {
            calculateNLE(dateInput.value);
        }
    });
});
