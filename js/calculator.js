let currentStudent = JSON.parse(localStorage.getItem('loggedInUser'));
let subjects = [];

if (!currentStudent) {
    window.location.href = "index.html";
}

document.getElementById('welcomeText').innerText = "Welcome, " + currentStudent.name;
document.getElementById('sID').innerText = "ID: " + currentStudent.id;
document.getElementById('sDept').innerText = "Dept: " + currentStudent.dept;

window.onload = function() {
    loadStoredResults();
};

function addSubject() {
    const name = document.getElementById('subName').value;
    const credit = parseFloat(document.getElementById('subCredit').value);
    const marks = parseFloat(document.getElementById('subMarks').value);

    if (!name || isNaN(credit) || isNaN(marks)) {
        return alert("Please fill all fields correctly!");
    }

    const gradeData = calculateGrade(marks);
    subjects.push({ name, credit, marks, ...gradeData });
    
    document.getElementById('subName').value = "";
    document.getElementById('subCredit').value = "";
    document.getElementById('subMarks').value = "";

    updateTable();
}

function calculateGrade(marks) {
    if (marks >= 80) return { grade: "A+", gpa: 4.00 };
    if (marks >= 75) return { grade: "A", gpa: 3.75 };
    if (marks >= 70) return { grade: "A-", gpa: 3.50 };
    if (marks >= 65) return { grade: "B+", gpa: 3.25 };
    if (marks >= 60) return { grade: "B", gpa: 3.00 };
    if (marks >= 55) return { grade: "B-", gpa: 2.75 };
    if (marks >= 50) return { grade: "C+", gpa: 2.50 };
    if (marks >= 45) return { grade: "C", gpa: 2.25 };
    if (marks >= 40) return { grade: "D", gpa: 2.00 };
    return { grade: "F", gpa: 0.00 };
}

function updateTable() {
    const list = document.getElementById('subjectList');
    list.innerHTML = "";
    let totalPoints = 0;
    let totalCredits = 0;

    subjects.forEach((s, index) => {
        totalPoints += (s.gpa * s.credit);
        totalCredits += s.credit;
        list.innerHTML += `<tr>
            <td>${s.name}</td>
            <td>${s.credit}</td>
            <td>${s.marks}</td>
            <td style="color:var(--vip-gold); font-weight:bold;">${s.grade}</td>
            <td>${s.gpa.toFixed(2)}</td>
            <td><button onclick="deleteSub(${index})" class="delete-small">Remove</button></td>
        </tr>`;
    });

    const currentGpa = totalCredits === 0 ? 0 : totalPoints / totalCredits;
    document.getElementById('currentGPA').innerText = currentGpa.toFixed(2);
}

function deleteSub(i) {
    subjects.splice(i, 1);
    updateTable();
}

function saveSemesterResult() {
    const finalGpa = document.getElementById('currentGPA').innerText;
    const semNo = document.getElementById('semesterNum').value;
    
    if (subjects.length === 0) return alert("Add subjects first!");
    if (!semNo) return alert("Enter Semester Number!");

    let users = JSON.parse(localStorage.getItem('users'));
    let userIndex = users.findIndex(u => u.id === currentStudent.id);

    users[userIndex].results.push({
        semester: semNo,
        date: new Date().toLocaleDateString(),
        gpa: finalGpa,
        details: [...subjects]
    });

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('loggedInUser', JSON.stringify(users[userIndex]));
    currentStudent = users[userIndex];

    alert("Semester " + semNo + " Result Saved to Vault!");
    subjects = [];
    document.getElementById('semesterNum').value = "";
    updateTable();
    loadStoredResults();
}

function loadStoredResults() {
    const filter = document.getElementById('viewSemesterFilter');
    const list = document.getElementById('storedHistoryList');
    const overallCGPAElement = document.getElementById('overallCGPA');
    
    list.innerHTML = "";
    let results = currentStudent.results || [];

    const currentFilterVal = filter ? filter.value : "all";
    if (filter) {
        filter.innerHTML = '<option value="all">Full History</option>';
        let uniqueSemesters = [...new Set(results.map(r => r.semester))].sort((a, b) => a - b);
        uniqueSemesters.forEach(sem => {
            filter.innerHTML += `<option value="${sem}">Semester ${sem}</option>`;
        });
        filter.value = currentFilterVal;
    }

    let displayResults = currentFilterVal === "all" ? results : results.filter(r => r.semester == currentFilterVal);

    if (displayResults.length === 0) {
        list.innerHTML = `<div style="text-align:center; color:var(--vip-text-dim); margin-top:40px;">Vault is empty.</div>`;
    } else {
        displayResults.slice().reverse().forEach((res, index) => {
            let actualIndex = results.length - 1 - index;
            
            let subsHTML = res.details.map(s => `
                <div class="subject-row-pro">
                    <span class="sub-name-pro">${s.name}</span>
                    <span class="sub-grade-pro">${s.grade}</span>
                </div>
            `).join("");
            
            list.innerHTML += `
                <div class="history-item">
                    <div class="history-top">
                        <span class="sem-title">SEMESTER ${res.semester}</span>
                        <span class="gpa-badge-pro">GPA ${res.gpa}</span>
                    </div>
                    <div class="history-subs-container">
                        ${subsHTML}
                    </div>
                    <div class="history-footer">
                        <span class="date-text"><i class="far fa-calendar-alt"></i> ${res.date}</span>
                        <button onclick="deleteSavedResult(${actualIndex})" class="delete-vault-btn">
                            <i class="fas fa-trash-alt"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        });
    }

    let totalGpaSum = results.reduce((acc, curr) => acc + parseFloat(curr.gpa), 0);
    let avgCGPA = results.length === 0 ? 0 : totalGpaSum / results.length;
    overallCGPAElement.innerText = avgCGPA.toFixed(2);
}

function viewResultsBySemester() {
    loadStoredResults();
}

function deleteSavedResult(index) {
    if (confirm("Delete this semester record from vault?")) {
        let users = JSON.parse(localStorage.getItem('users'));
        let uIdx = users.findIndex(u => u.id === currentStudent.id);
        users[uIdx].results.splice(index, 1);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('loggedInUser', JSON.stringify(users[uIdx]));
        currentStudent = users[uIdx];
        loadStoredResults();
    }
}

function clearAllHistory() {
    if (confirm("Erase all records from your premium vault?")) {
        let users = JSON.parse(localStorage.getItem('users'));
        let uIdx = users.findIndex(u => u.id === currentStudent.id);
        users[uIdx].results = [];
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('loggedInUser', JSON.stringify(users[uIdx]));
        currentStudent = users[uIdx];
        loadStoredResults();
    }
}

function generateResultQR() {
    const overallCGPA = document.getElementById('overallCGPA').innerText;
    let data = `Student: ${currentStudent.name}\nID: ${currentStudent.id}\nDept: ${currentStudent.dept}\nCGPA: ${overallCGPA}\nOfficial Premium Verification`;

    document.getElementById("qrcode").innerHTML = "";
    new QRCode(document.getElementById("qrcode"), {
        text: data,
        width: 180,
        height: 180,
        colorDark : "#000000",
        colorLight : "#ffffff"
    });

    document.getElementById('qrInfo').innerText = "Verified academic record for " + currentStudent.name;
    document.getElementById('qrModal').style.display = "flex";
}

function closeQR() {
    document.getElementById('qrModal').style.display = "none";
}