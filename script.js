document.addEventListener('DOMContentLoaded', () => {
    // Set default date input to today
    const dateInput = document.getElementById('gregorian-date');
    const convertBtn = document.getElementById('convert-btn');
    
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

    // Output DOM elements
    const outYear = document.getElementById('out-nle-year');
    const outLunation = document.getElementById('out-lunation');
    const outZodiac = document.getElementById('out-zodiac');
    const outMeridian = document.getElementById('out-meridian');

    // Zodiac Stations Array (True Sky sequence starting with Aquarius)
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
        const selectedDate = new Date(dateString);
        
        // Simulating astronomical calculation mapped to Guatemala Meridian (UTC-6)
        // In production expansion, an ephemeris library (like Astronomy Engine) is evaluated here.
        
        // Mock algorithmic derivation for MVP display:
        const year = selectedDate.getFullYear();
        const nleYear = year - 2000 + 26; // Example Epoch scaling
        
        // Pseudo lunation day calculation (0 to 29)
        const dayOfYear = Math.floor((selectedDate - new Date(year, 0, 0)) / (1000 * 60 * 60 * 24));
        const lunationDay = (dayOfYear % 29.5) | 0;
        
        // Zodiac index mapping based on month/season rotation
        const zodiacIndex = Math.floor((dayOfYear / 28) % trueSkyZodiac.length);
        
        // Midnight Threshold Check simulation for Guatemala (UTC-6)
        // Checking if conjunction falls before/after 00:00:00 local time
        const hoursCheck = (dayOfYear * 7) % 24;
        const meridianStatus = hoursCheck >= 12 
            ? `Post-Midnight Rollover (${hoursCheck.toFixed(0)}h UTC-6)` 
            : `Pre-Midnight Anchor (Day 0 Confirmed)`;

        // Render to UI
        outYear.textContent = `NLE Cycle ${nleYear}`;
        outLunation.textContent = `Day ${lunationDay} of 29`;
        outZodiac.textContent = trueSkyZodiac[zodiacIndex];
        outMeridian.textContent = meridianStatus;
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
