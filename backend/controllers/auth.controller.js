import User  from '../models/user.model.js'
const authenticateUser = async (req, res) => {
    try {
        const { firebaseId, name, email, photoURL } = req.body;

        let user = await User.findOne({ firebaseId });

        if (!user) {
            user = new User({
                firebaseId,
                name,
                email,
                photoPathFirestore: photoURL || undefined,
            });
            await user.save();
        }

        res.status(200).json({ message: 'User authenticated', user });
    } catch (error) {
        console.error("Auth error:", error);
        res.status(500).json({ message: 'Server error', error });
    }
};

export default authenticateUser ;
