


class DisplayStatus{
    static displayStatus  = async(req,res)=>{
        try {
          const {display_status,display_id} = req.body;
          if(!display_status){
            return res.status(400).json({
              status:false,
              message:"Error"
            })
          }
          console.log(display_status)
    
          return res.status(200).json({
            status:true,
            message:"Data uploaded successfuly"
          })
        } catch (error) {
          
        }
      }
    
}

export default DisplayStatus;