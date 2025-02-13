import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firebaseId: { type: String, required: true, unique: true },
    name: { type: String, default: "User" },
    age: { type: Number },
    gender: { type: String },
    location: { type: String },
    email: { type: String, required: true, unique: true },
    photoURL: { type: String, default: "default_image_url" },
    type: { 
        type: String, 
        enum: ["user", "lawyer", "admin"]
    },

    // Lawyer-Specific Fields
    yearsOfExperience: { type: Number, default: 0 },
    qualification: { type: String, default: "" },
    degreeImageURL: { type: String, default: "" }, // Stores Firestore URL of degree certificate
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);
export default User;
