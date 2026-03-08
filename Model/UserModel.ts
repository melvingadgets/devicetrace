import mongoose from "mongoose";
interface user {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  avatar?: string; 
  isVerified: boolean;
  role: "user" | "admin";
  favorites?: mongoose.Types.ObjectId[]; 
  createdAt: Date;
  updatedAt: Date;
}


interface Iuser extends user, mongoose.Document {}
const UserSchema = new mongoose.Schema({
  FirstName: {
    type: String,
  },
  LastName: {
    type: String,
  },
  Email: {
    type: String,
  },
  Password: {
    type: String,
  },
  Profile: {
    type: mongoose.Types.ObjectId,
    ref: "profile",
  },
  Verify: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["User", "StoreOwner", "Admin"],
    default: "User",
  },
});
export default mongoose.model<Iuser>("user", UserSchema);
