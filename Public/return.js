const tableBody = document.getElementById("returnTableBody");

const modal = document.getElementById("returnModal");

const closeBtn = document.querySelector(".close");

const returnForm = document.getElementById("returnForm");

let currentIssueId = null;

closeBtn.onclick = function () {

    modal.style.display = "none";

}

window.onclick = function (e) {

    if (e.target == modal) {

        modal.style.display = "none";

    }

}

async function loadReturnedBooks() {

    const response = await fetch("/returned-books");

    const issues = await response.json();

    tableBody.innerHTML = "";

    issues.forEach(issue => {

        let statusClass = "";

        if (issue.status == "Issued") {

            statusClass = "issued";

        }

        else if (issue.status == "Returned") {

            statusClass = "returned";

        }

        else {

            statusClass = "overdue";

        }

        tableBody.innerHTML += `

        <tr>

            <td>${issue._id}</td>

            <td>${issue.studentName}</td>

            <td>${issue.bookTitle}</td>

            <td>${issue.issueDate.substring(0,10)}</td>

            <td>${issue.dueDate.substring(0,10)}</td>

            <td>

                ${issue.returnDate ? issue.returnDate.substring(0,10) : "-"}

            </td>

            <td>

                <span class="${statusClass}">

                    ${issue.status}

                </span>

            </td>

            <td>

                <button
                    class="return-btn"
                    data-id="${issue._id}">

                    <i class="fa-solid fa-rotate-left"></i>

                    Return

                </button>

            </td>

        </tr>

        `;

    });

    updateStats();

}

loadReturnedBooks();


document.addEventListener("click", async function(e){

    if(!e.target.closest(".return-btn")) return;

    const id = e.target.closest(".return-btn").dataset.id;

    currentIssueId = id;

    const response = await fetch("/issue/" + id);

    const issue = await response.json();

    document.getElementById("issueId").value = issue._id;

    document.getElementById("studentName").value = issue.studentName;

    document.getElementById("bookName").value = issue.bookTitle;

    document.getElementById("issueDate").value =
    issue.issueDate.substring(0,10);

    document.getElementById("dueDate").value =
    issue.dueDate.substring(0,10);

    const today = new Date().toISOString().split("T")[0];

    document.getElementById("returnDate").value = today;

    const due = new Date(issue.dueDate);

    const ret = new Date(today);

    let fine = 0;

    if(ret > due){

        const days = Math.ceil((ret - due)/(1000*60*60*24));

        fine = days * 10;

    }

    document.getElementById("fine").value = fine;

    modal.style.display = "flex";

});

returnForm.addEventListener("submit", async function(e){

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

        returnForm.reset();

        loadReturnedBooks();

    }

});

function updateStats(){

    const rows = document.querySelectorAll("#returnTableBody tr");

    let returned = 0;

    let pending = 0;

    let today = 0;

    let totalFine = 0;

    const todayDate = new Date().toISOString().split("T")[0];

    rows.forEach(function(row){

        const status = row.children[6].innerText.trim();

        const returnDate = row.children[5].innerText.trim();

        if(status == "Returned"){

            returned++;

        }

        else{

            pending++;

        }

        if(returnDate == todayDate){

            today++;

        }

    });

    document.getElementById("returnedBooks").innerText = returned;

    document.getElementById("pendingReturns").innerText = pending;

    document.getElementById("todayReturns").innerText = today;

    document.getElementById("totalFine").innerText =
    "₹" + document.getElementById("fine").value;

}



const tbody = document.getElementById("returnTableBody");

const search = document.getElementById("searchReturn");

const statusFilter = document.getElementById("statusFilter");

const modal = document.getElementById("returnModal");

const closeBtn = document.querySelector(".close");

const form = document.getElementById("returnForm");

async function loadReturns(){

    const response = await fetch("/issued-books");

    const data = await response.json();

    tbody.innerHTML = "";

    let returned = 0;

    let pending = 0;

    let today = 0;

    let fineTotal = 0;

    const todayDate = new Date().toISOString().split("T")[0];

    data.forEach(issue=>{

        if(issue.status==="Returned") returned++;

        else pending++;

        if(issue.returnDate===todayDate) today++;

        fineTotal += issue.fine || 0;

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
                    issue.status==="Issued"

                    ?

                    `<button class="return-btn" data-id="${issue._id}">Return</button>`

                    :

                    `Completed`

                }

            </td>

        </tr>

        `;

    });

    document.getElementById("returnedBooks").innerText = returned;

    document.getElementById("pendingReturns").innerText = pending;

    document.getElementById("todayReturns").innerText = today;

    document.getElementById("totalFine").innerText = "₹"+fineTotal;

}

loadReturns();

tbody.addEventListener("click",async function(e){

    if(!e.target.classList.contains("return-btn")) return;

    const id = e.target.dataset.id;

    const response = await fetch("/issue/"+id);

    const issue = await response.json();

    document.getElementById("issueId").value = issue._id;

    document.getElementById("studentName").value = issue.studentName;

    document.getElementById("bookName").value = issue.bookTitle;

    document.getElementById("issueDate").value = issue.issueDate.substring(0,10);

    document.getElementById("dueDate").value = issue.dueDate.substring(0,10);

    const today = new Date();

    document.getElementById("returnDate").value = today.toISOString().split("T")[0];

    const due = new Date(issue.dueDate);

    let fine = 0;

    if(today>due){

        const days = Math.ceil((today-due)/(1000*60*60*24));

        fine = days*10;

    }

    document.getElementById("fine").value = fine;

    modal.style.display="flex";

});

closeBtn.onclick=function(){

    modal.style.display="none";

}

window.onclick=function(e){

    if(e.target===modal){

        modal.style.display="none";

    }

}

form.addEventListener("submit",async function(e){

    e.preventDefault();

    const id=document.getElementById("issueId").value;

    const returnDate=document.getElementById("returnDate").value;

    const fine=document.getElementById("fine").value;

    const response=await fetch("/return-book/"+id,{

        method:"PUT",

        headers:{

            "Content-Type":"application/json"

        },

        body:JSON.stringify({

            returnDate,

            fine

        })

    });

    if(response.ok){

        alert("Book Returned Successfully");

        modal.style.display="none";

        loadReturns();

    }

});

search.addEventListener("keyup",function(){

    const value=this.value.toLowerCase();

    document.querySelectorAll("#returnTableBody tr").forEach(row=>{

        if(row.innerText.toLowerCase().includes(value))

            row.style.display="";

        else

            row.style.display="none";

    });

});

statusFilter.addEventListener("change",function(){

    const value=this.value.toLowerCase();

    document.querySelectorAll("#returnTableBody tr").forEach(row=>{

        const status=row.children[6].innerText.toLowerCase();

        if(value==="all" || status===value)

            row.style.display="";

        else

            row.style.display="none";

    });

});

document.getElementById("downloadReturn").addEventListener("click",function(){

    let csv="Issue ID,Student,Book,Issue Date,Due Date,Return Date,Status\n";

    document.querySelectorAll("#returnTableBody tr").forEach(row=>{

        let data=[];

        row.querySelectorAll("td").forEach((cell,index)=>{

            if(index<7)

                data.push(cell.innerText);

        });

        csv+=data.join(",")+"\n";

    });

    const blob=new Blob([csv],{type:"text/csv"});

    const url=URL.createObjectURL(blob);

    const a=document.createElement("a");

    a.href=url;

    a.download="ReturnedBooks.csv";

    a.click();

});

async function loadReturns(){

    const response = await fetch("/issued-books");

    const issues = await response.json();

    const tbody = document.getElementById("returnTableBody");

    tbody.innerHTML = "";

    issues.forEach(issue=>{

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
                    issue.status==="Issued"

                    ?

                    `<button class="return-btn">

                        Return

                    </button>`

                    :

                    "Returned"

                }

            </td>

        </tr>

        `;

    });

}
loadReturns();

document.getElementById("downloadReturn").addEventListener("click",function(){

    let csv = "Issue ID,Student,Book,Issue Date,Due Date,Return Date,Status\n";

    document.querySelectorAll("#returnTableBody tr").forEach(function(row){

        let data = [];

        row.querySelectorAll("td").forEach(function(cell,index){

            if(index < 7){

                data.push(cell.innerText.trim());

            }

        });

        csv += data.join(",") + "\n";

    });

    const blob = new Blob([csv],{

        type:"text/csv"

    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "ReturnedBooks.csv";

    a.click();

});