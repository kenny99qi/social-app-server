import passport, {Profile} from 'passport'


passport.serializeUser((user: any, done) => {
    done(null, user)
})

passport.deserializeUser((user: any, done) => {
    done(null, user)
})

export default passport

