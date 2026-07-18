const tbody = document.getElementById("returnTableBody");
const modal = document.getElementById("returnModal");
const closeBtn = document.querySelector(".close");
const form = document.getElementById("returnForm");

let currentIssueId = null;

async function loadReturns() {

    const response = await fetch("/issued-books");
    const issues = await response.json();

    tbody.innerHTML = "";

    let returned = 0;
    let pending = 0;
    let today = 0;
    let totalFine = 0;

    const todayDate = new Date().toISOString().split("T")[0];

    issues.forEach(issue => {

        if (issue.status === "Returned")
            returned++;
        else
            pending++;

        if (issue.returnDate) {

            const rDate = issue.returnDate.substring(0,10);

            if (rDate === todayDate)
                today++;
        }

        totalFine += issue.fine || 0;

        tbody.innerHTML += `
        <tr>
            <td>${issue._id}</td>
            <td>${issue.studentName}</td>
            <td>${issue.bookTitle}</td>
            <td>${issue.issueDate.substring(0,10)}</td>
            <td>${issue.dueDate.substring(0,10)}</td>
            <td>${issue.returnDate ? issue.returnDate.substring(0,10) : "-"}</td>
            <td>${issue.status}</td>
            <td>
                ${
                    issue.status === "Issued"
                    ? `<button class="return-btn" data-id="${issue._id}">Return</button>`
                    : `Completed`
                }
            </td>
        </tr>
        `;

    });

    document.getElementById("returnedBooks").innerText = returned;
    document.getElementById("pendingReturns").innerText = pending;
    document.getElementById("todayReturns").innerText = today;
    document.getElementById("totalFine").innerText = "₹" + totalFine;

}

loadReturns();

tbody.addEventListener("click", async function(e){

    if(!e.target.classList.contains("return-btn")) return;

    currentIssueId = e.target.dataset.id;

    const response = await fetch("/issue/" + currentIssueId);

    const issue = await response.json();

    document.getElementById("issueId").value = issue._id;
    document.getElementById("studentName").value = issue.studentName;
    document.getElementById("bookName").value = issue.bookTitle;
    document.getElementById("issueDate").value = issue.issueDate.substring(0,10);
    document.getElementById("dueDate").value = issue.dueDate.substring(0,10);

    const today = new Date();

    document.getElementById("returnDate").value = today.toISOString().split("T")[0];

    let fine = 0;

    if(today > new Date(issue.dueDate)){

        const days = Math.ceil((today - new Date(issue.dueDate))/(1000*60*60*24));

        fine = days * 10;

    }

    document.getElementById("fine").value = fine;

    modal.style.display = "flex";

});

closeBtn.onclick = function(){

    modal.style.display = "none";

}

window.onclick = function(e){

    if(e.target === modal){

        modal.style.display = "none";

    }

}

form.addEventListener("submit", async function(e){

    e.preventDefault();

    const response = await fetch("/return-book/" + currentIssueId,{

        method:"PUT",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            returnDate:document.getElementById("returnDate").value,

            fine:document.getElementById("fine").value

        })

    });

    const result = await response.json();

    if(result.success){

        alert("Book Returned Successfully");

        modal.style.display = "none";

        form.reset();

        loadReturns();

    }

});
