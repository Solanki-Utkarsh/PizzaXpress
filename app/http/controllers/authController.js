const User = require('../../models/user');
const bcrypt = require('bcrypt');
const passport = require('passport');

function authController(){
    const _getRedirectUrl = (req) =>{
        return req.user.role ==='admin'? '/admin/orders': '/customer/orders'
    }
    return {
        login(req,res) {
            res.render('auth/login');
        },
        postLogin(req, res, next){
            passport.authenticate('local', (err, user, info ) =>{
                if(err) {
                    req.flash('error', info.message)
                    return next(err)
                } 
                if(!user) {
                    req.flash('error', info.message);
                    return res.redirect('/login');

                }
                req.logIn(user, (err) =>{
                    if(err) {
                        req.flash('error', info.message);
                        return next(err);
                    }
                    return res.redirect(_getRedirectUrl(req))
                    
                })
            })(req, res, next)

        },
        register(req,res) {
            res.render('auth/register');
        }, 
        async postRegister(req, res) {
            const { name, email, password } = req.body;
            //validate request
            if(!name || !email || !password) {
                req.flash('error', 'All fields are required');
                req.flash('name', name)
                req.flash('email', email)
                return res.redirect('/register');
            }

            //check if email exists
            const userExist = await User.findOne({email: email});
            if(userExist){
                req.flash('error', 'Email already taken')
                req.flash('name', name)
                req.flash('email', email)
                return res.redirect('/register');
            }
            // User.exists({ email: email}, (err, result) => {
            //     if(result){
            //         // req.flash('error', 'Email already taken')
            //         // req.flash('name', name)
            //         // req.flash('email', email)
            //         return res.redirect('/register');
            //     }
                
                
            // })

            //hash password
            const hashedPassword = await bcrypt.hash(password, 10)
            //Create a user
            const user = new User({
                name,
                email,
                password: hashedPassword
            })

            user.save().then((user) =>{
                //Login the user

                return res.redirect('/');
            }).catch(err =>{
                req.flash('error', 'Something Went Wrong')
                return res.redirect('/register');
            })

            console.log(req.body);

        },
        logout(req, res){
            //passport se logout ho jaega
            // req.logout();
            // return res.redirect('/login');

            req.logout(function(err){
                if(err){return next(err);}
                res.redirect('/');
            })

        }

    }
}

module.exports = authController