
const modal = document.getElementById("studentModal");

const openModal = document.getElementById("openModal");

const closeModal = document.querySelector(".close");





openModal.onclick = function(){

    modal.style.display="flex";

}


closeModal.onclick=function(){

    modal.style.display="none";

}

window.onclick=function(event){

    if(event.target == modal){

        modal.style.display="none";

    }

}


const form = document.getElementById("studentForm");

const tableBody = document.getElementById("studentTableBody");



form.addEventListener("submit", async function(e){


    e.preventDefault();



    let id =
    document.getElementById("studentId").value;


    let name =
    document.getElementById("studentName").value;


    let email =
    document.getElementById("studentEmail").value;


    let department =
    document.getElementById("studentDepartment").value;


    let year =
    document.getElementById("studentYear").value;



 const student = {

    studentId: document.getElementById("studentId").value,

    name: document.getElementById("studentName").value,

    email: document.getElementById("studentEmail").value,

    department: document.getElementById("studentDepartment").value,

    year: document.getElementById("studentYear").value,

    mobile: document.getElementById("studentMobile").value

};

const response = await fetch("/register-student", {

    method: "POST",

    headers: {
        "Content-Type": "application/json"
    },

    body: JSON.stringify(student)

});

if(response.ok){

    alert("Student Added Successfully");

    modal.style.display="none";

    form.reset();

    loadStudents();

}


updateStats();



form.reset();


modal.style.display="none";



});


document.addEventListener("click",function(e){


if(e.target.classList.contains("delete-btn")){


    e.target.closest("tr").remove();


    updateStats();


}


});


function updateStats(){


let students =
document.querySelectorAll("#studentTableBody tr").length;



document.getElementById("totalStudents").innerHTML = students;



document.getElementById("activeStudents").innerHTML = students;



}


const search =
document.getElementById("searchStudent");



search.addEventListener("keyup",function(){


let value =
search.value.toLowerCase();



let rows =
document.querySelectorAll("#studentTableBody tr");



rows.forEach(row=>{


let text =
row.innerText.toLowerCase();



if(text.includes(value)){


row.style.display="";


}

else{


row.style.display="none";


}



});


});

let editRow = null;


document.addEventListener("click",function(e){


if(e.target.classList.contains("edit-btn")){


    editRow = e.target.closest("tr");


    document.getElementById("studentId").value =
    editRow.children[0].innerText;


    document.getElementById("studentName").value =
    editRow.children[1].innerText;


    document.getElementById("studentEmail").value =
    editRow.children[2].innerText;


    document.getElementById("studentDepartment").value =
    editRow.children[3].innerText;


    document.getElementById("studentYear").value =
    editRow.children[4].innerText;



    document.querySelector(".modal-content h2").innerText =
    "Edit Student";


    document.querySelector(".save-btn").innerText =
    "Update Student";


    modal.style.display="flex";


}

});


const departmentFilter =
document.getElementById("departmentFilter");



departmentFilter.addEventListener("change",function(){



let value =
this.value.toLowerCase();



let rows =
document.querySelectorAll("#studentTableBody tr");



rows.forEach(row=>{


let department =
row.children[3].innerText.toLowerCase();



if(value=="all" || department==value){


row.style.display="";


}

else{


row.style.display="none";


}



});


});


document.getElementById("downloadStudents")
.addEventListener("click",function(){



let csv = [];


let rows =
document.querySelectorAll("table tr");



rows.forEach(row=>{


let cols =
row.querySelectorAll("th,td");


let data=[];


cols.forEach(col=>{


data.push(col.innerText);


});


csv.push(data.join(","));


});



let csvFile =
csv.join("\n");



let blob =
new Blob([csvFile],{
type:"text/csv"
});



let link =
document.createElement("a");


link.href =
URL.createObjectURL(blob);



link.download =
"students.csv";



link.click();



});


const viewModal =
document.getElementById("viewModal");


const closeView =
document.querySelector(".close-view");



document.addEventListener("click",function(e){



if(e.target.classList.contains("view-btn")){


let row =
e.target.closest("tr");



document.getElementById("viewId").innerText =
row.children[0].innerText;



document.getElementById("viewName").innerText =
row.children[1].innerText;



document.getElementById("viewEmail").innerText =
row.children[2].innerText;



document.getElementById("viewDepartment").innerText =
row.children[3].innerText;



document.getElementById("viewYear").innerText =
row.children[4].innerText;



viewModal.style.display="flex";


}


});




closeView.onclick=function(){


viewModal.style.display="none";


}



window.addEventListener("click",function(e){


if(e.target==viewModal){


viewModal.style.display="none";


}


});

async function loadStudents(){

    const response = await fetch("/students-data");

    const students = await response.json();

    const tableBody = document.getElementById("studentTableBody");

    tableBody.innerHTML = "";

    students.forEach(student=>{

        tableBody.innerHTML += `

        <tr>

        <td>${student.studentId}</td>

        <td>${student.name}</td>

        <td>${student.email}</td>

        <td>${student.department}</td>

        <td>${student.year}</td>

        <td>
            <span class="active-status">
                Active
            </span>
        </td>

        <td>

            <button class="view-btn">👁</button>

            <button class="edit-btn">✏️</button>

            <button class="delete-btn">🗑️</button>

        </td>

        </tr>

        `;

    });

    updateStats();

}

loadStudents();