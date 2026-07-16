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