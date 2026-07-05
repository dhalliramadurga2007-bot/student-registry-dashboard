const idInput = document.getElementById('studentId');
const nameInput = document.getElementById('name');
const gradeInput = document.getElementById('grade');
const tableBody = document.getElementById('tableBody');
const formTitle = document.getElementById('formTitle');

const submitBtn = document.getElementById('submitBtn');
const updateBtn = document.getElementById('updateBtn');
const cancelBtn = document.getElementById('cancelBtn');

// Helper function to convert text strings to Title Case format (Ex: sai kumar -> Sai Kumar)
function formatToTitleCase(str) {
    if (!str) return '';
    return str
        .trim()
        .split(/\s+/) // Splits multiple spaces cleanly
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// Force input text capitalization in real-time
gradeInput.addEventListener('input', () => {
    gradeInput.value = gradeInput.value.toUpperCase();
});

loadStudents();

// 🟢 READ & RENDER
async function loadStudents() {
    try {
        const res = await fetch('/api/students');
        const data = await res.json();
        tableBody.innerHTML = '';
        
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#94a3b8; padding:20px;">Database storage is currently empty.</td></tr>`;
            return;
        }

        data.forEach((s, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="badge-sno">${index + 1}</span></td>
                <td>${escapeInput(s.name)}</td>
                <td style="color:#10b981; font-weight:bold;">${escapeInput(s.grade.toUpperCase())}</td>
                <td style="text-align: center;">
                    <button class="action-edit-btn">Modify</button>
                    <button class="action-del-btn">Delete</button>
                </td>
            `;

            tr.querySelector('.action-edit-btn').addEventListener('click', () => {
                prepareFormForEdit(s.id, s.name, s.grade);
            });

            tr.querySelector('.action-del-btn').addEventListener('click', () => {
                deleteStudent(s.id, s.name);
            });

            tableBody.appendChild(tr);
        });
    } catch (err) {
        console.error('Failed to display dataset:', err);
    }
}

// 🔵 CREATE (Updated payload with Title Case styling)
submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    if(!validateInputs()) return;
    
    const payload = { 
        name: formatToTitleCase(nameInput.value), 
        grade: gradeInput.value.trim().toUpperCase() 
    };
    
    try {
        const res = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if(res.ok) {
            resetFormState();
            loadStudents();
        } else {
            alert("Error sending record payload to server.");
        }
    } catch (err) {
        console.error('Post execution failure:', err);
    }
});

// 🟠 UPDATE (Updated payload with Title Case styling)
updateBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const id = idInput.value;
    if(!id || !validateInputs()) return;

    const payload = { 
        name: formatToTitleCase(nameInput.value), 
        grade: gradeInput.value.trim().toUpperCase() 
    };
    
    try {
        const res = await fetch(`/api/students/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if(res.ok) {
            resetFormState();
            loadStudents();
        }
    } catch (err) {
        console.error('Update operation failed:', err);
    }
});

function prepareFormForEdit(dbId, name, grade) {
    formTitle.innerText = "Modify Existing Profile Data";
    idInput.value = dbId;
    nameInput.value = name;
    gradeInput.value = grade.toUpperCase();
    
    submitBtn.style.display = "none";
    updateBtn.style.display = "inline-block";
    cancelBtn.style.display = "inline-block";
    nameInput.focus();
}

cancelBtn.addEventListener('click', resetFormState);

function resetFormState() {
    formTitle.innerText = "Student Registry Entry";
    idInput.value = "";
    nameInput.value = "";
    gradeInput.value = "";
    
    submitBtn.style.display = "inline-block";
    updateBtn.style.display = "none";
    cancelBtn.style.display = "none";
}

// 🔴 DELETE
async function deleteStudent(dbId, name) {
    if(!confirm(`Are you certain you wish to purge records for "${name}"?`)) return;
    
    try {
        const res = await fetch(`/api/students/${dbId}`, { method: 'DELETE' });
        if(res.ok) {
            if(idInput.value === String(dbId)) resetFormState();
            loadStudents();
        }
    } catch (err) {
        console.error('Delete execution failed:', err);
    }
}

function validateInputs() {
    if(nameInput.value.trim() === "" || gradeInput.value.trim() === "") {
        alert("Please complete all registry input fields before submitting operations.");
        return false;
    }
    return true;
}

function escapeInput(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}