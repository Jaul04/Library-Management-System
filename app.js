require("dotenv").config();

console.log("MONGO_URI =", process.env.MONGO_URI);
console.log("STUDENT_MONGO_URI =", process.env.STUDENT_MONGO_URI);

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');

const app = express();


app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("Public")); 
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true
}));


mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));


const studentDB = mongoose.createConnection(
    process.env.STUDENT_MONGO_URI
);

studentDB.on('connected',()=>{
    console.log("Student Database Connected");
});


const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});
const User = mongoose.model('User', userSchema);

const studentSchema = new mongoose.Schema({

    studentId:String,
    name:String,
    email:String,
    mobile:String,
    department:String,
    year:String,
    rollNo:String

});




const Student = studentDB.model(
    "Student",
    studentSchema
);

const bookSchema = new mongoose.Schema({

    bookId: String,

    title: String,

    author: String,

    category: String,

    quantity: Number,

    available: Number

});

const Book = mongoose.model("Book", bookSchema);

const issueSchema = new mongoose.Schema({

    studentId: String,

    studentName: String,

    bookId: String,

    bookTitle: String,

    issueDate: Date,

    dueDate: Date,

    returnDate: Date,

    fine: {

        type: Number,

        default: 0

    },

    status: {

        type: String,

        default: "Issued"

    }

});

const Issue = mongoose.model("Issue", issueSchema);


app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public/signup.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public/login.html'));
});
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public/home.html'));
});

app.get('/students', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public/students.html'));
});

app.post('/api/signup', async (req, res) => {
  try {
    console.log("✅ Signup request received");
    console.log("Data from form:", req.body);

    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("⚠️ User already exists");
      return res.send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    console.log("✅ User inserted:", user);
    res.send("Signup successful!");
  } catch (err) {
    console.error("❌ Error during signup:", err);
    res.status(500).send("Server error");
  }
});


app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.send("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.send("Incorrect password");

    req.session.userId = user._id;
    res.send("Login successful!");
});

app.post("/register-student", async (req, res) => {

    try {

        const student = new Student(req.body);

        await student.save();

        console.log("Student Added:", student);

        res.json({
            success: true
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false
        });

    }

});

app.get("/students-data", async (req, res) => {

    try {

        const students = await Student.find();

        res.json(students);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});

app.post("/register-book", async (req,res)=>{

    try{

        const book = new Book(req.body);

        await book.save();

        console.log("Book Added :",book);

        res.json({
            success:true
        });

    }

    catch(err){

        console.log(err);

        res.status(500).json({
            success:false
        });

    }

});

app.get("/books-data", async (req, res) => {

    try {

        const books = await Book.find();

        res.json(books);

    }

    catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});

app.get("/issued-books", async (req, res) => {

    try {

        const issues = await Issue.find();

        res.json(issues);

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

});

app.get("/issue/:id", async (req, res) => {

    try {

        const issue = await Issue.findById(req.params.id);

        res.json(issue);

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

});

app.put("/return-book/:id", async (req, res) => {

    try {

        const issue = await Issue.findById(req.params.id);

        if (!issue) {

            return res.status(404).json({

                message: "Issue Not Found"

            });

        }

        issue.returnDate = req.body.returnDate;

        issue.fine = req.body.fine;

        issue.status = "Returned";

        await issue.save();

        const book = await Book.findOne({

            bookId: issue.bookId

        });

        if (book) {

            book.available += 1;

            await book.save();

        }

        res.json({

            success: true

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

app.get("/returned-books", async (req, res) => {

    try {

        const issues = await Issue.find();

        res.json(issues);

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

});


app.delete("/delete-issue/:id", async (req, res) => {

    try {

        const issue = await Issue.findById(req.params.id);

        if (!issue) {

            return res.status(404).json({
                success: false
            });

        }

        const book = await Book.findOne({
            bookId: issue.bookId
        });

        if (book) {

            book.available += 1;

            await book.save();

        }

        await Issue.findByIdAndDelete(req.params.id);

        res.json({
            success: true
        });

    }

    catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

app.put("/update-issue/:id", async (req, res) => {

    try {

        const issue = await Issue.findById(req.params.id);

        if (!issue) {

            return res.status(404).json({
                success: false
            });

        }

        issue.studentId = req.body.studentId;
        issue.studentName = req.body.studentName;
        issue.bookId = req.body.bookId;
        issue.bookTitle = req.body.bookTitle;
        issue.issueDate = req.body.issueDate;
        issue.dueDate = req.body.dueDate;

        await issue.save();

        res.json({
            success: true
        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});



app.get("/students-data", async (req,res)=>{

    try{

        const students = await Student.find();

        res.json(students);

    }catch(err){

        res.status(500).json({
            message:err.message
        });

    }

});

app.get("/dashboard-data", async (req, res) => {

    try {

        const totalBooks = await Book.countDocuments();

        const totalStudents = await Student.countDocuments();

        const issuedBooks = await Issue.countDocuments({
            status: "Issued"
        });

        const returnedBooks = await Issue.countDocuments({
            status: "Returned"
        });

        const books = await Book.find();

        let availableBooks = 0;

        books.forEach(book => {

            availableBooks += book.available;

        });

        res.json({

            totalBooks,

            totalStudents,

            issuedBooks,

            returnedBooks,

            availableBooks

        });

    }

    catch(err){

        res.status(500).json({

            message: err.message

        });

    }

});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/Public/login.html");
});


const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
