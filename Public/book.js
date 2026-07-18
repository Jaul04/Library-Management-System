function updateStats(){

    const rows=document.querySelectorAll("tbody tr");

    document.getElementById("totalBooks").innerText=rows.length;

    let available=0;
    let issued=0;

    let categories=new Set();

    rows.forEach(function(row){

        const status=row.cells[5].innerText.trim();

        if(status==="Available"){
            available++;
        }

        if(status==="Issued"){
            issued++;
        }

        categories.add(row.cells[3].innerText.trim());

    });

    document.getElementById("availableBooks").innerText=available;

    document.getElementById("issuedBooks").innerText=issued;

    document.getElementById("totalCategories").innerText=categories.size;

}



function attachEvents(row){


    // EDIT BOOK

    row.querySelector(".edit-btn")
    .addEventListener("click",function(){


        editRow=row;


        document.getElementById("bookId").value =
        row.cells[0].innerText;


        document.getElementById("bookName").value =
        row.cells[1].innerText;


        document.getElementById("author").value =
        row.cells[2].innerText;


        document.getElementById("category").value =
        row.cells[3].innerText;


        document.getElementById("quantity").value =
        row.cells[4].innerText;


        modal.style.display="flex";


    });



    // DELETE BOOK

    row.querySelector(".delete-btn")
    .addEventListener("click",async function(){


        if(confirm("Delete this book?")){


            const id=row.dataset.id;


            const response=await fetch(
                "/delete-book/"+id,
                {
                    method:"DELETE"
                }
            );


            const result=await response.json();


            if(result.success){


                alert("Book Deleted Successfully");


                loadBooks();


            }
            else{

                alert("Delete Failed");

            }


        }


    });


}


const modal = document.getElementById("bookModal");
const addBookBtn = document.querySelector(".add-book-btn");
const closeBtn = document.querySelector(".close");
const bookForm = document.getElementById("bookForm");

let editRow = null;

addBookBtn.onclick = function () {
    modal.style.display = "flex";
    bookForm.reset();
    editRow = null;
};

closeBtn.onclick = function () {
    modal.style.display = "none";
};

window.onclick = function (e) {
    if (e.target == modal) {
        modal.style.display = "none";
    }
};

bookForm.addEventListener("submit", async function(e){

    e.preventDefault();

    const book = {

        bookId: document.getElementById("bookId").value,
        title: document.getElementById("bookName").value,
        author: document.getElementById("author").value,
        category: document.getElementById("category").value,
        quantity: document.getElementById("quantity").value,
        available: document.getElementById("quantity").value

    };
console.log(book);
    if(editRow){


    const id = editRow.dataset.id;


    const response = await fetch(
        "/update-book/"+id,
        {

        method:"PUT",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify(book)

        });


    const result = await response.json();


    if(result.success){


        alert("Book Updated Successfully");


        modal.style.display="none";


        bookForm.reset();


        editRow=null;


        loadBooks();


    }


    return;


}

    const response = await fetch("/register-book", {   // 👈 YE LINE
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(book)
    });

    console.log(response.status);

    if(response.ok){

        alert("Book Added Successfully");

        modal.style.display="none";

        bookForm.reset();

        loadBooks();

    }

});


const searchInput = document.getElementById("searchBook");

searchInput.addEventListener("keyup", function () {

    const filter = this.value.toLowerCase();

    const rows = document.querySelectorAll("tbody tr");

    rows.forEach(function (row) {

        const bookName = row.cells[1].innerText.toLowerCase();

        const author = row.cells[2].innerText.toLowerCase();

        const category = row.cells[3].innerText.toLowerCase();

        if (
            bookName.includes(filter) ||
            author.includes(filter) ||
            category.includes(filter)
        ) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }

    });

});

document.querySelectorAll("tbody tr").forEach(function(row){

    attachEvents(row);

});

updateStats();

const viewModal = document.getElementById("viewModal");
const viewClose = document.querySelector(".view-close");

const images = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-V-XjPyLMqn-z9tofTtbOJUG8fDjOhIfTtWWJmHzpVbzYEo2Zgy3sHoQ&s=10",
    "https://m.media-amazon.com/images/I/71cHGKNgKnL._AC_UF1000,1000_QL80_.jpg",
    "https://ecampusontario.pressbooks.pub/app/uploads/sites/4483/2025/02/cover.jpg",
    "https://m.media-amazon.com/images/I/61xYvZN9XyL._AC_UF1000,1000_QL80_.jpg"
];

const viewButtons = document.querySelectorAll(".view-btn");

viewButtons.forEach(function(btn,index){

    btn.addEventListener("click",function(){

        const row=document.querySelectorAll("tbody tr")[index];

        document.getElementById("viewImage").src=images[index];

        document.getElementById("viewId").innerText=row.cells[0].innerText;
        document.getElementById("viewTitle").innerText=row.cells[1].innerText;
        document.getElementById("viewAuthor").innerText=row.cells[2].innerText;
        document.getElementById("viewCategory").innerText=row.cells[3].innerText;
        document.getElementById("viewQuantity").innerText=row.cells[4].innerText;
        document.getElementById("viewStatus").innerText=row.cells[5].innerText;

        viewModal.style.display="flex";

    });

});

viewClose.onclick=function(){

    viewModal.style.display="none";

}

window.addEventListener("click",function(e){

    if(e.target==viewModal){

        viewModal.style.display="none";

    }

});

const categoryCards = document.querySelectorAll(".service-box");

categoryCards.forEach(function(card){

    card.addEventListener("click",function(){

        const category=this.dataset.category;

        const rows=document.querySelectorAll("tbody tr");

        rows.forEach(function(row){

            if(row.cells[3].innerText===category){

                row.style.display="";

            }else{

                row.style.display="none";

            }

        });

    });

});

document.getElementById("showAllBooks").addEventListener("click",function(){

    document.querySelectorAll("tbody tr").forEach(function(row){

        row.style.display="";

    });

});

const sortSelect = document.getElementById("sortBooks");

sortSelect.addEventListener("change", function () {

    const tbody = document.getElementById("bookTableBody");

    const rows = Array.from(tbody.querySelectorAll("tr"));

    rows.sort(function(a, b){

        const nameA = a.cells[1].innerText.toLowerCase();
        const nameB = b.cells[1].innerText.toLowerCase();

        if(sortSelect.value==="az"){

            return nameA.localeCompare(nameB);

        }

        if(sortSelect.value==="za"){

            return nameB.localeCompare(nameA);

        }

    });

    rows.forEach(function(row){

        tbody.appendChild(row);

    });

});

document.getElementById("downloadBooks").addEventListener("click",function(){

    let csv="Book ID,Book Name,Author,Category,Quantity,Status\n";

    document.querySelectorAll("tbody tr").forEach(function(row){

        let data=[];

        row.querySelectorAll("td").forEach(function(cell,index){

            if(index<6){

                data.push(cell.innerText.trim());

            }

        });

        csv+=data.join(",")+"\n";

    });

    const blob=new Blob([csv],{type:"text/csv"});

    const url=window.URL.createObjectURL(blob);

    const a=document.createElement("a");

    a.href=url;

    a.download="LibraryBooks.csv";

    a.click();

});

async function loadBooks(){

    const response=await fetch("/books-data");

    const books=await response.json();

    const tbody=document.querySelector("tbody");

    tbody.innerHTML="";

    books.forEach(book=>{

        tbody.innerHTML+=`

        <tr data-id="${book._id}">

        <td>${book.bookId}</td>

        <td>${book.title}</td>

        <td>${book.author}</td>

        <td>${book.category}</td>

        <td>${book.quantity}</td>

        <td>

        <span class="available">

        Available

        </span>

        </td>

        <td>

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

      document.querySelectorAll("tbody tr")
    .forEach(function(row){

        attachEvents(row);

    });


    updateStats();

}

loadBooks();
