const reqList = [];

// Handle "Add to List" button
document.getElementById('add-btn').addEventListener('click', () => {
    const faculty = document.getElementById('faculty').value;
    const subject = document.getElementById('subject').value;
    const hours = document.getElementById('hours').value;
    const isLab = document.getElementById('cont-lab').checked;

    if(!faculty || !subject || !hours) return alert("Please fill all fields");

    const entry = { faculty, subject, hours, isLab };
    reqList.push(entry);
    
    
    // Update the visual list
    const li = document.createElement('li');
    li.textContent = `${subject} (${faculty}) - ${hours} hrs`;
    document.getElementById('req-list').appendChild(li);

    // Clear inputs
    document.getElementById('timetable-form').reset();
});

document.getElementById('generate-btn').addEventListener('click', async () => {
    if(reqList.length === 0) return alert("Add some requirements first!");

    const statusCell = document.getElementById('table-body');
    statusCell.innerHTML = "<tr><td colspan='6'>AI is thinking (2025 Stable Mode)...</td></tr>";

    const API_KEY = "PAST_YOUR_API_KEY_HERE"; // <--- PASTE KEY AGAIN
    
    // In late 2025, use 'gemini-2.0-flash' or 'gemini-2.5-flash'
    const MODEL = "gemini-2.5-flash"; 

    //const promptText = `Return ONLY <tr> rows for an LDCE IT timetable for these subjects: ${JSON.stringify(reqList)}. Use times 10:30 AM to 5:15 PM.`;
    const promptText = `
        Act as an LDCE Academic Coordinator. Generate a weekly timetable for IT Semester 3.
        Subjects: ${JSON.stringify(reqList)}

        STRICT SCHEDULING RULES:
        1. DAILY TIMINGS: 10:30 AM to 05:15 PM.
        2. LUNCH BREAK: 12:30 PM - 01:00 PM (Must be empty/labeled for all days).
        3. RECESS: 03:00 PM - 03:15 PM (Must be empty/labeled for all days).

        LAB/PRACTICAL RULES (isLab: true):
        - Duration: Exactly 2 hours.
        - ALLOWED SLOTS: 10:30 AM - 12:30 PM OR 03:15 PM - 05:15 PM.
        - FORBIDDEN SLOTS: Labs CANNOT be scheduled between 01:00 PM and 03:00 PM.
        - Labs must happen in a single 2-hour continuous block.

        THEORY RULES (isLab: false):
        - Can be scheduled in any 1-hour slot (10:30, 11:30, 01:00, 02:00, 03:15, 04:15).

        OUTPUT FORMAT:
        - Return ONLY <tr> rows.
        - Use 'colspan="5"' for LUNCH and RECESS rows.
        - Ensure no professor is double-booked across Divisions or Days.
        `;
    try {
        // Updated to /v1/ stable endpoint
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("API Error:", data.error.message);
            // Fallback: If 2.0 isn't available, try the latest 1.5 alias
            statusCell.innerHTML = `<tr><td colspan='6' style='color:red;'>
                Model not found. Try changing the MODEL name to <b>gemini-1.5-flash-001</b> in your code.
            </td></tr>`;
            return;
        }

        const aiResponse = data.candidates[0].content.parts[0].text;
        statusCell.innerHTML = aiResponse.replace(/```html|```/g, "").trim();

    } catch (error) {
        statusCell.innerHTML = "<tr><td colspan='6' style='color:red;'>Connection Error. Try a mobile hotspot.</td></tr>";
    }
});
