const cron = require("node-cron");
const nodemailer = require("nodemailer");
const axios = require("axios");
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

     studentEmail: String,

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

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendDueDateReminder(){

    try{

        const today = new Date();

const reminderDate = new Date(today);

reminderDate.setDate(today.getDate() + 2);


reminderDate.setHours(0, 0, 0, 0);


const nextDay = new Date(reminderDate);
nextDay.setDate(nextDay.getDate() + 1);


        const issues = await Issue.find({

            status:"Issued",

           dueDate: {
    $gte: reminderDate,
    $lt: nextDay
}
        });
        console.log("Today's Date:", today);

console.log("Reminder Date:", reminderDate);

console.log("Total Issues Found:", issues.length);

console.log("Issues:", issues);


        for(let issue of issues){


            await transporter.sendMail({

                from: process.env.EMAIL_USER,

                to: issue.studentEmail,

                subject:"Library Book Return Reminder",

                text:
`Hello ${issue.studentName},

Your book "${issue.bookTitle}" is due on ${issue.dueDate.toDateString()}.

Please return the book on time to avoid fine.

Thank You
LibraryMS`

            });


            console.log(
                "Reminder sent to:",
                issue.studentEmail
            );


        }


    }
    catch(err){

        console.log(
            "Reminder Error:",
            err.message
        );

    }

}

const contactSchema = new mongoose.Schema({

    name: String,

    email: String,

    message: String,

    createdAt: {

        type: Date,

        default: Date.now

    }

});

async function sendSMS(number,message){

    try{

        const response = await axios.post(
            "https://www.fast2sms.com/dev/bulkV2",
            {
                route:"q",
                message:message,
                numbers:number
            },
            {
                headers:{
                    authorization:"Fcr3NKsQphfkTb2dzyCgZqBui7IRl9eDOGmJ6nvXSAH814tw0aXp8xealQ5KA6gwcikLNqumFOCtEU4B",
                    "Content-Type":"application/json"
                }
            }
        );


        console.log(response.data);

    }
  catch(err){

    console.log("SMS ERROR:");

    console.log(err.response?.data);

}

}

const Contact = mongoose.model("Contact", contactSchema);


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
app.delete("/delete-student/:id", async(req,res)=>{

    try{

        const student = await Student.findOneAndDelete({
            studentId:req.params.id
        });


        if(!student){

            return res.status(404).json({

                success:false,

                message:"Student not found"

            });

        }


        res.json({

            success:true,

            message:"Student deleted successfully"

        });


    }
    catch(err){

        console.log(err);

        res.status(500).json({

            success:false,

            message:err.message

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


app.put("/update-book/:id", async(req,res)=>{


    try{


        const book = await Book.findByIdAndUpdate(

            req.params.id,

            {

                bookId:req.body.bookId,

                title:req.body.title,

                author:req.body.author,

                category:req.body.category,

                quantity:req.body.quantity,

                available:req.body.available

            },

            {
                new:true
            }

        );


        if(!book){

            return res.status(404).json({

                success:false,

                message:"Book not found"

            });

        }


        res.json({

            success:true,

            message:"Book updated successfully",

            book

        });


    }

    catch(err){


        console.log(err);


        res.status(500).json({

            success:false,

            message:err.message

        });


    }


});

app.delete("/delete-book/:id", async(req,res)=>{

    try{

        const book = await Book.findByIdAndDelete(req.params.id);


        if(!book){

            return res.status(404).json({

                success:false,

                message:"Book not found"

            });

        }


        res.json({

            success:true,

            message:"Book deleted successfully"

        });


    }
    catch(err){

        console.log(err);

        res.status(500).json({

            success:false,

            message:err.message

        });

    }

});

app.post("/issue-book", async (req, res) => {

    try {

        const issue = new Issue(req.body);

        await issue.save();

        const book = await Book.findOne({
            bookId: req.body.bookId
        });

        if (book) {

            if (book.available <= 0) {

                return res.json({
                    success: false,
                    message: "Book not available"
                });

            }

            book.available -= 1;

            await book.save();

        }

        res.json({
            success: true
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
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

app.get("/test-email", async(req,res)=>{

    try{

        await transporter.sendMail({

            from: process.env.EMAIL_USER,

            to: "ansarjaul555@gmail.com",

            subject: "Library Management System Test",

            text: "Email notification working successfully."

        });


        res.json({
            success:true,
            message:"Email Sent Successfully"
        });


    }
    catch(err){

        console.log("Email Error:",err);

        res.status(500).json({
            success:false,
            message:err.message
        });

    }

});


app.post("/contact", async (req, res) => {

    try {

        const contact = new Contact({

            name: req.body.name,

            email: req.body.email,

            message: req.body.message

        });

        await contact.save();

        res.json({

            success: true,

            message: "Message Sent Successfully"

        });

    }

    catch(err){

        res.status(500).json({

            success: false,

            message: err.message

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

app.get("/test-sms",(req,res)=>{

    sendSMS(
        "YOUR_MOBILE_NUMBER",
        "Library reminder: Your book due date is near."
    );

    res.send("SMS sent");

});

app.get("/send-reminders", async(req,res)=>{

    await sendDueDateReminder();

    res.json({

        success:true,

        message:"Reminder process completed"

    });

});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/Public/login.html");
});


cron.schedule("* * * * *", async () => {

    console.log("Running Daily Reminder...");

    await sendDueDateReminder();

});

console.log("Cron Job Started...");

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
