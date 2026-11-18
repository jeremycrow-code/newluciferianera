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
    const outDayRuler = document.getElementById('out-day-ruler');

    // True Sky ranges (same as before)
    const sunTrueSkyRanges = [
        { start: [1, 20], end: [2, 16], name: "Capricornus", symbol: "♑" },
        { start: [2, 16], end: [3, 11], name: "Aquarius", symbol: "♒" },
        { start: [3, 11], end: [4, 18], name: "Pisces", symbol: "♓" },
        { start: [4, 18], end: [5, 13], name: "Aries", symbol: "♈" },
        { start: [5, 13], end: [6, 21], name: "Taurus", symbol: "♉" },
        { start: [6, 21], end: [7, 20], name: "Gemini", symbol: "♊" },
        { start: [7, 20], end: [8, 10], name: "Cancer", symbol: "♋" },
        { start: [8, 10], end: [9, 16], name: "Leo", symbol: "♌" },
        { start: [9, 16], end: [10, 30], name: "Virgo", symbol: "♍" },
        { start: [10, 30], end: [11, 23], name: "Libra", symbol: "♎" },
        { start: [11, 23], end: [11, 29], name: "Scorpius", symbol: "♏" },
        { start: [11, 29], end: [12, 17], name: "Ophiuchus", symbol: "⚕" },
        { start: [12, 17], end: [1, 20], name: "Sagittarius", symbol: "♐" }
    ];

    const dayRulers = [
        { planet: "The Sun", symbol: "☉", tarot: "The Sun" },          // Sunday
        { planet: "The Moon", symbol: "☽", tarot: "The High Priestess" }, // Monday
        { planet: "Mars", symbol: "♂", tarot: "The Tower" },            // Tuesday
        { planet: "Mercury", symbol: "☿", tarot: "The Sorcerer" },      // Wednesday
        { planet: "Jupiter", symbol: "♃", tarot: "The Wheel of Fortune" }, // Thursday
        { planet: "Venus", symbol: "♀", tarot: "The Empress" },         // Friday
        { planet: "Saturn", symbol: "♄", tarot: "The Universe" }        // Saturday
    ];

    const SYNODIC_MONTH = 29.530588;
    const MS_PER_DAY = 86400000;
    const ANCHOR_NEW_MOON = new Date(Date.UTC(2025, 7, 23, 6, 6, 0));

    function toGuatemalaDateString(date) {
        const gt = new Date(date.getTime() - 6 * 3600 * 1000);
        return gt.toISOString().split('T')[0];
    }

    function getSolsticeForDate(date) {
        const y = date.getUTCFullYear();
        let solstice = new Date(Date.UTC(y, 11, 21, 0, 0, 0));
        if (date < solstice) solstice = new Date(Date.UTC(y - 1, 11, 21, 0, 0, 0));
        return solstice;
    }

    function getLunationStartNewMoon(targetDate) {
        const probe = new Date(targetDate.getTime() + 18 * 3600 * 1000);
        const diffDays = (probe.getTime() - ANCHOR_NEW_MOON.getTime()) / MS_PER_DAY;
        const offset = Math.floor(diffDays / SYNODIC_MONTH);
        return new Date(ANCHOR_NEW_MOON.getTime() + offset * SYNODIC_MONTH * MS_PER_DAY);
    }

    function getSunTrueSky(date) {
        const month = date.getUTCMonth() + 1;
        const day = date.getUTCDate();
        const md = month * 100 + day;

        for (const r of sunTrueSkyRanges) {
            const startMd = r.start[0] * 100 + r.start[1];
            const endMd = r.end[0] * 100 + r.end[1];
            if (r.start[0] > r.end[0]) {
                if (md >= startMd || md < endMd) return r;
            } else {
                if (md >= startMd && md < endMd) return r;
            }
        }
        return { name: "Unknown", symbol: "" };
    }

    function getLunarPhase(day) {
        if (day < 1) return "New Moon";
        if (day < 7.4) return "Waxing Crescent";
        if (day < 8.4) return "First Quarter";
        if (day < 14.8) return "Waxing Gibbous";
        if (day < 15.8) return "Full Moon";
        if (day < 22.1) return "Waning Gibbous";
        if (day < 23.1) return "Last Quarter";
        if (day < 29.5) return "Waning Crescent";
        return "New Moon";
    }

    function calculateNLE(dateString) {
        const target = new Date(dateString + 'T00:00:00-06:00');
        const dateObj = new Date(dateString + 'T12:00:00Z');

        // NLE Year
        const solstice = getSolsticeForDate(target);
        let nleYear = solstice.getUTCFullYear() - 2012;
        if (solstice.getUTCFullYear() === 2012) nleYear = 0;

        // Lunation day
        const lunationNewMoon = getLunationStartNewMoon(target);
        const newMoonGtDate = toGuatemalaDateString(lunationNewMoon);
        const newMoonNoon = new Date(newMoonGtDate + 'T12:00:00Z');
        const day = Math.max(0, Math.round((dateObj - newMoonNoon) / MS_PER_DAY));

        // Lunation index
        const solsticeNewMoon = getLunationStartNewMoon(solstice);
        const lunation = Math.max(0, Math.round(
            (lunationNewMoon.getTime() - solsticeNewMoon.getTime()) / (SYNODIC_MONTH * MS_PER_DAY)
        ));

        // Sun true sky + symbol
        const sunData = getSunTrueSky(target);

        // Day ruler
        const weekday = dateObj.getUTCDay(); // 0 = Sunday
        const ruler = dayRulers[weekday];

        // Output
        outYear.textContent = `Year ${nleYear} NLE`;
        outLunation.textContent = `${nleYear} – ${lunation} – ${day} NLE`;
        outZodiac.textContent = `${sunData.symbol} ${sunData.name}`;
        outMeridian.textContent = getLunarPhase(day);
        outDayRuler.textContent = `${ruler.symbol} ${ruler.planet} — ${ruler.tarot}`;
    }

    calculateNLE(todayString);

    convertBtn.addEventListener('click', () => {
        if (dateInput.value) calculateNLE(dateInput.value);
    });

    dateInput.addEventListener('change', () => {
        if (dateInput.value) calculateNLE(dateInput.value);
    });
});
