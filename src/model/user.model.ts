import { Schema,models,model,Document } from "mongoose";
import bcrypt from "bcryptjs";


export interface IUser extends Document {
    name?: string;
    username?: string;
    email: string;
    password: string;
    avatar?: string;
    bio?: string;
    banner?: string;
}

const userSchema = new Schema<IUser>({
    name:{
        type:String,
    },
    username:{
        type:String,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    avatar:{
        type:String
    },
    bio:{
        type:String
    },
    banner:{
        type:String
    }
},{ timestamps:true });

userSchema.pre("save", async function () {
    if(!this.isModified("password")) return;
    this.password = bcrypt.hashSync(this.password, 10);
});

export const User = models.User || model<IUser>("User",userSchema);