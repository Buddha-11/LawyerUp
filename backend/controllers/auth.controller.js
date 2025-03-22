import User  from '../models/user.model.js'
export const registerUser = async (req, res) => {
    console.log("register hit");
    
    const { firebaseId, email ,type} = req.body;
    try {
        let user = await User.findOne({ firebaseId });
        if (!user) {
            user = new User({ firebaseId, email ,type});
            await user.save();
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error });
    }
};

export const updateProfile = async (req, res) => {
    const { firebaseId, name, age, gender, location, coordinates, photoURL } = req.body;
  
    try {
      const user = await User.findOneAndUpdate(
        { firebaseId },
        {
          name,
          age,
          gender,
          location,
          photoURL,
          ...(coordinates && {
            location: {
              type: "Point",
              coordinates: [coordinates[1], coordinates[0]] // [longitude, latitude]
            }
          }),
        },
        { new: true }
      );
      res.status(200).json(user);
      
    } catch (error) {
      res.status(500).json({ message: "Error updating profile", error });
    }
  };
  

export const updateLawyerProfile = async (req, res) => {
    try {
        const { firebaseId } = req.params;
        const { name, age, gender, location, photoURL, yearsOfExperience, qualification, degreeImageURL } = req.body;

        // Find and update the lawyer profile
        const updatedLawyer = await User.findOneAndUpdate(
            { firebaseId, type: "lawyer" }, // Ensure only lawyers can update
            { name, age, gender, location, photoURL, yearsOfExperience, qualification, degreeImageURL },
            { new: true, runValidators: true }
        );

        if (!updatedLawyer) {
            return res.status(404).json({ message: "Lawyer not found or unauthorized" });
        }

        res.json({ message: "Profile updated successfully", lawyer: updatedLawyer });
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ message: "Error updating profile", error });
    }
};