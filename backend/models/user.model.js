import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firebaseId: { type: String, required: true, unique: true },
    name: { type: String, default: "User" },
    age: { type: Number },
    gender: { type: String },
    location: {
      type: {
        type: String,
        enum: ['Point'], // This is required for GeoJSON
        default: 'Point'
      },
      coordinates: { // Stores latitude and longitude
        type: [Number],
        required: true
      }
    },
    email: { type: String, required: true, unique: true },
    photoURL: { type: String, default: "default_image_url" },
    type: { type: String, enum: ["user", "lawyer", "admin"] },
    
    // Lawyer-Specific Fields
    yearsOfExperience: { type: Number, default: 0 },
    qualification: { type: String, default: "" },
    degreeImageURL: { type: String, default: "" }, // Stores Firestore URL of degree certificate
  }, { timestamps: true });
  
  // Add a 2dsphere index for geospatial queries
  UserSchema.index({ location: '2dsphere' });
  
  const User = mongoose.model("User", UserSchema);
  export default User;