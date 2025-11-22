exports.isAuth = async(req, res, next) => {
    try{
        const token = req.body?.token || req.cookies?.sweetToken || req.headers.authorization?.split(' ')[1]
        if(!token){
            return res.status(400).json({
                message:'Not Logged in'
            })
        }

        next()
    }
    catch(e){
        res.status(500).json({
            message:"(isAuth) Something went wrong",
        })
    }
}