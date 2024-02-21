const nodemailer = require("nodemailer")
const petsCollection = require("../db").db().collection("pets")
const { ObjectId } = require("mongodb")
const sanitizeHtml = require("sanitize-html")

const sanitizeOptions = {
    allowedTags: [],
    allowedAttributes: {}
}

exports.submitContact = async function (req, res) {
    if (req.body.secret.toUpperCase() !== "PUPPY") {
        console.log("Spam detected")
        return res.json({ message: 'Invalid secret' })
    }

    if (!ObjectId.isValid(req.body.petId)) {
        console.log("/invalid id detected")
        return res.json({ message: 'Invalid id' })
    }

    const doesPetExist = await petsCollection.findOne({ _id: new ObjectId(req.body.petId) })

    if (!doesPetExist) {
        console.log("Pet does not exist")
        return res.json({ message: 'Invalid Pet' })
    }

    const ourObject = {
        name: sanitizeHtml(req.body.name, sanitizeOptions),
        email: sanitizeHtml(req.body.email, sanitizeOptions),
        comment: sanitizeHtml(req.body.comment, sanitizeOptions)
    }

    console.log(ourObject)

    var transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: process.env.MAILTRAPUSERNAME,
            pass: process.env.MAILTRAPPASSWORD
        }
    })

    transport.sendMail({
        to: ourObject.email,
        from: "supprot@localhost.com",
        subject: `Thank you for your interest in ${doesPetExist.name}.`,
        html: `<h3 style ="color: purple; font-size: 30px; font-weight: normal;">Thank You!</h3>
        <p>We appreciate your interest in ${doesPetExist.name} and one of our staff members will reach out to you shortly! Below is the copy of the message you just sent us for your personal records:</p>
        <p><em>${ourObject.comment}</em></p>
        `
    })

    transport.sendMail({
        to: ourObject.email,
        from: "supprot@localhost.com",
        subject: `Someone is interested in ${doesPetExist.name}.`,
        html: `<h3 style ="color: purple; font-size: 30px; font-weight: normal;">New Contact!</h3>
        <p>Name: ${ourObject.name} <br>
        Pet interested in: ${doesPetExist.name} <br>
        Email: ${ourObject.email} <br>
        Message: <em>${ourObject.comment}</em></p>
        `
    })

    res.send("THanks for sending the data to us!")
}