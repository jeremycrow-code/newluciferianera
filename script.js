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

    function calculateNLE(dateString) {
        // Parse input date and anchor to Guatemala Meridian (UTC-6)
        const targetDate = new Date(dateString + 'T00:00:00-06:00');
        const targetYear = targetDate.getFullYear();
        
        // Winter Solstice anchor for the current Gregorian year (Dec 21)
        let solsticeThisYear = new Date(targetYear, 11, 21, 0, 0, 0);
        
        // Correct NLE Year calculation: Dec 21, 2012 = Year 0
        let nleYear = targetYear - 2012;
        if (targetDate < solsticeThisYear) {
            nleYear -= 1; // Before Dec 21 belongs to the previous NLE year
            solsticeThisYear = new Date(targetYear - 1, 11, 21, 0, 0, 0);
        }

        // Synodic lunar cycle calculations anchored to epoch solstice (Dec 21, 2012)
        const epochSolstice = new Date(2012, 11, 21, 0, 0, 0);
        const synodicMonth = 29.530588; 
        
        const diffTime = targetDate - epochSolstice;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        const totalLunations = diffDays / synodicMonth;
        const lunationDay = Math.floor((totalLunations % 1) * synodicMonth);
        
        const daysSinceSolstice = (targetDate - solsticeThisYear) / (1000 * 60 * 60 * 24);
        let lunationIndex = Math.floor(daysSinceSolstice / synodicMonth);
        if (lunationIndex < 0) lunationIndex = 0;

        // True Sky Zodiac mapping
        const dayOfYear = Math.max(0, daysSinceSolstice);
        const zodiacIndex = Math.floor((dayOfYear / 365) * trueSkyZodiac.length) % trueSkyZodiac.length;

        // Guatemala Midnight Threshold check (UTC-6)
        const hoursCheck = targetDate.getHours();
        const meridianStatus = hoursCheck >= 0 ? "Pre-Midnight Anchor (Day 0 Confirmed)" : "Post-Midnight Rollover";

        // Render in exact format: Year - Lunation - Day NLE
        outYear.textContent = `Year ${nleYear} NLE`;
        outLunation.textContent = `${nleYear} - ${lunationIndex} - ${lunationDay} NLE`;
        outZodiac.textContent = trueSkyZodiac[zodiacIndex];
        outMeridian.textContent = meridianStatus;
    }

    // Initial calculation on load
    calculateNLE(todayString);

    // Event listener for button click
    convertBtn.addEventListener('click', () => {
        if (dateInput.value) {
            calculateNLE(dateInput.value);
        }
    });
});
