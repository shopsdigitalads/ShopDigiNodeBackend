import jwt from 'jsonwebtoken'

class Middleware{
    static vefigyToken = (token)=>{
        return jwt.verify(token,process.env.JWT_TOKEN)
    }

    static authentiateRequest = (req, res, next) => {
            if (req.path.startsWith('/auth')) {
                return next();
            }    
            const token = (req.headers['authorization']).replace("Bearer ", "");
            if (!token) {
                return res.status(403).json({
                    message:'A token is required for authentication'
            });
            }
            try {
                const decoded = Middleware.vefigyToken(token);
                console.log(decoded)
                if(decoded.new_user){
                    if(req.url === decoded.allowd_route && req.method === decoded.type){
                        next();
                    }else{
                        return res.status(401).send('Invalid Token');
                    }
                   
                }else{
                    req.role = decoded.role;
                    req.mobile = decoded.mobile;
                    if(decoded.role == "Employee"){
                        req.emp_id = decoded.emp_id
                    }else{
                        req.user_id = decoded.user_id
                    } 
                    next();
                }
              
            } catch (err) {
                return res.status(401).send('Invalid Token');
            }
           
        }

    static logRouteAndType = (req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
    }
}


export default Middleware;
// verifyjwt - return payload

