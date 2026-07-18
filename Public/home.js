async function loadDashboard() {

    try {

        const response = await fetch("/dashboard-data");

        const data = await response.json();

        document.getElementById("totalBooks").innerText =
        data.totalBooks;

        document.getElementById("totalStudents").innerText =
        data.totalStudents;

        document.getElementById("issuedBooks").innerText =
        data.issuedBooks;

        document.getElementById("returnedBooks").innerText =
        data.returnedBooks;

        document.getElementById("availableBooks").innerText =
        data.availableBooks;

    }

    catch(err){

        console.log(err);

    }

}

loadDashboard();

const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", async function(e){

    e.preventDefault();

    const response = await fetch("/contact",{

        method:"POST",

        headers:{

            "Content-Type":"application/json"

        },

        body:JSON.stringify({

            name:document.getElementById("contactName").value,

            email:document.getElementById("contactEmail").value,

            message:document.getElementById("contactMessage").value

        })

    });

    const result = await response.json();

    if(result.success){

        alert("Message Sent Successfully");

        contactForm.reset();

    }

    else{

        alert(result.message);

    }

});
