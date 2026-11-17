document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('gregorian-date');
    const convertBtn = document.getElementById('convert-btn');
    
    // Set default date input to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

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

    function calculateNLE(dateString) {
        const targetDate = new Date(dateString + 'T00:00:00-06:00'); // Anchored to Guatemala Meridian (UTC-6)
        
        // 1. Calculate NLE Year based on Dec 21 solstice anchor (Epoch: Dec 21, 2012 = Year 0)
        const targetYear = targetDate.getFullYear();
        let nleYear = targetYear - 2012;
        
        // Check if before winter solstice of that calendar year
        const solsticeThisYear = new Date(targetYear, 11, 21, 0, 0, 0, -6); // Dec 21
        if (targetDate < solsticeThisYear) {
            nleYear -= 1;
        }

        // 2. Approximate Synodic Lunar Cycle calculations anchored to known baseline
        // Mean synodic month = 29.530588 days
        const epochSolstice = new Date('2012-12-21T00:00:00-06:00');
        const diffTime = targetDate - epochSolstice;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        // Approximate lunation tracking from epoch
        const synodicMonth = 29.530588;
        const totalLunations = diffDays / synodicMonth;
        
        // Day within current lunation (0 to ~29)
        const lunationDay = Math.floor((totalLunations % 1) * synodicMonth);
        
        // Lunation index within the year (0 to 12/13)
        // Solstice reset adjustment
        const daysSinceSolstice = (targetDate - solsticeThisYear) / (1000 * 60 * 60 * 24);
        let lunationIndex = Math.floor(daysSinceSolstice / synodicMonth);
        if (lunationIndex < 0) lunationIndex = 12; // Fallback for late year pre-solstice
        lunationIndex = Math.abs(lunationIndex) % 13;

        // 3. True Sky Zodiac Mapping based on day of solar year
        const dayOfYear = ((targetDate - solsticeThisYear) / (1000 * 60 * 60 * 24) + 365) % 365;
        const zodiacIndex = Math.floor((dayOfYear / 365) * trueSkyZodiac.length) % trueSkyZodiac.length;

        // 4. Guatemala Meridian Midnight Threshold Status
        const hoursOffset = targetDate.getHours();
        const meridianStatus = "Guatemala Meridian (UTC-6) Active";

        // Format result: Year - Lunation - Day NLE
        outYear.textContent = `Year ${nleYear} (NLE Cycle)`;
        outLunation.textContent = `Lunation ${lunationIndex}, Day ${lunationDay}`;
        outZodiac.textContent = trueSkyZodiac[zodiacIndex];
        outMeridian.textContent = `${meridianStatus} [${nleYear}-${lunationIndex}-${lunationDay} NLE]`;
    }

    // Initial calculation on load
    calculateNLE(today);

    // Event listener for button click
    convertBtn.addEventListener('click', () => {
        if (dateInput.value) {
            calculateNLE(dateInput.value);
        }
    });
});
