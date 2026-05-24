// js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("Auth Script Loaded!");

    // --- Registration Logic ---
    const regForm = document.getElementById('regForm');
    if (regForm) {
        regForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('regName').value;
            const id = document.getElementById('regID').value;
            const dept = document.getElementById('regDept').value;
            const pass = document.getElementById('regPass').value;

            const student = { name, id, dept, pass, results: [] };

            let users = JSON.parse(localStorage.getItem('users') || "[]");
            
            if(users.some(u => u.id === id)) {
                alert("This ID is already registered!");
                return;
            }

            users.push(student);
            localStorage.setItem('users', JSON.stringify(users));
            alert("Registration Successful! Now Login.");
            window.location.href = "index.html";
        });
    }

    // --- Login Logic ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('loginID').value;
            const pass = document.getElementById('loginPass').value;
            const users = JSON.parse(localStorage.getItem('users') || "[]");

            const user = users.find(u => u.id === id && u.pass === pass);
            if (user) {
                localStorage.setItem('loggedInUser', JSON.stringify(user));
                window.location.href = "dashboard.html";
            } else {
                alert("Invalid ID or Password!");
            }
        });
    }
});

// Logout Function
function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = "index.html";
}