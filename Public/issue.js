const modal = document.getElementById("issueModal");

const openModal = document.getElementById("openIssueModal");

const closeModal = document.getElementById("closeIssue");

const form = document.getElementById("issueForm");

const tableBody = document.getElementById("issueTableBody");

let editRow = null;



openModal.onclick = function () {

    modal.style.display = "flex";

}



closeModal.onclick = function () {

    modal.style.display = "none";

}



window.onclick = function (e) {

    if (e.target == modal) {

        modal.style.display = "none";

    }

}



form.addEventListener("submit", async function(e){

    e.preventDefault();

    const student =
    document.getElementById("studentSelect").value;

    const book =
    document.getElementById("bookSelect").value;

    const issueDate =
    document.getElementById("issueDate").value;

    const dueDate =
    document.getElementById("dueDate").value;

    const studentId =
    document.getElementById("studentSelect").selectedOptions[0].dataset.id;

    const bookId =
    document.getElementById("bookSelect").selectedOptions[0].dataset.id;



    if(editRow){

        const id = editRow.children[0].innerText;

        const response = await fetch("/update-issue/" + id,{

            method:"PUT",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                studentId,
                studentName:student,
                bookId,
                bookTitle:book,
                issueDate,
                dueDate

            })

        });

        const result = await response.json();

        if(result.success){

            alert("Issue Updated Successfully");

            modal.style.display="none";

            form.reset();

            editRow=null;

            loadIssuedBooks();

        }

        return;

    }



    const response = await fetch("/issue-book",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            studentId,
            studentName:student,
            bookId,
            bookTitle:book,
            issueDate,
            dueDate

        })

    });

    const result = await response.json();

    if(result.success){

        alert("Book Issued Successfully");

        modal.style.display="none";

        form.reset();

        loadIssuedBooks();

    }

});


document.addEventListener("click", async function(e){

    if(!e.target.closest(".view-btn")) return;

    const id = e.target.closest("tr").children[0].innerText;

    const response = await fetch("/issue/" + id);

    const issue = await response.json();

    document.getElementById("viewIssueId").innerText =
    issue._id;

    document.getElementById("viewStudent").innerText =
    issue.studentName;

    document.getElementById("viewBook").innerText =
    issue.bookTitle;

    document.getElementById("viewIssueDate").innerText =
    issue.issueDate.substring(0,10);

    document.getElementById("viewDueDate").innerText =
    issue.dueDate.substring(0,10);

    document.getElementById("viewStatus").innerText =
    issue.status;

    viewModal.style.display = "flex";

});



document.addEventListener("click", function (e) {

    if (e.target.closest(".edit-btn")) {

        editRow = e.target.closest("tr");

        document.getElementById("studentSelect").value =
            editRow.children[1].innerText;

        document.getElementById("bookSelect").value =
            editRow.children[2].innerText;

        document.getElementById("issueDate").value =
            editRow.children[3].innerText;

        document.getElementById("dueDate").value =
            editRow.children[4].innerText;

        document.querySelector("#issueModal h2").innerText =
            "Edit Issue";

        document.querySelector(".save-btn").innerText =
            "Update Issue";

        modal.style.display = "flex";

    }

});



const viewModal =
document.getElementById("viewModal");

const closeView =
document.getElementById("closeView");


document.addEventListener("click", function (e) {

    if (e.target.closest(".view-btn")) {

        let row = e.target.closest("tr");

        document.getElementById("viewIssueId").innerText =
            row.children[0].innerText;

        document.getElementById("viewStudent").innerText =
            row.children[1].innerText;

        document.getElementById("viewBook").innerText =
            row.children[2].innerText;

        document.getElementById("viewIssueDate").innerText =
            row.children[3].innerText;

        document.getElementById("viewDueDate").innerText =
            row.children[4].innerText;

        document.getElementById("viewStatus").innerText =
            row.children[5].innerText;

        viewModal.style.display = "flex";

    }

});


closeView.onclick = function () {

    viewModal.style.display = "none";

}


window.addEventListener("click", function (e) {

    if (e.target == viewModal) {

        viewModal.style.display = "none";

    }

});


const search =
document.getElementById("searchIssue");

search.addEventListener("keyup", function () {

    let value =
    this.value.toLowerCase();

    let rows =
    document.querySelectorAll("#issueTableBody tr");

    rows.forEach(row => {

        let text =
        row.innerText.toLowerCase();

        if (text.includes(value)) {

            row.style.display = "";

        }
        else {

            row.style.display = "none";

        }

    });

});


const statusFilter =
document.getElementById("statusFilter");

statusFilter.addEventListener("change", function () {

    let value =
    this.value.toLowerCase();

    let rows =
    document.querySelectorAll("#issueTableBody tr");

    rows.forEach(row => {

        let status =
        row.children[5].innerText.toLowerCase();

        if (value == "all" || status == value) {

            row.style.display = "";

        }
        else {

            row.style.display = "none";

        }

    });

});


document.getElementById("downloadIssue")
.addEventListener("click", function () {

    let csv = [];

    let rows =
    document.querySelectorAll("table tr");

    rows.forEach(row => {

        let cols =
        row.querySelectorAll("th,td");

        let data = [];

        cols.forEach(col => {

            data.push(col.innerText);

        });

        csv.push(data.join(","));

    });

    let csvFile =
    csv.join("\n");

    let blob =
    new Blob([csvFile], {

        type: "text/csv"

    });

    let link =
    document.createElement("a");

    link.href =
    URL.createObjectURL(blob);

    link.download =
    "IssuedBooks.csv";

    link.click();

});



function updateStats() {

    let total =
    document.querySelectorAll("#issueTableBody tr").length;

    document.getElementById("totalIssued").innerText =
    total;

    let overdue = 0;

    let returned = 0;

    document.querySelectorAll("#issueTableBody tr")
    .forEach(row => {

        let status =
        row.children[5].innerText.trim();

        if (status == "Overdue") {

            overdue++;

        }

        if (status == "Returned") {

            returned++;

        }

    });

    document.getElementById("overdueBooks").innerText =
    overdue;

    document.getElementById("dueToday").innerText =
    returned;

}

updateStats();


async function loadStudents() {

    try {

        const response = await fetch("/students-data");

        const students = await response.json();

        const studentSelect = document.getElementById("studentSelect");

        studentSelect.innerHTML =
        '<option value="">Select Student</option>';

        students.forEach(student => {

            studentSelect.innerHTML += `
                <option
    value="${student.name}"
    data-id="${student.studentId}">
    ${student.name}
</option>
            `;

        });

    }

    catch(err){

        console.log("Student Load Error:", err);

    }

}

loadStudents();

async function loadBooks() {

    try {

        const response = await fetch("/books-data");

        const books = await response.json();

        const bookSelect =
        document.getElementById("bookSelect");

        bookSelect.innerHTML =
        '<option value="">Select Book</option>';

        books.forEach(book => {

            bookSelect.innerHTML += `

                <option
    value="${book.title}"
    data-id="${book.bookId}">
    ${book.title}
</option>

            `;

        });

    }

    catch(err){

        console.log("Book Load Error:", err);

    }

}

async function loadIssuedBooks(){

    const response = await fetch("/issued-books");

    const issues = await response.json();

    tableBody.innerHTML = "";

    issues.forEach(issue=>{

        tableBody.innerHTML += `
        <tr>
            <td>${issue._id}</td>
            <td>${issue.studentName}</td>
            <td>${issue.bookTitle}</td>
            <td>${issue.issueDate.substring(0,10)}</td>
            <td>${issue.dueDate.substring(0,10)}</td>
            <td>${issue.status}</td>
            <td>
                <button class="view-btn">
                    <i class="fa-solid fa-eye"></i>
                </button>

                <button class="edit-btn">
                    <i class="fa-solid fa-pen"></i>
                </button>

                <button class="delete-btn">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
        `;

    });

    updateStats();

}


loadStudents();
loadBooks();
loadIssuedBooks();