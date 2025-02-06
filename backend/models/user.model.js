import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    firebaseId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    photoPathFirestore: {
        type: String,
        required: true,
        default: "https://firebasestorage.googleapis.com/v0/b/ecobloom-gdsc-challenge.appspot.com/o/user%2Funknown.jpg?alt=media&token=cbde7ca9-e356-4d34-90f7-1204eadff19d",
    },
});

const User = mongoose.model('User', UserSchema);
export default User;
