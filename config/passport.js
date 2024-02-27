import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user-model";
import LocalStrategy from "passport-local";
import bcrypt from "bcrypt";

passport.serializeUser((user, done) => {
  console.log("serialize使用者...");
  done(null, user._id); // 將mongoDB的id存在內部 並且將id簽名後，以cookie的形式給使用者
});

passport.deserializeUser(async (_id, done) => {
  console.log(
    "deserilize使用者...使用serializUser儲存的id，去找到資料庫內的資料"
  );
  let foundUser = await User.findOne({ _id });
  done(null, foundUser); // 將req.user這個屬性設為user;
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:4000/auth/google/redirect",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("進入google Strategy區域");
      console.log(profile);
      console.log("========================");
      let foundUser = await User.findOne({ googleID: profile.id }).exec();
      if (foundUser) {
        console.log("使用者已註冊，無須註冊");
        done(null, foundUser);
      } else {
        console.log("偵測新用戶，須將資料存入資料庫內");
        let newUser = new User({
          name: profile.displayName,
          googleID: profile.id,
          thumbnail: profile.photos[0].value,
          email: profile.emails[0].value,
        });
        let savedUser = await newUser.save();
        console.log("成功創建新用戶");
        done(null, savedUser);
      }
    }
  )
);

passport.use(
  new LocalStrategy(async (username, password, done) => {
    let foundUser = await User.findOne({ email: username });
    if (foundUser) {
      let result = await bcrypt.compare(password, foundUser.password);
      if (result) {
        done(null, foundUser);
      } else {
        done(null, false);
      }
    } else {
      done(null, false);
    }
  })
);

export default passport;
